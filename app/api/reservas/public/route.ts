import { NextRequest, NextResponse } from 'next/server';
/**
 * POST /api/reservas/public
 * Endpoint legado deshabilitado: una reserva pública solo puede crearse desde
 * el checkout, donde se calcula el precio en servidor y se genera el pago.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: 'Usá el checkout seguro para crear la reserva' },
    { status: 410 },
  );
}
