import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { requireAuth } from '@/lib/middleware';
import Reserva from '@/models/Reserva';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const match: Record<string, any> = {};
    if (fromParam || toParam) {
      const createdAt: Record<string, Date> = {};
      if (fromParam) {
        const fromDate = new Date(fromParam);
        if (!isNaN(fromDate.getTime())) createdAt.$gte = fromDate;
      }
      if (toParam) {
        const toDate = new Date(toParam);
        if (!isNaN(toDate.getTime())) createdAt.$lte = toDate;
      }
      if (Object.keys(createdAt).length > 0) match.createdAt = createdAt;
    }

    const pipeline = [
      { $match: match },
      { $group: { _id: '$origen', count: { $sum: 1 } } },
      { $project: { _id: 0, origen: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ];

    const data = await (Reserva as any).aggregate(pipeline);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error agregando reservas por origen:', error);
    return NextResponse.json(
      { error: 'Error agregando reservas por origen' },
      { status: 500 }
    );
  }
}


