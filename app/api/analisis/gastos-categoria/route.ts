import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Gasto from '@/models/Gasto';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const propiedadId = searchParams.get('propiedadId');

    const match: Record<string, any> = {};
    if (propiedadId) match.propiedadId = propiedadId;
    if (from || to) {
      match.fecha = {};
      if (from) match.fecha.$gte = new Date(from);
      if (to) match.fecha.$lte = new Date(to);
    }

    const pipeline = [
      { $match: match },
      { $group: { _id: '$categoria', total: { $sum: '$monto' } } },
      { $project: { _id: 0, categoria: '$_id', total: 1 } },
      { $sort: { total: -1 } },
    ];

    const data = await (Gasto as any).aggregate(pipeline);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error agregando gastos por categoría:', error);
    return NextResponse.json(
      { error: 'Error agregando gastos por categoría' },
      { status: 500 }
    );
  }
}


