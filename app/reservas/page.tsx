'use client'

import { useEffect, useRef, useState } from 'react'

interface ReservaItem {
  id: string
  desde: string
  hasta: string
  propiedad: string
  huesped: string
  telefono: string
  valorTotal: number
  comision: number
  propietario: number
  plataforma: 'Airbnb' | 'Booking' | 'Particular' | string
}

export default function ReservasPage() {
  const [reservas, setReservas] = useState<ReservaItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [openFiltro, setOpenFiltro] = useState(false)
  const [propiedadFiltro, setPropiedadFiltro] = useState<string>('Todas')
  const propiedades = Array.from(new Set(reservas.map(r => r.propiedad)))
  const filtroRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (openFiltro && filtroRef.current && !filtroRef.current.contains(target)) {
        setOpenFiltro(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openFiltro])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setErrorMsg(null)
        const res = await fetch('/api/reservas')
        if (!res.ok) throw new Error(String(res.status))
        const json = await res.json()
        const list = Array.isArray(json?.reservas) ? json.reservas : []
        const mapped: ReservaItem[] = list.map((r: any) => {
          const origen = r.origen || 'Particular'
          const valorTotal = Number(r.precioTotal || 0)
          // Usar el porcentaje de comisión de la propiedad, o 10% por defecto si no está definido
          const comisionPorcentaje = r.propiedadId?.comisionPorcentaje ?? 10
          const comision = Math.round(valorTotal * (comisionPorcentaje / 100))
          const propietario = Math.max(0, valorTotal - comision)
          const propNombre = r.propiedadId?.nombre || r.propiedad || '—'
          const toISO = (d: string | Date | undefined) => {
            if (!d) return ''
            const dt = new Date(d)
            if (isNaN(dt.getTime())) return ''
            // Usar métodos locales para evitar problemas de zona horaria
            const year = dt.getFullYear()
            const month = String(dt.getMonth() + 1).padStart(2, '0')
            const day = String(dt.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
          }
          return {
            id: String(r._id),
            desde: toISO(r.fechaInicio),
            hasta: toISO(r.fechaFin),
            propiedad: propNombre,
            huesped: r.nombreHuesped || '',
            telefono: r.telefonoHuesped || '',
            valorTotal,
            comision,
            propietario,
            plataforma: origen,
          }
        })
        setReservas(mapped)
      } catch (e) {
        setErrorMsg('No se pudieron cargar las reservas.')
        setReservas([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const formatearFecha = (fecha: string) => {
    // Si la fecha viene en formato YYYY-MM-DD, parsearla como fecha local
    if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = fecha.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
    }
    // Si viene en otro formato, usar el método estándar
    const date = new Date(fecha)
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
  }

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(monto)
  }

  const getPlataformaColor = (plataforma: string) => {
    switch (plataforma) {
      case 'Airbnb':
        return 'bg-pink-500'
      case 'Booking':
        return 'bg-blue-500'
      case 'Particular':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <main className="min-h-screen bg-black text-white pb-16 md:pb-0">
      <div className="px-4 py-6">
        {errorMsg && (
          <div className="mb-3 text-xs text-red-400">{errorMsg}</div>
        )}
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Reservas</h1>
          <p className="text-sm text-gray-400">Registro de todas las reservas</p>
        </div>

        {/* Filtros */}
        <div className="mb-4 flex items-center justify-between">
          <div ref={filtroRef} className="relative">
            <button
              type="button"
              onClick={() => setOpenFiltro((v) => !v)}
              className="bg-gray-900/70 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white hover:bg-gray-800 min-w-[180px] text-left"
            >
              {`Propiedad: ${propiedadFiltro}`}
            </button>
            {openFiltro && (
              <div className="absolute left-0 top-full mt-2 w-60 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-30 max-h-64 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => { setPropiedadFiltro('Todas'); setOpenFiltro(false) }}
                  className={`w-full text-left px-3 py-2 text-sm ${propiedadFiltro === 'Todas' ? 'bg-gray-800 text-white' : 'text-gray-200 hover:bg-gray-800'}`}
                >
                  Todas
                </button>
                {propiedades.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setPropiedadFiltro(p); setOpenFiltro(false) }}
                    className={`w-full text-left px-3 py-2 text-sm ${propiedadFiltro === p ? 'bg-gray-800 text-white' : 'text-gray-200 hover:bg-gray-800'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lista de reservas */}
        {loading ? (
          <div className="text-gray-400 text-sm">Cargando...</div>
        ) : (
        <div className="space-y-4">
          {reservas
            .filter((r) => propiedadFiltro === 'Todas' ? true : r.propiedad === propiedadFiltro)
            .map((reserva) => (
            <div
              key={reserva.id}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-4"
            >
              {/* Fechas y plataforma */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {formatearFecha(reserva.desde)}
                  </span>
                  <span className="text-gray-500">→</span>
                  <span className="text-sm font-medium text-white">
                    {formatearFecha(reserva.hasta)}
                  </span>
                </div>
                <div className="bg-gray-800 px-4 py-1.5 rounded-full">
                  <span className="text-xs font-medium text-white">
                    {reserva.plataforma}
                  </span>
                </div>
              </div>

              {/* Propiedad */}
              <div className="mb-3">
                <h3 className="text-base font-semibold text-white">{reserva.propiedad}</h3>
              </div>

              {/* Huésped */}
              <div className="mb-3 pb-3 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Huésped</p>
                    <p className="text-sm font-medium text-white">{reserva.huesped}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Teléfono</p>
                    <p className="text-sm font-medium text-white">{reserva.telefono}</p>
                  </div>
                </div>
              </div>

              {/* Montos */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total</p>
                  <p className="text-sm font-bold text-white">{formatearMonto(reserva.valorTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Comisión</p>
                  <p className="text-sm font-medium text-orange-400">{formatearMonto(reserva.comision)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Propietario</p>
                  <p className="text-sm font-medium text-green-400">{formatearMonto(reserva.propietario)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </main>
  )
}

