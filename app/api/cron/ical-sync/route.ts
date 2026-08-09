import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { syncAllIcalImports, syncPropiedadCanal, ensureIcalExportToken } from '@/lib/ical-sync';
import Propiedad, { CanalIcalKey } from '@/models/Propiedad';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

function authorizeCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Sin secreto configurado: solo permitir en desarrollo
    return process.env.NODE_ENV === 'development';
  }
  const auth = request.headers.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const q = request.nextUrl.searchParams.get('secret') || '';
  // Vercel Cron envía Authorization: Bearer $CRON_SECRET si la env existe
  return bearer === secret || q === secret;
}

/**
 * GET/POST /api/cron/ical-sync
 * Job periódico: importa feeds Airbnb/Booking y upsert bloqueos.
 * Proteger con CRON_SECRET (Bearer o ?secret=).
 *
 * Body opcional JSON: { propiedadId, canal: 'airbnb'|'booking' } para sync puntual.
 */
async function handle(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    await dbConnect();

    let body: { propiedadId?: string; canal?: CanalIcalKey } = {};
    if (request.method === 'POST') {
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    }

    const propiedadId =
      body.propiedadId || request.nextUrl.searchParams.get('propiedadId') || undefined;
    const canalParam =
      (body.canal || request.nextUrl.searchParams.get('canal') || undefined) as
        | CanalIcalKey
        | undefined;

    if (propiedadId) {
      if (!mongoose.Types.ObjectId.isValid(propiedadId)) {
        return NextResponse.json({ error: 'propiedadId inválido' }, { status: 400 });
      }
      const prop = await Propiedad.findById(propiedadId);
      if (!prop) {
        return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
      }
      await ensureIcalExportToken(prop);

      const canales: CanalIcalKey[] = canalParam
        ? [canalParam]
        : (['airbnb', 'booking'] as CanalIcalKey[]);

      const results = [];
      for (const c of canales) {
        if (!prop.canales?.[c]?.icalImportUrl?.trim()) continue;
        results.push(await syncPropiedadCanal(prop, c));
      }
      return NextResponse.json({ ok: true, mode: 'single', results });
    }

    const { results, propertiesScanned } = await syncAllIcalImports();
    return NextResponse.json({
      ok: true,
      mode: 'all',
      propertiesScanned,
      results,
      at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[ical-sync cron]', error);
    return NextResponse.json(
      { error: 'Error en sync iCal', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
