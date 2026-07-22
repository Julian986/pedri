import { NextRequest, NextResponse } from 'next/server';

import { mercadoPagoRequest, verifyMercadoPagoSignature } from '@/lib/mercadopago';
import dbConnect from '@/lib/mongodb';
import Reserva from '@/models/Reserva';
import ReservaHold from '@/models/ReservaHold';

export const runtime = 'nodejs';

type MercadoPagoPayment = {
  id: number;
  status: string;
  external_reference?: string;
  transaction_amount: number;
  currency_id: string;
  date_approved?: string;
};

async function processWebhook(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const queryDataId =
    request.nextUrl.searchParams.get('data.id') ||
    request.nextUrl.searchParams.get('id') ||
    '';
  const dataId = queryDataId || String(body?.data?.id || '');
  const type = request.nextUrl.searchParams.get('type') || body?.type || body?.topic;

  if (!dataId || (type && type !== 'payment')) {
    return NextResponse.json({ ok: true });
  }

  const valid = verifyMercadoPagoSignature({
    dataId,
    requestId: request.headers.get('x-request-id'),
    signature: request.headers.get('x-signature'),
  });
  if (!valid) {
    console.warn('[Mercado Pago webhook] Firma inválida');
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
  }

  const payment = await mercadoPagoRequest<MercadoPagoPayment>(`/v1/payments/${dataId}`);
  if (!payment.external_reference) return NextResponse.json({ ok: true });

  await dbConnect();
  const reserva = await Reserva.findById(payment.external_reference);
  if (!reserva) return NextResponse.json({ ok: true });

  // La fuente de verdad del monto siempre es nuestra base, no el payload del webhook.
  const amountMatches =
    payment.currency_id === (reserva.moneda || 'ARS') &&
    Math.abs(Number(payment.transaction_amount) - Number(reserva.precioTotal)) < 0.01;
  if (!amountMatches) {
    console.error('[Mercado Pago webhook] Monto/moneda no coincide', {
      paymentId: payment.id,
      reservaId: String(reserva._id),
    });
    return NextResponse.json({ error: 'Monto inválido' }, { status: 409 });
  }

  const paymentId = String(payment.id);
  if (payment.status === 'approved') {
    await Reserva.updateOne(
      {
        _id: reserva._id,
        $or: [
          { pagoEstado: { $ne: 'aprobado' } },
          { mercadoPagoPaymentId: paymentId },
        ],
      },
      {
        $set: {
          estado: 'confirmada',
          pagoEstado: 'aprobado',
          mercadoPagoPaymentId: paymentId,
          pagoAprobadoEn: payment.date_approved ? new Date(payment.date_approved) : new Date(),
        },
      },
    );
    await ReservaHold.deleteMany({ reservaId: reserva._id });
  } else if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(payment.status)) {
    const pagoEstado =
      payment.status === 'refunded' || payment.status === 'charged_back'
        ? 'reembolsado'
        : payment.status === 'rejected'
          ? 'rechazado'
          : 'cancelado';
    await Reserva.updateOne(
      { _id: reserva._id, pagoEstado: { $ne: 'aprobado' } },
      {
        $set: {
          estado: 'cancelada',
          pagoEstado,
          mercadoPagoPaymentId: paymentId,
        },
      },
    );
    await ReservaHold.deleteMany({ reservaId: reserva._id });
  } else {
    await Reserva.updateOne(
      { _id: reserva._id, pagoEstado: { $ne: 'aprobado' } },
      { $set: { pagoEstado: 'pendiente', mercadoPagoPaymentId: paymentId } },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  try {
    return await processWebhook(request);
  } catch (error) {
    console.error('[POST /api/mercadopago/webhook]', error);
    return NextResponse.json({ error: 'Error procesando notificación' }, { status: 500 });
  }
}
