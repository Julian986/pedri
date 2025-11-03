"use client";

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

type OrigenDato = {
  origen: 'Airbnb' | 'Booking' | 'Particular' | 'Otro' | string;
  count: number;
};

interface DonutOrigenProps {
  data: OrigenDato[];
}

const COLOR_BY_ORIGEN: Record<string, string> = {
  Airbnb: '#FF5A5F',
  Booking: '#003580',
  Particular: '#10B981',
  Otro: '#9CA3AF',
};

export default function DonutOrigen({ data }: DonutOrigenProps) {
  const total = data?.reduce((acc, item) => acc + (item.count || 0), 0) || 0;
  const chartData = (data || []).map((d) => ({ name: d.origen, value: d.count }));

  return (
    <div className="w-full h-80 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <h3 className="text-white text-base font-semibold mb-2">Distribución por origen</h3>
      <p className="text-zinc-400 text-sm mb-4">Total: {total}</p>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLOR_BY_ORIGEN[entry.name] || '#6B7280'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}
            itemStyle={{ color: '#e5e7eb' }}
          />
          <Legend iconType="circle" wrapperStyle={{ color: '#d1d5db' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}


