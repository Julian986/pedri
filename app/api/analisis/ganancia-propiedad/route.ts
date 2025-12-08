import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Pago from '@/models/Pago'
import Gasto from '@/models/Gasto'
import Propiedad from '@/models/Propiedad'
import Reserva from '@/models/Reserva'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const mode = (searchParams.get('mode') || 'auto').toLowerCase() as 'auto' | 'real' | 'estimado'
    const commissionPct = Math.max(0, Math.min(100, Number(searchParams.get('commissionPct') || 12)))

    const pagosMatch: any = { estado: 'pagado' }
    if (from || to) {
      const start = from ? new Date(from) : undefined
      const end = to ? new Date(to) : undefined
      if (start && end) {
        pagosMatch.fechaPago = { $gte: start, $lte: end }
      } else if (start) {
        pagosMatch.fechaPago = { $gte: start }
      } else if (end) {
        pagosMatch.fechaPago = { $lte: end }
      }
    }

    const gastosMatch: any = {}
    if (from || to) {
      const start = from ? new Date(from) : undefined
      const end = to ? new Date(to) : undefined
      if (start && end) {
        gastosMatch.fecha = { $gte: start, $lte: end }
      } else if (start) {
        gastosMatch.fecha = { $gte: start }
      } else if (end) {
        gastosMatch.fecha = { $lte: end }
      }
    }

    // Reservas para estimación de comisiones cuando no haya pagos reales
    const reservasMatch: any = {
      estado: { $nin: ['cancelada', 'bloqueo'] },
    }
    if (from || to) {
      const start = from ? new Date(from) : undefined
      const end = to ? new Date(to) : undefined
      if (start && end) {
        // Reconocer ingreso al checkout (fechaFin dentro del rango)
        reservasMatch.fechaFin = { $gte: start, $lte: end }
      } else if (start) {
        reservasMatch.fechaFin = { $gte: start }
      } else if (end) {
        reservasMatch.fechaFin = { $lte: end }
      }
    }

    const pagosAgg = await Pago.aggregate([
      { $match: pagosMatch },
      {
        $group: {
          _id: '$propiedadId',
          ingresos: { $sum: '$monto' },
          comisiones: { $sum: '$comisionMonto' },
          propietarios: { $sum: '$montoDueno' },
        },
      },
    ])

    const gastosAgg = await Gasto.aggregate([
      { $match: gastosMatch },
      {
        $group: {
          _id: '$propiedadId',
          gastos: { $sum: '$monto' },
        },
      },
    ])

    const reservasAgg = await Reserva.aggregate([
      { $match: reservasMatch },
      {
        $group: {
          _id: '$propiedadId',
          ingresosReserva: { $sum: '$precioTotal' },
        },
      },
    ])

    // Merge por propiedad
    const byProp: Record<string, {
      ingresosPagos: number
      comisionesPagos: number
      propietariosPagos: number
      gastos: number
      ingresosReserva: number
    }> = {}
    for (const p of pagosAgg) {
      const key = String(p._id)
      byProp[key] = {
        ingresosPagos: p.ingresos || 0,
        comisionesPagos: p.comisiones || 0,
        propietariosPagos: p.propietarios || 0,
        gastos: 0,
        ingresosReserva: 0,
      }
    }
    for (const g of gastosAgg) {
      const key = String(g._id)
      if (!byProp[key]) {
        byProp[key] = { ingresosPagos: 0, comisionesPagos: 0, propietariosPagos: 0, gastos: 0, ingresosReserva: 0 }
      }
      byProp[key].gastos = (g.gastos || 0)
    }
    for (const r of reservasAgg) {
      const key = String(r._id)
      if (!byProp[key]) {
        byProp[key] = { ingresosPagos: 0, comisionesPagos: 0, propietariosPagos: 0, gastos: 0, ingresosReserva: 0 }
      }
      byProp[key].ingresosReserva = (r.ingresosReserva || 0)
    }

    const propIds = Object.keys(byProp)
    if (propIds.length === 0) {
      return NextResponse.json({ data: [] })
    }
    const props = await Propiedad.find({ _id: { $in: propIds } }, { nombre: 1, comisionPorcentaje: 1 }).lean()
    const idToName: Record<string, string> = {}
    const idToPct: Record<string, number> = {}
    for (const p of props) {
      idToName[String(p._id)] = p.nombre || 'Propiedad'
      idToPct[String(p._id)] = typeof (p as any).comisionPorcentaje === 'number' ? (p as any).comisionPorcentaje : commissionPct
    }

    const rows = propIds.map((id) => {
      const row = byProp[id]
      const hasReal = (row.comisionesPagos || 0) > 0 || (row.ingresosPagos || 0) > 0
      const useReal = mode === 'real' || (mode === 'auto' && hasReal)
      const ingresosFinal = useReal ? (row.ingresosPagos || 0) : (row.ingresosReserva || 0)
      const comisionesFinal = useReal
        ? (row.comisionesPagos || 0)
        : Math.max(0, (row.ingresosReserva || 0) * ((idToPct[id] ?? commissionPct) / 100))
      const ganancia = comisionesFinal - (row.gastos || 0)
      return {
        propiedad: idToName[id] || 'Propiedad',
        ganancia,
      }
    }).sort((a, b) => b.ganancia - a.ganancia)

    return NextResponse.json({ data: rows })
  } catch (error) {
    console.error('Error análisis/ganancia-propiedad:', error)
    return NextResponse.json({ error: 'Error análisis/ganancia-propiedad' }, { status: 500 })
  }
}
