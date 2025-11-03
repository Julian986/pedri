"use client";

import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, Label } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';

type OrigenDato = {
  origen: 'Airbnb' | 'Booking' | 'Particular' | string;
  count: number;
};

interface PieOrigenProps {
  data: OrigenDato[];
}

const COLOR_BY_ORIGEN: Record<string, string> = {
  Airbnb: '#5B9BD5',
  Booking: '#ED7D31',
  Particular: '#70AD47',
};

export default function PieOrigen({ data }: PieOrigenProps) {
  const cleaned = useMemo(() => {
    const base = ['Airbnb', 'Booking', 'Particular'];
    const map: Record<string, number> = { Airbnb: 0, Booking: 0, Particular: 0 };
    (data || []).forEach((d) => {
      const key = base.includes(d.origen) ? d.origen : undefined;
      if (key) map[key] += d.count || 0;
    });
    return base.map((k) => ({ name: k, value: map[k] || 0 }));
  }, [data]);

  const total = cleaned.reduce((acc, it) => acc + it.value, 0);

  return (
    <div className="w-full h-96 bg-zinc-900 rounded-xl p-4 border border-zinc-800" role="img" aria-label="Gráfico de torta del origen de clientes">
      <h3 className="text-white text-base font-semibold mb-2">Origen de clientes</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
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
          {total > 0 && <Legend iconType="circle" wrapperStyle={{ color: '#d1d5db' }} />}
        </PieChart>
      </ResponsiveContainer>
      {total === 0 && (
        <div className="text-center text-zinc-400 text-sm mt-2" aria-live="polite">Sin datos para el mes actual</div>
      )}
    </div>
  );
}


