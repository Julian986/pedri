import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';

import { quoteBooking } from '@/lib/booking-pricing';
import { mercadoPagoRequest, publicBookingUrl } from '@/lib/mercadopago';
import dbConnect from '@/lib/mongodb';
import Propiedad from '@/models/Propiedad';
import Reserva from '@/models/Reserva';
import ReservaHold from '@/models/ReservaHold';

export const runtime = 'nodejs';

const schema = z.object({
  propiedadId: z.string().min(1),
  desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  huespedes: z.coerce.number().int().min(1).max(50),
  nombre: z.string().trim().min(2).max(80),
  apellido: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
  telefono: z.string().trim().min(6).max(40),
});

function middayUtc(ymd: string): Date {
  return new Date(`${ymd}T12:00:00.000Z`);
}

function bookedNights(desde: string, noches: number): string[] {
  const result: string[] = [];
  const date = middayUtc(desde);
  for (let index = 0; index < noches; index += 1) {
    result.push(date.toISOString().slice(0, 10));
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return result;
}

export async function POST(request: NextRequest) {
  let reservaId: mongoose.Types.ObjectId | null = null;
  try {
    const json = await request.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Revisá los datos ingresados', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await dbConnect();
    const data = parsed.data;
    const start = middayUtc(data.desde);
    const end = middayUtc(data.hasta);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
      return NextResponse.json({ error: 'El período no es válido' }, { status: 400 });
    }

    const propiedad = await Propiedad.findOne({ _id: data.propiedadId, activo: true }).lean();
    if (!propiedad) {
      return NextResponse.json({ error: 'El alojamiento ya no está disponible' }, { status: 404 });
    }
    const capacidad = Math.max(1, Number(propiedad.capacidad ?? 1));
    if (data.huespedes > capacidad) {
      return NextResponse.json(
        { error: `El alojamiento admite hasta ${capacidad} huéspedes` },
        { status: 400 },
      );
    }

    const quote = quoteBooking({
      desde: data.desde,
      hasta: data.hasta,
      huespedes: data.huespedes,
      capacidad,
      precioBaseNoche: Number(propiedad.base ?? propiedad.precioPorNoche ?? 0),
    });
    const now = new Date();
    const conflicto = await Reserva.exists({
      propiedadId: propiedad._id,
      estado: { $nin: ['cancelada'] },
      fechaInicio: { $lt: end },
      fechaFin: { $gt: start },
      $nor: [
        {
          estado: 'pendiente',
          pagoEstado: 'pendiente',
          pagoExpiraEn: { $lte: now },
        },
      ],
    });
    if (conflicto) {
      return NextResponse.json(
        { error: 'Esas fechas ya no están disponibles. Elegí otro período.' },
        { status: 409 },
      );
    }

    reservaId = new mongoose.Types.ObjectId();
    const pagoExpiraEn = new Date(Date.now() + 30 * 60 * 1000);
    const holdExpiraEn = new Date(Date.now() + 45 * 60 * 1000);

    // Un registro único por noche evita dos checkouts simultáneos para la misma propiedad.
    try {
      await ReservaHold.insertMany(
        bookedNights(data.desde, quote.noches).map((fecha) => ({
          propiedadId: propiedad._id,
          reservaId,
          fecha,
          expiresAt: holdExpiraEn,
        })),
        { ordered: true },
      );
    } catch (error: any) {
      await ReservaHold.deleteMany({ reservaId });
      if (error?.code === 11000) {
        return NextResponse.json(
          { error: 'Otra persona está reservando esas fechas. Intentá nuevamente en unos minutos.' },
          { status: 409 },
        );
      }
      throw error;
    }

    await Reserva.create({
      _id: reservaId,
      propiedadId: propiedad._id,
      nombreHuesped: `${data.nombre} ${data.apellido}`.trim(),
      emailHuesped: data.email.toLowerCase(),
      telefonoHuesped: data.telefono,
      fechaInicio: start,
      fechaFin: end,
      numeroHuespedes: data.huespedes,
      precioTotal: quote.total,
      origen: 'Web',
      estado: 'pendiente',
      pagoEstado: 'pendiente',
      pagoExpiraEn,
      moneda: 'ARS',
      notas: `Checkout web. Descuento aplicado: ${quote.descuentoTotalPct}%`,
    });

    const baseUrl = publicBookingUrl(request.url);
    const notificationUrl =
      process.env.MERCADOPAGO_WEBHOOK_URL?.trim() || `${baseUrl}/api/mercadopago/webhook`;
    const preference = await mercadoPagoRequest<{
      id: string;
      init_point: string;
      sandbox_init_point?: string;
    }>(
      '/checkout/preferences',
      {
        method: 'POST',
        body: JSON.stringify({
          items: [
            {
              id: String(propiedad._id),
              title: `Reserva ${propiedad.nombre}`,
              description: `${data.desde} al ${data.hasta} · ${quote.noches} noches`,
              category_id: 'travels',
              quantity: 1,
              currency_id: 'ARS',
              unit_price: quote.total,
            },
          ],
          payer: {
            name: data.nombre,
            surname: data.apellido,
            email: data.email.toLowerCase(),
            phone: { number: data.telefono },
          },
          external_reference: String(reservaId),
          notification_url: notificationUrl,
          back_urls: {
            success: `${baseUrl}/pago/exito?reserva=${reservaId}`,
            pending: `${baseUrl}/pago/pendiente?reserva=${reservaId}`,
            failure: `${baseUrl}/pago/error?reserva=${reservaId}`,
          },
          auto_return: 'approved',
          expires: true,
          expiration_date_from: now.toISOString(),
          expiration_date_to: pagoExpiraEn.toISOString(),
          statement_descriptor: 'PEDRI RESERVAS',
          metadata: { reserva_id: String(reservaId) },
        }),
      },
      String(reservaId),
    );

    await Reserva.updateOne(
      { _id: reservaId },
      { $set: { mercadoPagoPreferenceId: preference.id } },
    );

    return NextResponse.json({
      ok: true,
      reservaId: String(reservaId),
      checkoutUrl: preference.init_point,
      quote,
    });
  } catch (error) {
    console.error('[POST /api/mercadopago/preferencia]', error);
    if (reservaId) {
      await Promise.allSettled([
        Reserva.updateOne(
          { _id: reservaId, estado: 'pendiente' },
          { $set: { estado: 'cancelada', pagoEstado: 'cancelado' } },
        ),
        ReservaHold.deleteMany({ reservaId }),
      ]);
    }
    const message = error instanceof Error ? error.message : 'No se pudo iniciar el pago';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
