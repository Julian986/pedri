import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Gasto from '@/models/Gasto';


// GET - Listar gastos con filtros
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const sp = request.nextUrl.searchParams;
    const propiedadId = sp.get('propiedadId');
    const categoria = sp.get('categoria');
    const from = sp.get('from'); // ISO date
    const to = sp.get('to'); // ISO date

    const query: any = {};

    if (propiedadId) query.propiedadId = propiedadId;
    if (categoria) query.categoria = categoria;
    if (from || to) {
      query.fecha = {};
      if (from) query.fecha.$gte = new Date(from);
      if (to) query.fecha.$lte = new Date(to);
    }

    const gastos = await Gasto.find(query)
      .populate('propiedadId', 'nombre direccion')
      .sort({ fecha: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ gastos });
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    return NextResponse.json(
      { error: 'Error obteniendo gastos' },
      { status: 500 }
    );
  }
}

// POST - Crear gasto
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    // Compat: aceptar 'notas' (plural) o 'nota' (singular) desde el cliente
    const { notas, nota, ...rest } = data || {};
    const payload: any = { ...rest };
    if (nota != null && String(nota).length) payload.nota = nota;
    else if (notas != null && String(notas).length) payload.nota = notas;

    const gasto = await Gasto.create(payload);

    return NextResponse.json({ gasto }, { status: 201 });
  } catch (error) {
    console.error('Error creando gasto:', error);
    return NextResponse.json(
      { error: 'Error creando gasto' },
      { status: 500 }
    );
  }
}


