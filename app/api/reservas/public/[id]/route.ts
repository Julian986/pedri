import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

import dbConnect from '@/lib/mongodb';
import Reserva from '@/models/Reserva';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Reserva inválida' }, { status: 400 });
  }

  await dbConnect();
  const reserva = await Reserva.findById(params.id)
    .select('estado pagoEstado nombreHuesped fechaInicio fechaFin precioTotal propiedadId')
    .populate('propiedadId', 'nombre')
    .lean();
  if (!reserva) {
    return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
  }

  const propiedad = reserva.propiedadId as unknown as { nombre?: string } | null;
  return NextResponse.json({
    id: String(reserva._id),
    estado: reserva.estado,
    pagoEstado: reserva.pagoEstado || null,
    propiedad: propiedad?.nombre || '',
    nombreHuesped: reserva.nombreHuesped,
    fechaInicio: reserva.fechaInicio.toISOString().slice(0, 10),
    fechaFin: reserva.fechaFin.toISOString().slice(0, 10),
    precioTotal: reserva.precioTotal,
  });
}
