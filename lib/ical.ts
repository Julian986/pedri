/**
 * Utilidades iCal (ICS) para sync bidireccional Airbnb/Booking ↔ Pedri.
 * Fechas all-day en formato VALUE=DATE; rangos half-open [inicio, fin).
 */

export type IcalEvent = {
  uid: string;
  summary?: string;
  description?: string;
  /** Inicio inclusive (UTC midnight / date-only). */
  start: Date;
  /** Fin exclusivo (checkout), half-open. */
  end: Date;
};

function unfoldIcal(raw: string): string {
  // RFC 5545: líneas continuadas empiezan con espacio o tab
  return raw.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');
}

function parseIcalDate(value: string): Date | null {
  const v = value.trim();
  // DATE: YYYYMMDD
  if (/^\d{8}$/.test(v)) {
    const y = Number(v.slice(0, 4));
    const m = Number(v.slice(4, 6)) - 1;
    const d = Number(v.slice(6, 8));
    return new Date(Date.UTC(y, m, d));
  }
  // DATETIME: YYYYMMDDTHHMMSSZ or without Z
  const m = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
  if (m) {
    return new Date(
      Date.UTC(
        Number(m[1]),
        Number(m[2]) - 1,
        Number(m[3]),
        Number(m[4]),
        Number(m[5]),
        Number(m[6])
      )
    );
  }
  return null;
}

function formatIcalDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function escapeText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function unescapeText(s: string): string {
  return s.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
}

/**
 * Parsea un feed ICS y devuelve VEVENTs con fechas all-day (o truncadas a día UTC).
 */
export function parseIcal(raw: string): IcalEvent[] {
  const text = unfoldIcal(raw);
  const blocks = text.split('BEGIN:VEVENT');
  const events: IcalEvent[] = [];

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split('END:VEVENT')[0] || '';
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);

    let uid = '';
    let summary = '';
    let description = '';
    let start: Date | null = null;
    let end: Date | null = null;

    for (const line of lines) {
      const colon = line.indexOf(':');
      if (colon < 0) continue;
      const left = line.slice(0, colon);
      const value = line.slice(colon + 1);
      const prop = left.split(';')[0].toUpperCase();

      if (prop === 'UID') uid = value.trim();
      else if (prop === 'SUMMARY') summary = unescapeText(value);
      else if (prop === 'DESCRIPTION') description = unescapeText(value);
      else if (prop === 'DTSTART') start = parseIcalDate(value);
      else if (prop === 'DTEND') end = parseIcalDate(value);
      else if (prop === 'DURATION' && start && !end) {
        // DURATION=P2D etc. — soporte mínimo
        const dm = value.match(/^P(?:(\d+)D)?$/i);
        if (dm) {
          const days = Number(dm[1] || 0);
          end = new Date(start.getTime());
          end.setUTCDate(end.getUTCDate() + days);
        }
      }
    }

    if (!uid || !start) continue;
    if (!end) {
      // Evento de un día: fin = día siguiente
      end = new Date(start.getTime());
      end.setUTCDate(end.getUTCDate() + 1);
    }

    // Normalizar a medianoche UTC (día de calendario)
    const startDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    const endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
    if (endDay <= startDay) {
      endDay.setUTCDate(endDay.getUTCDate() + 1);
    }

    events.push({
      uid,
      summary: summary || undefined,
      description: description || undefined,
      start: startDay,
      end: endDay,
    });
  }

  return events;
}

export type BuildIcalEventInput = {
  uid: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
};

export function buildIcalCalendar(
  events: BuildIcalEventInput[],
  opts?: { name?: string; prodId?: string }
): string {
  const prodId = opts?.prodId || '-//Pedri//Channel Sync//ES';
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${prodId}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  if (opts?.name) {
    lines.push(`X-WR-CALNAME:${escapeText(opts.name)}`);
  }

  for (const ev of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.uid}`);
    lines.push(`DTSTAMP:${formatIcalDate(new Date())}T000000Z`);
    lines.push(`DTSTART;VALUE=DATE:${formatIcalDate(ev.start)}`);
    lines.push(`DTEND;VALUE=DATE:${formatIcalDate(ev.end)}`);
    lines.push(`SUMMARY:${escapeText(ev.summary)}`);
    if (ev.description) {
      lines.push(`DESCRIPTION:${escapeText(ev.description)}`);
    }
    lines.push('TRANSP:OPAQUE');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

/** Genera token opaco para URL de export. */
export function generateIcalExportToken(): string {
  const bytes = new Uint8Array(24);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Node fallback
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto') as typeof import('crypto');
    nodeCrypto.randomFillSync(bytes);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function normalizeExportToken(tokenParam: string): string {
  return tokenParam.replace(/\.ics$/i, '').trim();
}

/** Convierte Date a YMD UTC para logs. */
export function toYmdUtc(d: Date): string {
  return formatIcalDate(d).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
}
