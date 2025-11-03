"use client";

import dynamic from 'next/dynamic';
const PieOrigen = dynamic(() => import('@/components/charts/PieOrigen'), { ssr: false });

const demoData = [
  { origen: 'Airbnb', count: 55 },
  { origen: 'Booking', count: 25 },
  { origen: 'Particular', count: 20 },
];

export default function AnalisisPage() {
  const ingresosMes = 1250000; // ARS ficticio
  const gastosMes = 420000; // ARS ficticio
  const reservasMes = 18; // cantidad ficticia

  const formatARS = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

  return (
    <main className="min-h-screen bg-black px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl text-white font-semibold">Análisis</h1>
        <p className="text-sm text-zinc-400 mb-4">Mes actual · Actualizado {new Date().toLocaleDateString('es-AR')}</p>

        <PieOrigen data={demoData} />

        {/* Resumen accesible (para lectores de pantalla) */}
        <div className="sr-only" id="resumen-origen">
          Distribución por origen: Airbnb {demoData[0].count}, Booking {demoData[1].count}, Particular {demoData[2].count}.
        </div>

        {/* Totales del mes actual */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="text-zinc-400 text-xs mb-1">Ingresos del mes</div>
            <div className="text-white text-xl font-semibold">{formatARS(ingresosMes)}</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="text-zinc-400 text-xs mb-1">Gastos del mes</div>
            <div className="text-white text-xl font-semibold">{formatARS(gastosMes)}</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="text-zinc-400 text-xs mb-1">Reservas del mes</div>
            <div className="text-white text-xl font-semibold">{reservasMes}</div>
          </div>
        </section>
      </div>
    </main>
  );
}

