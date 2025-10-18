import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Propiedad from '@/models/Propiedad';
import Reserva from '@/models/Reserva';
import Pago from '@/models/Pago';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await dbConnect();

    // Total de propiedades activas
    const totalPropiedades = await Propiedad.countDocuments({ activo: true });

    // Reservas activas (confirmadas y en curso)
    const reservasActivas = await Reserva.countDocuments({
      estado: { $in: ['confirmada', 'en_curso'] },
    });

    // Reservas del mes actual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const reservasMesActual = await Reserva.countDocuments({
      createdAt: { $gte: inicioMes },
    });

    // Ingresos totales del mes
    const pagosMes = await Pago.aggregate([
      {
        $match: {
          createdAt: { $gte: inicioMes },
          estado: 'pagado',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$monto' },
          comisiones: { $sum: '$comisionMonto' },
        },
      },
    ]);

    const ingresosMes = pagosMes.length > 0 ? pagosMes[0].total : 0;
    const comisionesMes = pagosMes.length > 0 ? pagosMes[0].comisiones : 0;

    // Pagos pendientes
    const pagosPendientes = await Pago.countDocuments({ estado: 'pendiente' });

    // Próximas reservas (próximos 7 días)
    const hoy = new Date();
    const proximaSemana = new Date();
    proximaSemana.setDate(hoy.getDate() + 7);

    const proximasReservas = await Reserva.find({
      fechaInicio: { $gte: hoy, $lte: proximaSemana },
      estado: { $in: ['confirmada', 'pendiente'] },
    })
      .populate('propiedadId', 'nombre direccion')
      .limit(5)
      .sort({ fechaInicio: 1 });

    return NextResponse.json({
      stats: {
        totalPropiedades,
        reservasActivas,
        reservasMesActual,
        ingresosMes,
        comisionesMes,
        pagosPendientes,
      },
      proximasReservas,
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { error: 'Error obteniendo estadísticas' },
      { status: 500 }
    );
  }
}

