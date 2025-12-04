import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Pago from '@/models/Pago';
import { requireAuth } from '@/lib/middleware';

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
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();

    const sp = request.nextUrl.searchParams;
    const reservaId = sp.get('reservaId');
    const propiedadId = sp.get('propiedadId');
    const estado = sp.get('estado');
    const from = sp.get('from');
    const to = sp.get('to');

    const query: any = {};
    if (reservaId) query.reservaId = reservaId;
    if (propiedadId) query.propiedadId = propiedadId;
    if (estado) query.estado = estado;
    if (from || to) {
      query.fechaPago = {};
      if (from) query.fechaPago.$gte = new Date(from);
      if (to) query.fechaPago.$lte = new Date(to);
    }

    const pagos = await Pago.find(query)
      .populate('reservaId', 'nombreHuesped fechaInicio fechaFin')
      .populate('propiedadId', 'nombre')
      .sort({ fechaPago: -1, createdAt: -1 });

    const rows = pagos.map((p: any) => ({
      pagoId: p._id,
      propiedad: p.propiedadId?.nombre || '',
      reservaId: p.reservaId?._id || '',
      huesped: p.reservaId?.nombreHuesped || '',
      fechaReservaInicio: p.reservaId?.fechaInicio
        ? new Date(p.reservaId.fechaInicio).toISOString().slice(0, 10)
        : '',
      fechaReservaFin: p.reservaId?.fechaFin
        ? new Date(p.reservaId.fechaFin).toISOString().slice(0, 10)
        : '',
      monto: p.monto,
      moneda: p.moneda,
      comisionPorcentaje: p.comisionPorcentaje,
      comisionMonto: p.comisionMonto,
      montoDueno: p.montoDueno,
      metodoPago: p.metodoPago,
      estado: p.estado,
      fechaPago: p.fechaPago ? p.fechaPago.toISOString().slice(0, 10) : '',
      createdAt: p.createdAt?.toISOString(),
    }));

    const csv = toCsv(rows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="pagos.csv"',
      },
    });
  } catch (error) {
    console.error('Error exportando pagos:', error);
    return NextResponse.json(
      { error: 'Error exportando pagos' },
      { status: 500 }
    );
  }
}


