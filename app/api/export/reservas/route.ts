import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reserva from '@/models/Reserva';

function toCsv(rows: Array<Record<string, any>>): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (val: any) => {
    if (val == null) return '';
    const s = String(val);
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ];
  return lines.join('\n');
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const sp = request.nextUrl.searchParams;
    const propiedadId = sp.get('propiedadId');
    const estado = sp.get('estado');
    const from = sp.get('from');
    const to = sp.get('to');

    const query: any = {};
    if (propiedadId) query.propiedadId = propiedadId;
    if (estado) query.estado = estado;
    if (from || to) {
      const start = from ? new Date(from) : undefined;
      const end = to ? new Date(to) : undefined;
      if (start && end) {
        query.$or = [{ fechaInicio: { $lte: end }, fechaFin: { $gte: start } }];
      } else if (start) {
        query.fechaFin = { $gte: start };
      } else if (end) {
        query.fechaInicio = { $lte: end };
      }
    }

    const reservas = await Reserva.find(query)
      .populate('propiedadId', 'nombre')
      .sort({ fechaInicio: -1 });

    const rows = reservas.map((r: any) => ({
      reservaId: r._id,
      propiedad: r.propiedadId?.nombre || '',
      huesped: r.nombreHuesped,
      telefono: r.telefonoHuesped || '',
      email: r.emailHuesped || '',
      origen: r.origen,
      estado: r.estado,
      fechaInicio: r.fechaInicio?.toISOString()?.slice(0, 10),
      fechaFin: r.fechaFin?.toISOString()?.slice(0, 10),
      noches: r.fechaInicio && r.fechaFin
        ? Math.round((new Date(r.fechaFin).getTime() - new Date(r.fechaInicio).getTime()) / (1000 * 60 * 60 * 24))
        : '',
      precioTotal: r.precioTotal,
      moneda: r.moneda || '',
      notas: r.notas || '',
      createdAt: r.createdAt?.toISOString(),
    }));

    const csv = toCsv(rows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="reservas.csv"',
      },
    });
  } catch (error) {
    console.error('Error exportando reservas:', error);
    return NextResponse.json({ error: 'Error exportando reservas' }, { status: 500 });
  }
}


