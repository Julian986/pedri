import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reserva from '@/models/Reserva';
import { requireAuth } from '@/lib/middleware';

// GET - Obtener todas las reservas
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const propiedadId = searchParams.get('propiedadId');
    const estado = searchParams.get('estado');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    let query: any = {};

    if (propiedadId) {
      query.propiedadId = propiedadId;
    }

    if (estado) {
      query.estado = estado;
    }

    if (fechaInicio && fechaFin) {
      query.$or = [
        {
          fechaInicio: { $lte: new Date(fechaFin) },
          fechaFin: { $gte: new Date(fechaInicio) },
        },
      ];
    }

    const reservas = await Reserva.find(query)
      .populate('propiedadId', 'nombre direccion ciudad')
      .sort({ fechaInicio: -1 });

    return NextResponse.json({ reservas });
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    return NextResponse.json(
      { error: 'Error obteniendo reservas' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva reserva
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await dbConnect();

    const data = await request.json();

    // Verificar disponibilidad
    const conflicto = await Reserva.findOne({
      propiedadId: data.propiedadId,
      estado: { $nin: ['cancelada'] },
      $or: [
        {
          fechaInicio: { $lte: new Date(data.fechaFin) },
          fechaFin: { $gte: new Date(data.fechaInicio) },
        },
      ],
    });

    if (conflicto) {
      return NextResponse.json(
        { error: 'La propiedad no está disponible en esas fechas' },
        { status: 400 }
      );
    }

    const reserva = await Reserva.create(data);

    return NextResponse.json(
      { reserva },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creando reserva:', error);
    return NextResponse.json(
      { error: 'Error creando reserva' },
      { status: 500 }
    );
  }
}

