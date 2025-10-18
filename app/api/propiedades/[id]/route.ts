import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Propiedad from '@/models/Propiedad';
import { requireAuth } from '@/lib/middleware';

// GET - Obtener una propiedad por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const propiedad = await Propiedad.findById(params.id)
      .populate('duenoId', 'nombre email telefono');

    if (!propiedad) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ propiedad });
  } catch (error) {
    console.error('Error obteniendo propiedad:', error);
    return NextResponse.json(
      { error: 'Error obteniendo propiedad' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar propiedad
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

    const propiedad = await Propiedad.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    );

    if (!propiedad) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ propiedad });
  } catch (error) {
    console.error('Error actualizando propiedad:', error);
    return NextResponse.json(
      { error: 'Error actualizando propiedad' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar propiedad (soft delete)
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

    const propiedad = await Propiedad.findByIdAndUpdate(
      params.id,
      { activo: false },
      { new: true }
    );

    if (!propiedad) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Propiedad desactivada correctamente' });
  } catch (error) {
    console.error('Error eliminando propiedad:', error);
    return NextResponse.json(
      { error: 'Error eliminando propiedad' },
      { status: 500 }
    );
  }
}

