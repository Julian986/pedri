import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Reserva from '@/models/Reserva'
import '@/models/Propiedad'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const match: any = {
      estado: { $nin: ['cancelada', 'bloqueo'] },
    }

    if (from || to) {
      const start = from ? new Date(from) : undefined
      const end = to ? new Date(to) : undefined
      if (start && end) {
        // rango de intersección [inicio, fin)
        match.$and = [
          { fechaInicio: { $lte: end } },
          { fechaFin: { $gte: start } },
        ]
      } else if (start) {
        match.fechaFin = { $gte: start }
      } else if (end) {
        match.fechaInicio = { $lte: end }
      }
    }

    const agg = await Reserva.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$origen',
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, origen: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ])

    return NextResponse.json({ data: agg })
  } catch (error) {
    console.error('Error análisis/origen:', error)
    return NextResponse.json({ error: 'Error análisis/origen' }, { status: 500 })
  }
}
