"use client";

import React, { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Label } from "recharts";
import type { PieLabelRenderProps } from "recharts";

export type GastoCategoriaDato = {
  categoria: string;
  total: number;
};

interface PieGastosProps {
  data: GastoCategoriaDato[];
  title?: string;
}

const PALETTE = [
  "#F59E0B", // amber-500
  "#10B981", // emerald-500
  "#60A5FA", // blue-400
  "#EC4899", // pink-500
  "#A78BFA", // violet-400
  "#F87171", // red-400
  "#34D399", // green-400
  "#FB923C", // orange-400
  "#F472B6", // rose-400
  "#93C5FD", // blue-300
  "#EAB308", // yellow-500
  "#22D3EE", // cyan-400
];

export default function PieGastos({ data, title = "Gastos por categoría" }: PieGastosProps) {
  const cleaned = useMemo(
    () =>
      (data || [])
        .map((d) => ({ name: d.categoria, value: Number(d.total || 0) }))
        .filter((d) => d.value >= 0)
        .sort((a, b) => b.value - a.value),
    [data]
  );

  const total = cleaned.reduce((acc, it) => acc + it.value, 0);

  return (
    <div className="w-full bg-zinc-900 rounded-xl p-4 border border-zinc-800" role="img" aria-label="Gráfico de torta de gastos por categoría">
      <h3 className="text-white text-base font-semibold mb-4">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 12, right: 0, bottom: 8, left: 0 }}>
            <Pie
              data={cleaned}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              labelLine={false}
              label={(entry: PieLabelRenderProps) => {
                const raw = (entry as any)?.value as unknown;
                const value = typeof raw === "number" ? raw : Number(raw ?? 0);
                if (!total || value === 0) return "";
                const pct = Math.round((value / total) * 100);
                return `${pct}%`;
              }}
            >
              {cleaned.map((entry, idx) => (
                <Cell key={`cell-gasto-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
              ))}
              <Label value={total ? "" : "Sin datos"} position="center" fill="#9ca3af" />
            </Pie>
            <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }} itemStyle={{ color: "#e5e7eb" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Leyenda personalizada, siempre debajo del gráfico */}
      {total > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {cleaned.map((entry, idx) => (
            <div key={`legend-gasto-${entry.name}-${idx}`} className="flex items-center gap-1 text-sm">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
              />
              <span className="text-zinc-200">{entry.name}</span>
            </div>
          ))}
        </div>
      )}
      {total === 0 && (
        <div className="text-center text-zinc-400 text-sm mt-2" aria-live="polite">
          Sin datos para el periodo
        </div>
      )}
    </div>
  );
}


