import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Pago from '@/models/Pago';
import { requireAuth } from '@/lib/middleware';

// PUT - Actualizar pago
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

    // Si se marca como pagado y no tiene fecha de pago, agregarla
    if (data.estado === 'pagado' && !data.fechaPago) {
      data.fechaPago = new Date();
    }

    const pago = await Pago.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    );

    if (!pago) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ pago });
  } catch (error) {
    console.error('Error actualizando pago:', error);
    return NextResponse.json(
      { error: 'Error actualizando pago' },
      { status: 500 }
    );
  }
}

