import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Propiedad from '@/models/Propiedad';
import Reserva from '@/models/Reserva';
import { buildIcalCalendar, normalizeExportToken } from '@/lib/ical';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/ical/[propiedadId]/[token].ics
 * Feed público de ocupación Pedri para pegar en Airbnb/Booking.
 * Incluye reservas/bloqueos activos y holds de pago vigentes (pagoExpiraEn > now).
 * No exporta canceladas.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { propiedadId: string; token: string } }
) {
  try {
    await dbConnect();

    const { propiedadId } = params;
    const token = normalizeExportToken(params.token || '');

    if (!mongoose.Types.ObjectId.isValid(propiedadId) || !token) {
      return new NextResponse('Not found', { status: 404 });
    }

    const propiedad = await Propiedad.findById(propiedadId).lean();
    if (!propiedad || propiedad.activo === false) {
      return new NextResponse('Not found', { status: 404 });
    }

    const expected =
      propiedad.canales?.icalExportToken ||
      propiedad.canales?.airbnb?.icalExportToken ||
      propiedad.canales?.booking?.icalExportToken;

    if (!expected || expected !== token) {
      return new NextResponse('Not found', { status: 404 });
    }

    const now = new Date();

    const reservas = await Reserva.find({
      propiedadId,
      estado: { $ne: 'cancelada' },
      $or: [
        // Ocupaciones normales / bloqueos iCal
        { estado: { $in: ['pendiente', 'confirmada', 'en_curso', 'completada', 'bloqueo'] } },
        // Holds MP vigentes (recomendado: sí bloquean el ICS)
        {
          pagoEstado: 'pendiente',
          pagoExpiraEn: { $gt: now },
        },
      ],
    })
      .select('_id nombreHuesped fechaInicio fechaFin estado origen externalUid')
      .lean();

    const events = reservas.map((r) => {
      const uid =
        r.externalUid ||
        `pedri-${propiedadId}-${String(r._id)}@pedriapp.com`;
      const summary =
        r.estado === 'bloqueo'
          ? `Bloqueo Pedri (${r.origen || 'Pedri'})`
          : `Reservado — ${r.nombreHuesped || 'Pedri'}`;
      return {
        uid,
        summary,
        description: `Pedri · ${r.origen || 'local'} · ${r.estado}`,
        start: new Date(r.fechaInicio),
        end: new Date(r.fechaFin),
      };
    });

    const ics = buildIcalCalendar(events, {
      name: `Pedri — ${propiedad.nombre}`,
    });

    return new NextResponse(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `inline; filename="pedri-${propiedadId}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[ical export]', error);
    return new NextResponse('Error', { status: 500 });
  }
}
