import { NextRequest, NextResponse } from 'next/server';

import dbConnect from '@/lib/mongodb';
import { quoteBooking } from '@/lib/booking-pricing';
import Propiedad from '@/models/Propiedad';
import Reserva from '@/models/Reserva';
import ReservaHold from '@/models/ReservaHold';

function toMiddayUtcIso(ymd: string) {
  if (!ymd) return '';
  return new Date(`${ymd.slice(0, 10)}T12:00:00Z`).toISOString();
}

/**
 * GET /api/reservas/disponibles
 * Sin autenticación (canal público). Lista alojamientos activos o verifica disponibilidad.
 *
 * - Sin query: `{ propiedades: [...] }`
 * - Con `propiedadId`, `desde`, `hasta` (YYYY-MM-DD): `{ disponible: boolean }`
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = request.nextUrl;
    const propiedadId = searchParams.get('propiedadId');
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');
    const huespedes = Math.max(1, Number(searchParams.get('huespedes') || 1));

    if (propiedadId && desde && hasta) {
      const start = new Date(toMiddayUtcIso(desde));
      const end = new Date(toMiddayUtcIso(hasta));
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        return NextResponse.json({ error: 'Fechas inválidas' }, { status: 400 });
      }

      const prop = await Propiedad.findOne({ _id: propiedadId, activo: true }).lean();
      if (!prop) {
        return NextResponse.json({ disponible: false, error: 'Alojamiento no encontrado' }, { status: 404 });
      }

      const now = new Date();
      const [conflicto, hold] = await Promise.all([
        Reserva.findOne({
          propiedadId,
          estado: { $nin: ['cancelada'] },
          fechaInicio: { $lt: end },
          fechaFin: { $gt: start },
          $nor: [{ estado: 'pendiente', pagoEstado: 'pendiente', pagoExpiraEn: { $lte: now } }],
        }).lean(),
        ReservaHold.findOne({
          propiedadId,
          fecha: { $gte: desde, $lt: hasta },
          expiresAt: { $gt: now },
        }).lean(),
      ]);

      return NextResponse.json({ disponible: !conflicto && !hold });
    }

    const propiedades = await Propiedad.find({
      activo: true,
      ...(Number.isFinite(huespedes)
        ? { $or: [{ capacidad: { $gte: huespedes } }, { capacidad: { $exists: false } }] }
        : {}),
    })
      .select('nombre direccion ciudad tipo capacidad base precioPorNoche comisionPorcentaje imagenes')
      .sort({ nombre: 1 })
      .lean();

    let unavailable = new Set<string>();
    if (desde && hasta) {
      const start = new Date(toMiddayUtcIso(desde));
      const end = new Date(toMiddayUtcIso(hasta));
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        return NextResponse.json({ error: 'Fechas inválidas' }, { status: 400 });
      }
      const now = new Date();
      const [reservas, holds] = await Promise.all([
        Reserva.find({
          propiedadId: { $in: propiedades.map((p) => p._id) },
          estado: { $nin: ['cancelada'] },
          fechaInicio: { $lt: end },
          fechaFin: { $gt: start },
          $nor: [{ estado: 'pendiente', pagoEstado: 'pendiente', pagoExpiraEn: { $lte: now } }],
        })
          .select('propiedadId')
          .lean(),
        ReservaHold.find({
          propiedadId: { $in: propiedades.map((p) => p._id) },
          fecha: { $gte: desde, $lt: hasta },
          expiresAt: { $gt: now },
        })
          .select('propiedadId')
          .lean(),
      ]);
      unavailable = new Set([
        ...reservas.map((r) => String(r.propiedadId)),
        ...holds.map((h) => String(h.propiedadId)),
      ]);
    }

    return NextResponse.json({
      propiedades: propiedades
        .filter((p) => !unavailable.has(String(p._id)))
        .map((p) => {
          const precio = Number(p.base ?? p.precioPorNoche ?? 0);
          let cotizacion = null;
          if (desde && hasta && precio > 0) {
            try {
              cotizacion = quoteBooking({
                desde,
                hasta,
                huespedes,
                capacidad: Number(p.capacidad ?? 1),
                precioBaseNoche: precio,
              });
            } catch {}
          }
          return {
            _id: String(p._id),
            nombre: p.nombre,
            direccion: p.direccion,
            ciudad: p.ciudad,
            tipo: p.tipo,
            capacidad: p.capacidad,
            comisionPorcentaje: p.comisionPorcentaje ?? 0,
            base: precio,
            precioPorNoche: precio,
            imagen: Array.isArray(p.imagenes) && p.imagenes[0] ? p.imagenes[0] : null,
            cotizacion,
          };
        }),
    });
  } catch (error) {
    console.error('[GET /api/reservas/disponibles]', error);
    return NextResponse.json({ error: 'No se pudieron cargar los datos' }, { status: 500 });
  }
}
