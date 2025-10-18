import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reserva from '@/models/Reserva';
import { requireAuth } from '@/lib/middleware';

// GET - Obtener una reserva por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const reserva = await Reserva.findById(params.id)
      .populate('propiedadId', 'nombre direccion ciudad precioPorNoche');

    if (!reserva) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ reserva });
  } catch (error) {
    console.error('Error obteniendo reserva:', error);
    return NextResponse.json(
      { error: 'Error obteniendo reserva' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar reserva
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await dbConnect();

    const data = await request.json();

    const reserva = await Reserva.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    );

    if (!reserva) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ reserva });
  } catch (error) {
    console.error('Error actualizando reserva:', error);
    return NextResponse.json(
      { error: 'Error actualizando reserva' },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar reserva
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await dbConnect();

    const reserva = await Reserva.findByIdAndUpdate(
      params.id,
      { estado: 'cancelada' },
      { new: true }
    );

    if (!reserva) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Reserva cancelada correctamente' });
  } catch (error) {
    console.error('Error cancelando reserva:', error);
    return NextResponse.json(
      { error: 'Error cancelando reserva' },
      { status: 500 }
    );
  }
}

