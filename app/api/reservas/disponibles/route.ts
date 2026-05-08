import { NextRequest, NextResponse } from 'next/server';

import dbConnect from '@/lib/mongodb';
import Propiedad from '@/models/Propiedad';
import Reserva from '@/models/Reserva';

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

      const conflicto = await Reserva.findOne({
        propiedadId,
        estado: { $nin: ['cancelada'] },
        fechaInicio: { $lt: end },
        fechaFin: { $gt: start },
      }).lean();

      return NextResponse.json({ disponible: !conflicto });
    }

    const propiedades = await Propiedad.find({ activo: true })
      .select('nombre direccion ciudad tipo capacidad base precioPorNoche imagenes')
      .sort({ nombre: 1 })
      .lean();

    return NextResponse.json({
      propiedades: propiedades.map((p) => ({
        _id: String(p._id),
        nombre: p.nombre,
        direccion: p.direccion,
        ciudad: p.ciudad,
        tipo: p.tipo,
        capacidad: p.capacidad,
        base: p.base ?? p.precioPorNoche ?? 0,
        precioPorNoche: p.precioPorNoche ?? p.base ?? 0,
        imagen: Array.isArray(p.imagenes) && p.imagenes[0] ? p.imagenes[0] : null,
      })),
    });
  } catch (error) {
    console.error('[GET /api/reservas/disponibles]', error);
    return NextResponse.json({ error: 'No se pudieron cargar los datos' }, { status: 500 });
  }
}
