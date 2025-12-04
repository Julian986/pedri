import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Pago from '@/models/Pago';
import Reserva from '@/models/Reserva';
import Propiedad from '@/models/Propiedad';
import { requireAuth } from '@/lib/middleware';

// GET - Obtener todos los pagos
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const reservaId = searchParams.get('reservaId');
    const propiedadId = searchParams.get('propiedadId');
    const from = searchParams.get('from'); // ISO date
    const to = searchParams.get('to'); // ISO date
    const estado = searchParams.get('estado');

    let query: any = {};

    if (reservaId) {
      query.reservaId = reservaId;
    }

    if (propiedadId) {
      query.propiedadId = propiedadId;
    }

    if (estado) {
      query.estado = estado;
    }

    if (from || to) {
      query.fechaPago = {};
      if (from) query.fechaPago.$gte = new Date(from);
      if (to) query.fechaPago.$lte = new Date(to);
    }

    const pagos = await Pago.find(query)
      .populate('reservaId', 'nombreHuesped fechaInicio fechaFin')
      .populate('propiedadId', 'nombre direccion')
      .sort({ fechaPago: -1, createdAt: -1 });

    return NextResponse.json({ pagos });
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    return NextResponse.json(
      { error: 'Error obteniendo pagos' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo pago
export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await dbConnect();

    const data = await request.json();

    // Validar existencia de la reserva y propiedad
    const reserva = await Reserva.findById(data.reservaId);
    const propiedad = await Propiedad.findById(data.propiedadId);

    if (!reserva || !propiedad) {
      return NextResponse.json(
        { error: 'Reserva o propiedad no encontrada' },
        { status: 404 }
      );
    }

    // Calcular comisiones
    const comisionPorcentaje = data.comisionPorcentaje || 10;
    const comisionMonto = (data.monto * comisionPorcentaje) / 100;
    const montoDueno = data.monto - comisionMonto;

    const pago = await Pago.create({
      ...data,
      comisionPorcentaje,
      comisionMonto,
      montoDueno,
    });

    return NextResponse.json(
      { pago },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creando pago:', error);
    return NextResponse.json(
      { error: 'Error creando pago' },
      { status: 500 }
    );
  }
}

