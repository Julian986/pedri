import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import dbConnect from '@/lib/mongodb';
import Propiedad from '@/models/Propiedad';
import Reserva from '@/models/Reserva';

function toMiddayUtcIso(ymd: string) {
  if (!ymd) return '';
  return new Date(`${ymd.slice(0, 10)}T12:00:00Z`).toISOString();
}

const bodySchema = z
  .object({
    propiedadId: z.string().min(1),
    nombreHuesped: z.string().trim().min(2).max(120),
    emailHuesped: z.string().trim().max(200).optional(),
    telefonoHuesped: z.string().trim().max(40).optional(),
    fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    numeroHuespedes: z.coerce.number().int().min(1).max(50),
  })
  .superRefine((data, ctx) => {
    const e = (data.emailHuesped || '').trim();
    if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['emailHuesped'],
        message: 'Email inválido',
      });
    }
  });

/**
 * POST /api/reservas/public
 * Alta desde el subdominio público. Estado `pendiente` hasta que Pedro confirme.
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const start = new Date(toMiddayUtcIso(data.fechaInicio));
    const end = new Date(toMiddayUtcIso(data.fechaFin));
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return NextResponse.json({ error: 'Las fechas no son válidas' }, { status: 400 });
    }

    const prop = await Propiedad.findOne({ _id: data.propiedadId, activo: true });
    if (!prop) {
      return NextResponse.json({ error: 'Alojamiento no disponible' }, { status: 404 });
    }

    if (typeof prop.capacidad === 'number' && prop.capacidad > 0 && data.numeroHuespedes > prop.capacidad) {
      return NextResponse.json(
        { error: `Este alojamiento admite hasta ${prop.capacidad} huéspedes` },
        { status: 400 },
      );
    }

    const conflicto = await Reserva.findOne({
      propiedadId: data.propiedadId,
      estado: { $nin: ['cancelada'] },
      fechaInicio: { $lt: end },
      fechaFin: { $gt: start },
    });

    if (conflicto) {
      return NextResponse.json(
        { error: 'Esas fechas ya no están disponibles. Elegí otro rango.' },
        { status: 409 },
      );
    }

    const precioPorNoche = Number(prop.base ?? prop.precioPorNoche ?? 0);
    const noches = Math.max(
      0,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const precioTotal = Math.round(precioPorNoche * noches);

    const email = (data.emailHuesped || '').trim();
    const reserva = await Reserva.create({
      propiedadId: data.propiedadId,
      nombreHuesped: data.nombreHuesped.trim(),
      emailHuesped: email || undefined,
      telefonoHuesped: (data.telefonoHuesped || '').trim() || undefined,
      fechaInicio: start,
      fechaFin: end,
      numeroHuespedes: data.numeroHuespedes,
      precioTotal,
      origen: 'Web',
      estado: 'pendiente',
      notas: 'Solicitud web (pendiente de confirmación)',
    });

    return NextResponse.json(
      { ok: true, id: String(reserva._id), precioTotal, noches },
      { status: 201 },
    );
  } catch (error) {
    console.error('[POST /api/reservas/public]', error);
    return NextResponse.json({ error: 'No se pudo registrar la solicitud' }, { status: 500 });
  }
}
