'use client'

import { useState, useEffect, useRef } from 'react'
import { IoClose, IoChevronDown, IoLogoWhatsapp } from 'react-icons/io5'
import RangeDatePicker from './RangeDatePicker'

interface AvailabilityModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Propiedad {
  _id: string
  nombre: string
  direccion?: string
  ciudad?: string
  // Precio base por noche (ARS)
  base?: number
  // Capacidad del alojamiento (personas)
  capacidad?: number
  // Fallback (si se usa en otros lados del sistema)
  precioPorNoche?: number
}

export default function AvailabilityModal({ isOpen, onClose }: AvailabilityModalProps) {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [propiedadesDisponibles, setPropiedadesDisponibles] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados para la sección de cálculo de costo
  const [alojamientoSeleccionado, setAlojamientoSeleccionado] = useState<string>('') // _id
  const [periodoInicio, setPeriodoInicio] = useState<string>('')
  const [periodoFin, setPeriodoFin] = useState<string>('')
  const [cantidadPersonas, setCantidadPersonas] = useState<string>('')
  const [costoCalculado, setCostoCalculado] = useState<number | null>(null)
  const [descuentoAplicadoPct, setDescuentoAplicadoPct] = useState<number>(0)
  const [openAlojamiento, setOpenAlojamiento] = useState(false)
  const [openUpAlojamiento, setOpenUpAlojamiento] = useState(false)
  const alojamientoRef = useRef<HTMLDivElement | null>(null)

  const formatYmd = (ymd: string) => {
    const [y, m, d] = (ymd || '').slice(0, 10).split('-')
    if (!y || !m || !d) return ymd
    return `${d}/${m}/${y}`
  }

  const personaLabel = (n: number) => (n === 1 ? 'persona' : 'personas')

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Cargar todas las propiedades cuando se abre el modal
  useEffect(() => {
    const loadPropiedades = async () => {
      try {
        const res = await fetch('/api/propiedades')
        if (!res.ok) throw new Error('Error cargando propiedades')
        const json = await res.json()
        const list: any[] = Array.isArray(json?.propiedades) ? json.propiedades : []
        setPropiedades(list)
      } catch {
        setError('No se pudieron cargar las propiedades')
      }
    }
    if (isOpen) {
      loadPropiedades()
      // Resetear estado
      setStartDate('')
      setEndDate('')
      setPropiedadesDisponibles([])
      setError(null)
      setAlojamientoSeleccionado('')
      setPeriodoInicio('')
      setPeriodoFin('')
      setCantidadPersonas('')
      setCostoCalculado(null)
      setDescuentoAplicadoPct(0)
    }
  }, [isOpen])

  // Cerrar menú de alojamiento al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (openAlojamiento && alojamientoRef.current && !alojamientoRef.current.contains(target)) {
        setOpenAlojamiento(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openAlojamiento])

  // Buscar propiedades disponibles cuando se selecciona un rango
  useEffect(() => {
    if (startDate && endDate && propiedades.length > 0) {
      buscarDisponibilidad()
    } else {
      setPropiedadesDisponibles([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, propiedades.length])

  const buscarDisponibilidad = async () => {
    if (!startDate || !endDate) return

    setLoading(true)
    setError(null)

    try {
      // Convertir fechas a formato ISO para la API
      // Usar mediodía UTC para evitar problemas de zona horaria
      const start = new Date(startDate + 'T12:00:00Z')
      const end = new Date(endDate + 'T12:00:00Z')

      // Obtener todas las reservas que se solapan con el rango
      // La API usa $lte y $gte, que es más conservador (incluye solapamientos en los bordes)
      const from = start.toISOString()
      const to = end.toISOString()
      const res = await fetch(`/api/reservas?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)

      if (!res.ok) throw new Error('Error buscando disponibilidad')

      const json = await res.json()
      const reservas: any[] = Array.isArray(json?.reservas) ? json.reservas : []

      // Filtrar reservas que no estén canceladas
      const reservasActivas = reservas.filter((r) => r.estado !== 'cancelada')

      // Verificar solapamiento real usando la misma lógica que el POST (permite checkout=checkin siguiente)
      // Una reserva se solapa si: fechaInicio < end && fechaFin > start
      const propiedadesOcupadasIds = new Set<string>()

      reservasActivas.forEach((r: any) => {
        const reservaInicio = new Date(r.fechaInicio)
        const reservaFin = new Date(r.fechaFin)

        // Verificar solapamiento real (misma lógica que POST)
        // Permite checkout=checkin siguiente (fin de reserva = inicio de búsqueda o viceversa)
        const haySolapamiento = reservaInicio < end && reservaFin > start

        if (haySolapamiento) {
          // Obtener ID de la propiedad
          const propId = r.propiedadId?._id || r.propiedadId
          if (propId) {
            propiedadesOcupadasIds.add(String(propId))
          }
        }
      })

      // Filtrar propiedades disponibles (las que NO están en la lista de ocupadas)
      const disponibles = propiedades.filter((prop) => !propiedadesOcupadasIds.has(String(prop._id)))

      setPropiedadesDisponibles(disponibles)
    } catch {
      setError('Error al buscar disponibilidad')
      setPropiedadesDisponibles([])
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  const handlePeriodoChange = (start: string, end: string) => {
    setPeriodoInicio(start)
    setPeriodoFin(end)
  }

  const calcularCotizacion = () => {
    if (!alojamientoSeleccionado || !periodoInicio || !periodoFin || !cantidadPersonas) return null

    const inicio = new Date(periodoInicio + 'T00:00:00')
    const fin = new Date(periodoFin + 'T00:00:00')
    const noches = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
    const personas = parseInt(cantidadPersonas) || 1

    const prop = propiedades.find((p) => String(p._id) === String(alojamientoSeleccionado))
    const precioBaseNoche = Math.max(0, Number(prop?.base ?? prop?.precioPorNoche ?? 0))
    const capAloj = Math.max(1, Number(prop?.capacidad ?? 1))

    // Descuento por noches: 5+ = 12%, 10+ = 18%, 20+ = 25%
    const descuentoPorNochesPct = noches >= 20 ? 25 : noches >= 10 ? 18 : noches >= 5 ? 12 : 0

    // Descuento por ocupación según capacidad del dpto
    const descuentoPorOcupacionPct = (() => {
      if (capAloj === 4) {
        if (personas === 3) return 8
        if (personas === 2) return 12
        if (personas === 1) return 15
        return 0
      }
      if (capAloj === 3) {
        if (personas === 2) return 8
        if (personas === 1) return 12
        return 0
      }
      return 0
    })()

    const descuentoTotalPct = Math.min(60, descuentoPorNochesPct + descuentoPorOcupacionPct)

    // Cálculo: precio base por noche * noches, aplicando descuentos
    const subtotal = Math.round(precioBaseNoche * noches)
    const total = Math.round(subtotal * (1 - descuentoTotalPct / 100))

    return {
      noches,
      personas,
      capAloj,
      precioBaseNoche,
      descuentoPorNochesPct,
      descuentoPorOcupacionPct,
      descuentoTotalPct,
      subtotal,
      total,
      propiedad: prop,
    }
  }

  // Calcular costo ficticio
  const handleCalcular = () => {
    const cot = calcularCotizacion()
    if (!cot) return
    setDescuentoAplicadoPct(cot.descuentoTotalPct)
    setCostoCalculado(cot.total)
  }

  const puedeCompartir = Boolean(
    (startDate && endDate) ||
      (alojamientoSeleccionado && periodoInicio && periodoFin && cantidadPersonas && costoCalculado !== null)
  )

  const handleCompartirWhatsApp = () => {
    const lineas: string[] = []

    if (startDate && endDate) {
      lineas.push('DISPONIBILIDAD')
      lineas.push(`Período: ${formatYmd(startDate)} a ${formatYmd(endDate)}`)

      if (loading) {
        lineas.push('Alojamientos disponibles: (buscando...)')
      } else if (error) {
        lineas.push(`Alojamientos disponibles: (error: ${error})`)
      } else if (propiedadesDisponibles.length === 0) {
        lineas.push('Alojamientos disponibles: (sin resultados)')
      } else {
        lineas.push('Alojamientos disponibles:')
        propiedadesDisponibles.forEach((p) => {
          const extra = [p.direccion, p.ciudad].filter(Boolean).join(' - ')
          const cap = Math.max(1, Number(p.capacidad ?? 1))
          const capacidadTxt = `Cap: ${cap} ${personaLabel(cap)}`
          lineas.push(`- ${p.nombre}${extra ? ` (${extra})` : ''} · ${capacidadTxt}`)
        })
      }
    }

    const cot = calcularCotizacion()
    if (cot) {
      if (lineas.length > 0) lineas.push('')
      lineas.push('COTIZACIÓN')
      if (cot.propiedad?.nombre) lineas.push(`Alojamiento: ${cot.propiedad.nombre}`)
      lineas.push(`Período: ${formatYmd(periodoInicio)} a ${formatYmd(periodoFin)}`)
      lineas.push(`Noches: ${cot.noches}`)
      lineas.push(`Cantidad de personas: ${cot.personas}`)
      lineas.push(`Cap. del alojamiento: ${cot.capAloj} ${personaLabel(cot.capAloj)}`)
      lineas.push(`Descuento total: ${cot.descuentoTotalPct}%`)
      lineas.push(
        `Total: ${new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          minimumFractionDigits: 0,
        }).format(cot.total)}`
      )
      lineas.push('Moneda: ARS')
    }

    const texto = lineas.join('\n').trim()
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const puedeCalcular = alojamientoSeleccionado && periodoInicio && periodoFin && cantidadPersonas
  const propertyList = propiedades.map((p) => ({ id: String(p._id), nombre: p.nombre }))
  const alojamientoSeleccionadoNombre =
    propiedades.find((p) => String(p._id) === String(alojamientoSeleccionado))?.nombre || ''

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Buscar Disponibilidad</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Cerrar"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Selector de período */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Seleccionar período</label>
            <RangeDatePicker startDate={startDate} endDate={endDate} onChange={handleDateChange} />
          </div>

          {/* Lista de propiedades disponibles */}
          {startDate && endDate && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Alojamientos disponibles</h3>

              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">Buscando disponibilidad...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              ) : propiedadesDisponibles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No hay alojamientos disponibles en este período</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {propiedadesDisponibles.map((propiedad) => (
                    <div key={propiedad._id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <h4 className="text-white font-semibold text-base mb-1">{propiedad.nombre}</h4>
                      {propiedad.direccion && <p className="text-gray-400 text-sm">{propiedad.direccion}</p>}
                      {propiedad.ciudad && <p className="text-gray-500 text-xs mt-1">{propiedad.ciudad}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Separador */}
          <div className="border-t border-gray-700 my-6"></div>

          {/* Sección de cálculo de costo */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Calcular costo</h3>

            {/* Campo 1: Seleccionar alojamiento */}
            <div ref={alojamientoRef} className="relative">
              <button
                type="button"
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect()
                  const espacioAbajo = window.innerHeight - rect.bottom
                  setOpenUpAlojamiento(espacioAbajo < 240)
                  setOpenAlojamiento((v) => !v)
                }}
                className="relative w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <IoChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <span className={`text-sm ${alojamientoSeleccionado ? 'text-gray-200' : 'text-gray-400'}`}>
                  {alojamientoSeleccionado ? alojamientoSeleccionadoNombre : 'Seleccionar alojamiento'}
                </span>
              </button>
              {openAlojamiento && (
                <div
                  className={`absolute left-0 right-0 ${openUpAlojamiento ? 'bottom-full mb-2' : 'top-full mt-2'} bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto`}
                >
                  {propertyList.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-400">No hay alojamientos</div>
                  ) : (
                    propertyList.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setAlojamientoSeleccionado(item.id)
                          setOpenAlojamiento(false)
                        }}
                        className="w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                      >
                        {item.nombre}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Campo 2: Seleccionar período de tiempo */}
            <div>
              <RangeDatePicker startDate={periodoInicio} endDate={periodoFin} onChange={handlePeriodoChange} />
            </div>

            {/* Campo 3: Cantidad de personas */}
            <div>
              <input
                type="number"
                min="1"
                value={cantidadPersonas}
                onChange={(e) => setCantidadPersonas(e.target.value)}
                placeholder="Cantidad de personas"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Botón Calcular */}
            <button
              type="button"
              onClick={handleCalcular}
              disabled={!puedeCalcular}
              className={`w-full py-3 rounded-lg font-medium text-sm transition-colors ${
                puedeCalcular
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Calcular
            </button>

            {/* Resultado */}
            {costoCalculado !== null && (
              <div className="border border-gray-700 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Costo total:</span>
                  <span className="text-lg font-bold text-white">
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: 'ARS',
                      minimumFractionDigits: 0,
                    }).format(costoCalculado)}
                  </span>
                </div>
                {descuentoAplicadoPct > 0 && (
                  <div className="mt-2 text-xs text-gray-400">
                    Descuento aplicado: {descuentoAplicadoPct}%
                  </div>
                )}
              </div>
            )}

            {/* Compartir por WhatsApp */}
            <button
              type="button"
              onClick={handleCompartirWhatsApp}
              disabled={!puedeCompartir}
              className={`w-full py-3 rounded-lg font-medium text-sm transition-colors ${
                puedeCompartir
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              } flex items-center justify-center gap-2`}
            >
              <IoLogoWhatsapp className="text-lg" />
              Compartir por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

