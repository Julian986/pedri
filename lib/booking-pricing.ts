export type BookingQuote = {
  noches: number;
  precioBaseNoche: number;
  subtotal: number;
  descuentoNochesPct: number;
  descuentoOcupacionPct: number;
  descuentoTotalPct: number;
  total: number;
};

function parseYmd(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date(NaN);
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12));
}

export function quoteBooking(params: {
  desde: string;
  hasta: string;
  huespedes: number;
  capacidad: number;
  precioBaseNoche: number;
}): BookingQuote {
  const start = parseYmd(params.desde);
  const end = parseYmd(params.hasta);
  const noches = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (!Number.isFinite(noches) || noches < 1) {
    throw new Error('El período de la reserva no es válido');
  }

  const huespedes = Math.max(1, Math.trunc(params.huespedes));
  const capacidad = Math.max(1, Math.trunc(params.capacidad));
  const precioBaseNoche = Math.max(0, Math.round(params.precioBaseNoche));
  if (precioBaseNoche < 1) {
    throw new Error('El alojamiento no tiene un precio configurado');
  }

  const descuentoNochesPct = noches >= 20 ? 25 : noches >= 10 ? 18 : noches >= 5 ? 12 : 0;
  let descuentoOcupacionPct = 0;
  if (capacidad === 4) {
    descuentoOcupacionPct = huespedes === 3 ? 8 : huespedes === 2 ? 12 : huespedes === 1 ? 15 : 0;
  } else if (capacidad === 3) {
    descuentoOcupacionPct = huespedes === 2 ? 8 : huespedes === 1 ? 12 : 0;
  }

  const descuentoTotalPct = Math.min(60, descuentoNochesPct + descuentoOcupacionPct);
  const subtotal = Math.round(precioBaseNoche * noches);
  const total = Math.round(subtotal * (1 - descuentoTotalPct / 100));

  return {
    noches,
    precioBaseNoche,
    subtotal,
    descuentoNochesPct,
    descuentoOcupacionPct,
    descuentoTotalPct,
    total,
  };
}
