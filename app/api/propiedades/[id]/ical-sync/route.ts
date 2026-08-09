import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Propiedad, { CanalIcalKey } from '@/models/Propiedad';
import { ensureIcalExportToken, syncPropiedadCanal } from '@/lib/ical-sync';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/propiedades/[id]/ical-sync
 * Guarda URLs de import (opcionales) y sincroniza feeds iCal de esa propiedad.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    let body: { airbnbIcalUrl?: string; bookingIcalUrl?: string; canal?: CanalIcalKey } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const prop = await Propiedad.findById(params.id);
    if (!prop) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }

    const updates: Record<string, string> = {};
    if (typeof body.airbnbIcalUrl === 'string') {
      updates['canales.airbnb.icalImportUrl'] = body.airbnbIcalUrl.trim();
    }
    if (typeof body.bookingIcalUrl === 'string') {
      updates['canales.booking.icalImportUrl'] = body.bookingIcalUrl.trim();
    }

    await ensureIcalExportToken(prop);

    if (Object.keys(updates).length > 0) {
      await Propiedad.findByIdAndUpdate(params.id, { $set: updates });
    }

    const fresh = await Propiedad.findById(params.id);
    if (!fresh) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }

    const canales: CanalIcalKey[] = body.canal
      ? [body.canal]
      : (['airbnb', 'booking'] as CanalIcalKey[]);

    const results = [];
    for (const c of canales) {
      if (!fresh.canales?.[c]?.icalImportUrl?.trim()) continue;
      results.push(await syncPropiedadCanal(fresh, c));
    }

    const propiedad = await Propiedad.findById(params.id);
    return NextResponse.json({ ok: true, results, propiedad });
  } catch (error) {
    console.error('[propiedades ical-sync]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error sincronizando iCal' },
      { status: 500 }
    );
  }
}
