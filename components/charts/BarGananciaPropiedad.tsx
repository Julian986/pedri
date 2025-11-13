"use client";

import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from "recharts";

export type GananciaPropDato = {
  propiedad: string;
  ganancia: number;
};

interface BarGananciaPropiedadProps {
  data: GananciaPropDato[];
  title?: string;
  topN?: number;
}

export default function BarGananciaPropiedad({ data, title = "Ganancia por propiedad", topN = 8 }: BarGananciaPropiedadProps) {
  const cleaned = useMemo(() => {
    const arr = (data || [])
      .map((d) => ({ propiedad: d.propiedad, ganancia: Number(d.ganancia || 0) }))
      .sort((a, b) => b.ganancia - a.ganancia);
    return arr.slice(0, topN);
  }, [data, topN]);

  const formatARS = (n: number) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

  const ValueLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const textX = x + width + 8;
    const textY = y + (height ?? 0) / 2;
    return (
      <text x={textX} y={textY} dy="0.35em" fill="#e5e7eb" fontSize={12}>
        {formatARS(Number(value || 0))}
      </text>
    );
  };

  return (
    <div className="w-full h-[420px] bg-zinc-900 rounded-xl p-4 border border-zinc-800" role="img" aria-label="Gráfico de barras de ganancia por propiedad">
      <h3 className="text-white text-base font-semibold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={cleaned} layout="vertical" margin={{ top: 8, right: 120, bottom: 8, left: 16 }}>
          <CartesianGrid stroke="#27272a" horizontal={false} />
          <XAxis type="number" domain={[0, 'dataMax']} tick={false} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="propiedad" width={160} tick={{ fill: "#d1d5db", fontSize: 12 }} />
          <Tooltip
            formatter={(v) => formatARS(Number(v))}
            contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }}
            itemStyle={{ color: "#e5e7eb" }}
            labelStyle={{ color: "#d1d5db" }}
          />
          <Bar dataKey="ganancia" fill="#22c55e" radius={[4, 4, 4, 4]}>
            <LabelList dataKey="ganancia" content={<ValueLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


