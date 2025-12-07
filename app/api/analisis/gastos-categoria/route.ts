import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Gasto from '@/models/Gasto'
import '@/models/Propiedad'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const match: any = {}
    if (from || to) {
      const start = from ? new Date(from) : undefined
      const end = to ? new Date(to) : undefined
      if (start && end) {
        match.fecha = { $gte: start, $lte: end }
      } else if (start) {
        match.fecha = { $gte: start }
      } else if (end) {
        match.fecha = { $lte: end }
      }
    }

    const agg = await Gasto.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$categoria',
          total: { $sum: '$monto' },
        },
      },
      { $project: { _id: 0, categoria: '$_id', total: 1 } },
      { $sort: { total: -1 } },
    ])

    return NextResponse.json({ data: agg })
  } catch (error) {
    console.error('Error análisis/gastos-categoria:', error)
    return NextResponse.json({ error: 'Error análisis/gastos-categoria' }, { status: 500 })
  }
}
