import crypto from 'crypto';
import mongoose from 'mongoose';
import Propiedad, { CanalIcalKey, IPropiedad } from '@/models/Propiedad';
import Reserva from '@/models/Reserva';
import { parseIcal, toYmdUtc } from '@/lib/ical';

export type SyncCanalResult = {
  propiedadId: string;
  propiedadNombre: string;
  canal: CanalIcalKey;
  ok: boolean;
  imported: number;
  updated: number;
  cancelled: number;
  conflicts: number;
  error?: string;
};

function origenFromCanal(canal: CanalIcalKey): 'Airbnb' | 'Booking' {
  return canal === 'airbnb' ? 'Airbnb' : 'Booking';
}

function huespedGenerico(canal: CanalIcalKey, summary?: string): string {
  if (summary && summary.trim() && !/^blocked|not available|reserved|unavailable$/i.test(summary.trim())) {
    return summary.trim().slice(0, 80);
  }
  return canal === 'airbnb' ? 'Bloqueo Airbnb' : 'Bloqueo Booking';
}

async function hasLocalConflict(
  propiedadId: mongoose.Types.ObjectId,
  start: Date,
  end: Date
): Promise<boolean> {
  const locales = await Reserva.find({
    propiedadId,
    estado: { $in: ['pendiente', 'confirmada', 'en_curso', 'completada'] },
    fechaInicio: { $lt: end },
    fechaFin: { $gt: start },
  })
    .select('_id externalUid')
    .lean();

  // Conflicto solo con reservas locales (sin UID iCal)
  return locales.some((r) => {
    const uid = (r as { externalUid?: string }).externalUid;
    return !uid;
  });
}

export async function syncPropiedadCanal(
  propiedad: IPropiedad,
  canal: CanalIcalKey
): Promise<SyncCanalResult> {
  const base: SyncCanalResult = {
    propiedadId: String(propiedad._id),
    propiedadNombre: propiedad.nombre,
    canal,
    ok: false,
    imported: 0,
    updated: 0,
    cancelled: 0,
    conflicts: 0,
  };

  const canalData = propiedad.canales?.[canal];
  const importUrl = canalData?.icalImportUrl?.trim();
  if (!importUrl) {
    return { ...base, ok: true, error: 'Sin URL de import' };
  }

  try {
    const res = await fetch(importUrl, {
      headers: {
        Accept: 'text/calendar, text/plain, */*',
        'User-Agent': 'Pedri-iCal-Sync/1.0',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} al descargar ICS`);
    }

    const raw = await res.text();
    const events = parseIcal(raw);
    const seenUids = new Set<string>();
    const conflictNotes: string[] = [];

    for (const ev of events) {
      seenUids.add(ev.uid);

      const existing = await Reserva.findOne({
        propiedadId: propiedad._id,
        externalUid: ev.uid,
      });

      if (existing) {
        const changed =
          existing.fechaInicio.getTime() !== ev.start.getTime() ||
          existing.fechaFin.getTime() !== ev.end.getTime() ||
          existing.estado === 'cancelada';

        if (changed) {
          const conflict = await hasLocalConflict(
            propiedad._id as mongoose.Types.ObjectId,
            ev.start,
            ev.end
          );
          if (conflict) {
            base.conflicts += 1;
            conflictNotes.push(
              `Conflicto UID ${ev.uid} (${toYmdUtc(ev.start)}→${toYmdUtc(ev.end)})`
            );
            continue;
          }
          existing.fechaInicio = ev.start;
          existing.fechaFin = ev.end;
          existing.estado = 'bloqueo';
          existing.origen = origenFromCanal(canal);
          existing.externalSource = canal;
          if (ev.summary) existing.nombreHuesped = huespedGenerico(canal, ev.summary);
          await existing.save();
          base.updated += 1;
        }
        continue;
      }

      const conflict = await hasLocalConflict(
        propiedad._id as mongoose.Types.ObjectId,
        ev.start,
        ev.end
      );
      if (conflict) {
        base.conflicts += 1;
        conflictNotes.push(
          `Conflicto nuevo ${ev.uid} (${toYmdUtc(ev.start)}→${toYmdUtc(ev.end)})`
        );
        console.warn(
          `[ical-sync] Conflicto ${canal} prop=${propiedad._id} uid=${ev.uid} ${toYmdUtc(ev.start)}-${toYmdUtc(ev.end)}`
        );
        continue;
      }

      await Reserva.create({
        propiedadId: propiedad._id,
        nombreHuesped: huespedGenerico(canal, ev.summary),
        fechaInicio: ev.start,
        fechaFin: ev.end,
        numeroHuespedes: 1,
        precioTotal: 0,
        origen: origenFromCanal(canal),
        estado: 'bloqueo',
        externalUid: ev.uid,
        externalSource: canal,
        notas: ev.description?.slice(0, 500) || `Importado desde ${canal} (iCal)`,
      });
      base.imported += 1;
    }

    // Liberar bloqueos de este canal que ya no vienen en el feed
    const stale = await Reserva.find({
      propiedadId: propiedad._id,
      externalSource: canal,
      estado: { $ne: 'cancelada' },
      externalUid: { $exists: true, $nin: Array.from(seenUids) },
    });

    for (const r of stale) {
      if (r.externalUid && !seenUids.has(r.externalUid)) {
        r.estado = 'cancelada';
        await r.save();
        base.cancelled += 1;
      }
    }

    const errorMsg =
      conflictNotes.length > 0
        ? `${conflictNotes.length} conflicto(s): ${conflictNotes.slice(0, 3).join('; ')}`
        : null;

    await Propiedad.findByIdAndUpdate(propiedad._id, {
      [`canales.${canal}.ultimoSyncAt`]: new Date(),
      [`canales.${canal}.ultimoSyncError`]: errorMsg,
    });

    base.ok = true;
    if (errorMsg) base.error = errorMsg;
    return base;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido en sync';
    await Propiedad.findByIdAndUpdate(propiedad._id, {
      [`canales.${canal}.ultimoSyncAt`]: new Date(),
      [`canales.${canal}.ultimoSyncError`]: msg,
    });
    return { ...base, ok: false, error: msg };
  }
}

export async function syncAllIcalImports(): Promise<{
  results: SyncCanalResult[];
  propertiesScanned: number;
}> {
  const propiedades = await Propiedad.find({
    activo: true,
    $or: [
      { 'canales.airbnb.icalImportUrl': { $exists: true, $nin: [null, ''] } },
      { 'canales.booking.icalImportUrl': { $exists: true, $nin: [null, ''] } },
    ],
  });

  const results: SyncCanalResult[] = [];
  for (const prop of propiedades) {
    for (const canal of ['airbnb', 'booking'] as CanalIcalKey[]) {
      const url = prop.canales?.[canal]?.icalImportUrl?.trim();
      if (!url) continue;
      results.push(await syncPropiedadCanal(prop, canal));
    }
  }

  return { results, propertiesScanned: propiedades.length };
}

/** Asegura token de export en la propiedad (mutación in-place + persistencia). */
export async function ensureIcalExportToken(propiedad: IPropiedad): Promise<string> {
  const existing =
    propiedad.canales?.icalExportToken ||
    propiedad.canales?.airbnb?.icalExportToken ||
    propiedad.canales?.booking?.icalExportToken;

  if (existing) {
    if (!propiedad.canales?.icalExportToken) {
      await Propiedad.findByIdAndUpdate(propiedad._id, {
        'canales.icalExportToken': existing,
        'canales.airbnb.icalExportToken': existing,
        'canales.booking.icalExportToken': existing,
      });
    }
    return existing;
  }

  const token = crypto.randomBytes(24).toString('hex');
  await Propiedad.findByIdAndUpdate(propiedad._id, {
    'canales.icalExportToken': token,
    'canales.airbnb.icalExportToken': token,
    'canales.booking.icalExportToken': token,
  });
  return token;
}
