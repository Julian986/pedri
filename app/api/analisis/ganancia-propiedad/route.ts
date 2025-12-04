import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Pago from '@/models/Pago';
import Gasto from '@/models/Gasto';
import Propiedad from '@/models/Propiedad';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const propiedadId = searchParams.get('propiedadId');

    const pagoMatch: Record<string, any> = { estado: 'pagado' };
    if (from || to) {
      pagoMatch.fechaPago = {};
      if (from) pagoMatch.fechaPago.$gte = new Date(from);
      if (to) pagoMatch.fechaPago.$lte = new Date(to);
    }
    if (propiedadId) pagoMatch.propiedadId = propiedadId;

    const pagosAgg = await (Pago as any).aggregate([
      { $match: pagoMatch },
      { $group: { _id: '$propiedadId', ingresos: { $sum: '$monto' }, comisiones: { $sum: '$comisionMonto' }, propietarios: { $sum: '$montoDueno' } } },
    ]);

    const gastoMatch: Record<string, any> = {};
    if (from || to) {
      gastoMatch.fecha = {};
      if (from) gastoMatch.fecha.$gte = new Date(from);
      if (to) gastoMatch.fecha.$lte = new Date(to);
    }
    if (propiedadId) gastoMatch.propiedadId = propiedadId;

    const gastosAgg = await (Gasto as any).aggregate([
      { $match: gastoMatch },
      { $group: { _id: '$propiedadId', gastos: { $sum: '$monto' } } },
    ]);

    const gastosMap = new Map<string, number>(gastosAgg.map((g: any) => [String(g._id), g.gastos || 0]));

    const propIds = pagosAgg.map((p: any) => p._id).filter(Boolean);
    const props = await Propiedad.find({ _id: { $in: propIds } }, { nombre: 1 }).lean();
    const propNameById = new Map<string, string>(props.map((p: any) => [String(p._id), p.nombre]));

    const data = pagosAgg.map((p: any) => {
      const id = String(p._id);
      const gastos = gastosMap.get(id) || 0;
      const ganancia = (p.comisiones || 0) - gastos;
      return { propiedad: propNameById.get(id) || id, ganancia };
    }).sort((a: any, b: any) => b.ganancia - a.ganancia);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error calculando ganancia por propiedad:', error);
    return NextResponse.json({ error: 'Error calculando ganancia por propiedad' }, { status: 500 });
  }
}


