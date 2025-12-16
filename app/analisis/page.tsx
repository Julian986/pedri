"use client";

import { useMemo, useState, useRef, useEffect } from 'react';
import PieOrigen from '@/components/charts/PieOrigen';
import PieGastos from '@/components/charts/PieGastos';
import BarGananciaPropiedad from '@/components/charts/BarGananciaPropiedad';

export default function AnalisisPage() {
  // Periodo por defecto: mes actual
  const now = new Date();
  const [modo, setModo] = useState<'mes' | 'año'>('mes');
  const [propFiltro, setPropFiltro] = useState<string[] | null>(null); // null = todas (placeholder)
  const [platFiltro, setPlatFiltro] = useState<string[] | null>(null); // null = todas (placeholder)
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const monthNames = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const years = useMemo(() => {
    const y = now.getFullYear();
    return [y - 2, y - 1, y, y + 1];
  }, [now]);
  const [openMonth, setOpenMonth] = useState<boolean>(false);
  const [openYear, setOpenYear] = useState<boolean>(false);
  const monthRef = useRef<HTMLDivElement | null>(null);
  const yearRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (openMonth && monthRef.current && !monthRef.current.contains(target)) setOpenMonth(false);
      if (openYear && yearRef.current && !yearRef.current.contains(target)) setOpenYear(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMonth, openYear]);

  // Datos reales
  const [dataOrigen, setDataOrigen] = useState<Array<{ origen: string; count: number }>>([])
  const [dataGastosCat, setDataGastosCat] = useState<Array<{ categoria: string; total: number }>>([])
  const [dataGananciaProp, setDataGananciaProp] = useState<Array<{ propiedad: string; ganancia: number }>>([])
  const [detalleProp, setDetalleProp] = useState<Array<{ propiedad: string; ingresos: number; comisiones: number; propietarios: number; gastos: number; ganancia: number; margen: number }>>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [reservasVersion, setReservasVersion] = useState(0)
  const lastReservasUpdatedAtRef = useRef<string>('')

  // Escuchar cambios de reservas (edición/alta/cancelación) para refrescar análisis
  useEffect(() => {
    const KEY = 'reservasUpdatedAt'
    const bump = () => setReservasVersion((v) => v + 1)

    const syncFromStorage = () => {
      try {
        const v = localStorage.getItem(KEY) || ''
        if (v && v !== lastReservasUpdatedAtRef.current) {
          lastReservasUpdatedAtRef.current = v
          bump()
        }
      } catch {}
    }

    const onCustom = () => bump()
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        lastReservasUpdatedAtRef.current = e.newValue || ''
        bump()
      }
    }
    const onFocus = () => syncFromStorage()
    const onVisibility = () => {
      if (!document.hidden) syncFromStorage()
    }

    syncFromStorage()
    window.addEventListener('reservas:changed', onCustom as any)
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('reservas:changed', onCustom as any)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const computeRange = () => {
    if (modo === 'mes') {
      const from = new Date(selectedYear, selectedMonth, 1, 0, 0, 0, 0);
      const to = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
      return { from: from.toISOString(), to: to.toISOString() };
    } else {
      const from = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
      const to = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
      return { from: from.toISOString(), to: to.toISOString() };
    }
  }

  useEffect(() => {
    const { from, to } = computeRange()
    const qs = (p: Record<string, string | undefined>) =>
      Object.entries(p).filter(([, v]) => Boolean(v)).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`).join('&')
    const url = (path: string, p: Record<string, string | undefined>) => `${path}?${qs(p)}`
    setLoading(true)
    setErrorMsg(null)
    Promise.allSettled([
      fetch(url('/api/analisis/origen', { from, to })).then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch(url('/api/analisis/gastos-categoria', { from, to })).then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch(url('/api/analisis/ganancia-propiedad', { from, to })).then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch(url('/api/analisis/detalle-propiedad', { from, to })).then(r => r.ok ? r.json() : Promise.reject(r.status)),
    ]).then(([o, g, gp, det]) => {
      setDataOrigen(o.status === 'fulfilled' ? (o.value.data || []) : [])
      setDataGastosCat(g.status === 'fulfilled' ? (g.value.data || []) : [])
      setDataGananciaProp(gp.status === 'fulfilled' ? (gp.value.data || []) : [])
      setDetalleProp(det.status === 'fulfilled' ? (det.value.data || []) : [])
    }).catch(() => {
      setErrorMsg('No se pudieron cargar los datos de análisis.')
    }).finally(() => setLoading(false))
  }, [modo, selectedMonth, selectedYear, reservasVersion])

  const kpis = useMemo(() => {
    const ingresos = detalleProp.reduce((a, r) => a + (r.ingresos || 0), 0)
    const comisiones = detalleProp.reduce((a, r) => a + (r.comisiones || 0), 0)
    const propietarios = detalleProp.reduce((a, r) => a + (r.propietarios || 0), 0)
    const gastos = detalleProp.reduce((a, r) => a + (r.gastos || 0), 0)
    const ganancia = detalleProp.reduce((a, r) => a + (r.ganancia || 0), 0)
    const margen = ingresos ? ganancia / ingresos : 0
    return { ingresos, comisiones, propietarios, gastos, ganancia, margen }
  }, [detalleProp]);

  const formatARS = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

  const exportCSV = () => {
    const rows = [
      ['KPI', 'Valor'],
      ['Ingresos', kpis.ingresos],
      ['Comisiones', kpis.comisiones],
      ['Propietarios', kpis.propietarios],
      ['Gastos', kpis.gastos],
      ['Ganancia', kpis.ganancia],
      ['Margen', kpis.margen],
      [],
      ['Plataforma', 'Reservas (%) aprox'],
      ...dataOrigen.map((d) => [d.origen, d.count]),
      [],
      ['Categoría Gasto', 'Total'],
      ...dataGastosCat.map((g) => [g.categoria, g.total]),
      [],
      ['Propiedad', 'Ganancia'],
      ...dataGananciaProp.map((g) => [g.propiedad, g.ganancia]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis-${now.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-black px-4 pt-6 pb-[calc(5rem+var(--kb-inset,0px))]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl text-white font-semibold">Análisis</h1>
            <p className="text-sm text-zinc-400 whitespace-nowrap overflow-hidden text-ellipsis">
              {modo === 'mes'
                ? `Mes: ${monthNames[selectedMonth]} ${selectedYear}`
                : `Año: ${selectedYear}`} · Actualizado {new Date().toLocaleDateString('es-AR')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-3 py-2 text-xs font-medium bg-zinc-900 text-white rounded-lg border border-zinc-800 hover:bg-zinc-800 whitespace-nowrap"
            >
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Controles */}
        <section className="mt-4 flex flex-wrap items-center gap-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setModo('mes')}
              className={`px-3 py-1.5 text-xs rounded-md ${modo === 'mes' ? 'bg-zinc-800 text-white' : 'text-zinc-300'}`}
            >
              Mes
            </button>
            <button
              onClick={() => setModo('año')}
              className={`px-3 py-1.5 text-xs rounded-md ${modo === 'año' ? 'bg-zinc-800 text-white' : 'text-zinc-300'}`}
              title="Ver acumulado del año"
            >
              Año
            </button>
          </div>
          {modo === 'mes' && (
            <>
              <div ref={monthRef} className="relative">
                <button
                  type="button"
                  onClick={() => { setOpenMonth((v) => !v); setOpenYear(false); }}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white hover:bg-zinc-800 min-w-[150px] text-left"
                  aria-haspopup="listbox"
                  aria-expanded={openMonth}
                >
                  {monthNames[selectedMonth]}
                </button>
                {openMonth && (
                  <div className="absolute left-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-30 max-h-64 overflow-y-auto">
                    {monthNames.map((m, idx) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => { setSelectedMonth(idx); setOpenMonth(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm ${idx === selectedMonth ? 'bg-zinc-800 text-white' : 'text-zinc-200 hover:bg-zinc-800'}`}
                        role="option"
                        aria-selected={idx === selectedMonth}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div ref={yearRef} className="relative">
                <button
                  type="button"
                  onClick={() => { setOpenYear((v) => !v); setOpenMonth(false); }}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white hover:bg-zinc-800 min-w-[110px] text-left"
                  aria-haspopup="listbox"
                  aria-expanded={openYear}
                >
                  {selectedYear}
                </button>
                {openYear && (
                  <div className="absolute left-0 top-full mt-2 w-36 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-30 max-h-56 overflow-y-auto">
                    {years.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => { setSelectedYear(y); setOpenYear(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm ${y === selectedYear ? 'bg-zinc-800 text-white' : 'text-zinc-200 hover:bg-zinc-800'}`}
                        role="option"
                        aria-selected={y === selectedYear}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          {modo === 'año' && (
            <div ref={yearRef} className="relative">
              <button
                type="button"
                onClick={() => { setOpenYear((v) => !v); setOpenMonth(false); }}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white hover:bg-zinc-800 min-w-[90px] text-left"
                aria-haspopup="listbox"
                aria-expanded={openYear}
              >
                {selectedYear}
              </button>
              {openYear && (
                <div className="absolute left-0 top-full mt-2 w-28 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-30 max-h-56 overflow-y-auto">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => { setSelectedYear(y); setOpenYear(false); }}
                      className={`w-full text-left px-3 py-2 text-xs ${y === selectedYear ? 'bg-zinc-800 text-white' : 'text-zinc-200 hover:bg-zinc-800'}`}
                      role="option"
                      aria-selected={y === selectedYear}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* <div className="text-xs text-zinc-400">
            Filtros: Propiedad {propFiltro ? `(${propFiltro.length})` : '(todas)'} · Plataforma {platFiltro ? `(${platFiltro.length})` : '(todas)'}
          </div> */}
        </section>

        {/* Tarjetas KPI */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="text-zinc-400 text-xs mb-1">Ingresos</div>
            <div className="text-white text-xl font-semibold">{formatARS(kpis.ingresos)}</div>
            <div className="text-xs text-emerald-400 mt-1">vs mes anterior +12%</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="text-zinc-400 text-xs mb-1">Comisiones</div>
            <div className="text-white text-xl font-semibold">{formatARS(kpis.comisiones)}</div>
            <div className="text-xs text-zinc-400 mt-1">sobre ingresos 34%</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="text-zinc-400 text-xs mb-1">Propietarios</div>
            <div className="text-white text-xl font-semibold">{formatARS(kpis.propietarios)}</div>
            <div className="text-xs text-zinc-400 mt-1">transferido 92% · pendiente 8%</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="text-zinc-400 text-xs mb-1">Gastos</div>
            <div className="text-white text-xl font-semibold">{formatARS(kpis.gastos)}</div>
            <div className="text-xs text-zinc-400 mt-1">Top: Limpieza · Otros</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="text-zinc-400 text-xs mb-1">Ganancia neta</div>
            <div className="text-white text-xl font-semibold">{formatARS(kpis.ganancia)}</div>
            <div className="text-xs text-emerald-400 mt-1">vs mes anterior +8%</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="text-zinc-400 text-xs mb-1">Margen</div>
            <div className="text-white text-xl font-semibold">{(kpis.margen * 100).toFixed(1)}%</div>
            <div className="text-xs text-zinc-400 mt-1">variación +1.2 pp</div>
          </div>
        </section>

        {/* Gráficos */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <PieOrigen data={dataOrigen} />
          <PieGastos data={dataGastosCat} />
        </section>
        <section className="mt-4">
          <BarGananciaPropiedad data={dataGananciaProp} />
        </section>

        {/* Tabla: detalle por propiedad */}
        <section className="mt-6 mb-24">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-x-auto">
            <div className="px-4 py-3 text-sm text-white font-medium">Detalle por propiedad </div>
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-950">
                <tr className="text-zinc-300">
                  <th className="text-left px-4 py-2 border-t border-b border-zinc-800">Propiedad</th>
                  <th className="text-right px-4 py-2 border-t border-b border-zinc-800">Ingresos</th>
                  <th className="text-right px-4 py-2 border-t border-b border-zinc-800">Comisiones</th>
                  <th className="text-right px-4 py-2 border-t border-b border-zinc-800">Propietarios</th>
                  <th className="text-right px-4 py-2 border-t border-b border-zinc-800">Gastos</th>
                  <th className="text-right px-4 py-2 border-t border-b border-zinc-800">Ganancia</th>
                  <th className="text-right px-4 py-2 border-t border-b border-zinc-800">Margen</th>
                </tr>
              </thead>
              <tbody>
                {detalleProp.map((row) => (
                  <tr key={row.propiedad} className="border-b border-zinc-800 hover:bg-zinc-900/40">
                    <td className="px-4 py-2 text-white">{row.propiedad}</td>
                    <td className="px-4 py-2 text-right text-zinc-200">{formatARS(row.ingresos)}</td>
                    <td className="px-4 py-2 text-right text-zinc-200">{formatARS(row.comisiones)}</td>
                    <td className="px-4 py-2 text-right text-zinc-200">{formatARS(row.propietarios)}</td>
                    <td className="px-4 py-2 text-right text-zinc-200">{formatARS(row.gastos)}</td>
                    <td className="px-4 py-2 text-right text-emerald-400 font-medium">{formatARS(row.ganancia)}</td>
                    <td className="px-4 py-2 text-right text-zinc-300">{(row.margen * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 text-xs text-zinc-400">
              Nota: Ganancia = Ingresos − Propietarios − Gastos (equivalente a Comisiones − Gastos).
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

