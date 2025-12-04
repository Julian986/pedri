import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Propiedad from '@/models/Propiedad';


// GET - Obtener todas las propiedades
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const activo = searchParams.get('activo');

    let query: any = {};

    if (activo !== null) {
      query.activo = activo === 'true';
    }

    const propiedades = await Propiedad.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ propiedades });
  } catch (error) {
    console.error('Error obteniendo propiedades:', error);
    return NextResponse.json(
      { error: 'Error obteniendo propiedades' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva propiedad
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const data = await request.json();

    const propiedad = await Propiedad.create(data);

    return NextResponse.json(
      { propiedad },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creando propiedad:', error);
    return NextResponse.json(
      { error: 'Error creando propiedad' },
      { status: 500 }
    );
  }
}

