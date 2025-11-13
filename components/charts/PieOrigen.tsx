"use client";

import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Label } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';

type OrigenDato = {
  origen: 'Airbnb' | 'Booking' | 'Facebook' | 'Mercado Libre' | 'Recomendado' | 'Particular' | 'Otro' | string;
  count: number;
};

interface PieOrigenProps {
  data: OrigenDato[];
}

const COLOR_BY_ORIGEN: Record<string, string> = {
  Airbnb: '#5B9BD5',
  Booking: '#ED7D31',
  Facebook: '#1877F2',
  'Mercado Libre': '#FFE600',
  Recomendado: '#22C55E',
  Otro: '#9CA3AF',
};

export default function PieOrigen({ data }: PieOrigenProps) {
  const cleaned = useMemo(() => {
    const base = ['Airbnb', 'Booking', 'Facebook', 'Mercado Libre', 'Recomendado', 'Otro'];
    const map: Record<string, number> = {
      Airbnb: 0, Booking: 0, Facebook: 0, 'Mercado Libre': 0, Recomendado: 0, Otro: 0
    };
    (data || []).forEach((d) => {
      const raw = d.origen || 'Otro';
      // Compat: mapear 'Particular' a 'Recomendado'
      const normalized = raw === 'Particular' ? 'Recomendado' : raw;
      const key = base.includes(normalized) ? normalized : 'Otro';
      map[key] += d.count || 0;
    });
    const arr = base.map((k) => ({ name: k, value: map[k] || 0 }));
    return arr.sort((a, b) => b.value - a.value);
  }, [data]);

  const total = cleaned.reduce((acc, it) => acc + it.value, 0);

  return (
    <div className="w-full bg-zinc-900 rounded-xl p-4 border border-zinc-800" role="img" aria-label="Gráfico de torta del origen de clientes">
      <h3 className="text-white text-base font-semibold mb-4">Origen de clientes</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 12, right: 0, bottom: 12, left: 0 }}>
          <Pie data={cleaned} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false}
            label={(entry: PieLabelRenderProps) => {
              const raw = (entry as any)?.value as unknown;
              const value = typeof raw === 'number' ? raw : Number(raw ?? 0);
              if (!total || value === 0) return '';
              const pct = Math.round((value / total) * 100);
              return `${pct}%`;
            }}
          >
            {cleaned.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLOR_BY_ORIGEN[entry.name] || '#6B7280'} />
            ))}
            <Label value={total ? '' : 'Sin datos'} position="center" fill="#9ca3af" />
          </Pie>
          <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8 }} itemStyle={{ color: '#e5e7eb' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {total > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {cleaned.map((entry, idx) => (
            <div key={`legend-origen-${entry.name}-${idx}`} className="flex items-center gap-1 text-sm">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: COLOR_BY_ORIGEN[entry.name] || '#6B7280' }}
              />
              <span className="text-zinc-200">{entry.name}</span>
            </div>
          ))}
        </div>
      )}
      {total === 0 && (
        <div className="text-center text-zinc-400 text-sm mt-2" aria-live="polite">Sin datos para el mes actual</div>
      )}
    </div>
  );
}


