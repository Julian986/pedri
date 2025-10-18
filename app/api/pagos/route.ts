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
    const duenoId = searchParams.get('duenoId');
    const estado = searchParams.get('estado');

    let query: any = {};

    if (duenoId) {
      query.duenoId = duenoId;
    }

    if (estado) {
      query.estado = estado;
    }

    const pagos = await Pago.find(query)
      .populate('reservaId', 'nombreHuesped fechaInicio fechaFin')
      .populate('propiedadId', 'nombre direccion')
      .populate('duenoId', 'nombre email')
      .sort({ createdAt: -1 });

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

    // Obtener información de la reserva y propiedad
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
      duenoId: propiedad.duenoId,
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

