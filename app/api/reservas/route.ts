import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reserva from '@/models/Reserva';
// Importar para registrar el modelo y evitar MissingSchemaError en populate
import '@/models/Propiedad';


// GET - Obtener todas las reservas
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const propiedadId = searchParams.get('propiedadId');
    const estado = searchParams.get('estado');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let query: any = {};

    if (propiedadId) {
      query.propiedadId = propiedadId;
    }

    if (estado) {
      query.estado = estado;
    }

    const rangeStart = from || fechaInicio;
    const rangeEnd = to || fechaFin;
    if (rangeStart || rangeEnd) {
      const start = rangeStart ? new Date(rangeStart) : undefined;
      const end = rangeEnd ? new Date(rangeEnd) : undefined;
      if (start && end) {
        query.$or = [
          {
            fechaInicio: { $lte: end },
            fechaFin: { $gte: start },
          },
        ];
      } else if (start) {
        query.fechaFin = { $gte: start };
      } else if (end) {
        query.fechaInicio = { $lte: end };
      }
    }

    const reservas = await Reserva.find(query)
      .populate('propiedadId', 'nombre direccion ciudad comisionPorcentaje')
      .sort({ fechaInicio: -1 })
      .lean();

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
    await dbConnect();

    const data = await request.json();
    const start = new Date(data.fechaInicio);
    const end = new Date(data.fechaFin);
    if (!(start instanceof Date) || isNaN(start.getTime()) || !(end instanceof Date) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Fechas inválidas' },
        { status: 400 }
      );
    }
    if (end <= start) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
        { status: 400 }
      );
    }

    // Verificar disponibilidad
    const conflicto = await Reserva.findOne({
      propiedadId: data.propiedadId,
      estado: { $nin: ['cancelada'] },
      $or: [
        {
          // Regla de no-solapamiento con rango [inicio, fin): permitir checkout=checkin siguiente
          fechaInicio: { $lt: end },
          fechaFin: { $gt: start },
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

