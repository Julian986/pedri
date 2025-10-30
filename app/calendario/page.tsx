'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { IoAdd, IoPencil, IoTrash } from 'react-icons/io5'
import { useModal } from '@/contexts/ModalContext'
import AlojamientoModal from '@/components/AlojamientoModal'

// Tipos de datos
interface Propiedad {
  _id: string
  nombre: string
  direccion?: string
}

interface Reserva {
  _id: string
  propiedad: string
  fechaInicio: string
  fechaFin: string
  precio: number
  nombreHuesped?: string
}

interface EstadoDia {
  ocupado: boolean
  precio?: number
  reservaId?: string
}

// Constantes fuera del componente para evitar recreación
const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DIAS_NOMBRES_CORTOS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

const PROPIEDADES_DEMO: Propiedad[] = [
  { _id: '1', nombre: 'Ayres de Güemes' },
  { _id: '2', nombre: 'Excelente ubicación Güemes, Luminoso' },
  { _id: '3', nombre: 'Frente al Mar! Hermosas vistas! Cochera' },
  { _id: '4', nombre: 'Frente al Mar! Increíbles vistas! Con piscina' },
  { _id: '5', nombre: 'Hermosas vistas, cálido y luminoso' },
  { _id: '6', nombre: 'Lo de Vicente' }
]

const padNumero = (valor: number) => String(valor).padStart(2, '0')

const crearReservasDemo = (año: number, mes: number): Reserva[] => [
  {
    _id: 'demo-1',
    propiedad: '1',
    fechaInicio: `${año}-${padNumero(mes + 1)}-05`,
    fechaFin: `${año}-${padNumero(mes + 1)}-08`,
    precio: 200
  },
  {
    _id: 'demo-2',
    propiedad: '2',
    fechaInicio: `${año}-${padNumero(mes + 1)}-15`,
    fechaFin: `${año}-${padNumero(mes + 1)}-18`,
    precio: 180
  }
]

const MODO_DEMO_CALENDARIO = process.env.NEXT_PUBLIC_CALENDARIO_MODO_DEMO === 'true'

// Parser seguro para 'YYYY-MM-DD' evitando desfases por timezone
const parseFechaYMD = (value: string) => {
  const ymd = value.slice(0, 10).split('-')
  return new Date(Number(ymd[0]), Number(ymd[1]) - 1, Number(ymd[2]))
}

export default function CalendarioPage() {
  const fechaInicial = new Date()
  const añoActual = fechaInicial.getFullYear()
  const mesActual = fechaInicial.getMonth()
  
  const [mesVisor, setMesVisor] = useState(mesActual)
  const [añoVisor, setAñoVisor] = useState(añoActual)
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [cargando, setCargando] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [colWidth, setColWidth] = useState<number>(160) // ancho en px de la columna de Alojamientos
  const [mostrarAjusteColumna, setMostrarAjusteColumna] = useState<boolean>(false)
  const ajusteRef = useRef<HTMLDivElement>(null)
  const { setIsModalOpen: setGlobalModalOpen } = useModal()
  const [isAlojModalOpen, setIsAlojModalOpen] = useState(false)
  const [propEnEdicion, setPropEnEdicion] = useState<Propiedad | null>(null)

  // Cerrar panel de ajuste al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!mostrarAjusteColumna) return
      const target = e.target as Node
      if (ajusteRef.current && !ajusteRef.current.contains(target)) {
        setMostrarAjusteColumna(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mostrarAjusteColumna])

  // Sincronizar estado local de modal con contexto global para desactivar BottomNav
  useEffect(() => {
    setGlobalModalOpen(isAlojModalOpen)
    return () => setGlobalModalOpen(false)
  }, [isAlojModalOpen, setGlobalModalOpen])

  // Solo generar días del mes actual visible (máximo 31 días)
  const diasDelMes = useMemo(() => {
    const dias: { dia: number, nombreDia: string }[] = []
    const diasEnMes = new Date(añoVisor, mesVisor + 1, 0).getDate()
    const primerDia = new Date(añoVisor, mesVisor, 1)
    
    for (let dia = 1; dia <= diasEnMes; dia++) {
      dias.push({
        dia,
        nombreDia: DIAS_NOMBRES_CORTOS[(primerDia.getDay() + dia - 1) % 7]
      })
    }
    
    return dias
  }, [mesVisor, añoVisor])

  // Indexar reservas por propiedad y día del mes visible: O(n) preproceso, O(1) por celda
  const ocupacionPorPropiedad = useMemo(() => {
    const mapa = new Map<string, Map<number, number>>()
    if (reservas.length === 0) return mapa

    const inicioMes = new Date(añoVisor, mesVisor, 1)
    const finMes = new Date(añoVisor, mesVisor + 1, 0)
    inicioMes.setHours(0, 0, 0, 0)
    finMes.setHours(0, 0, 0, 0)

    for (const reserva of reservas) {
      const inicio = parseFechaYMD(reserva.fechaInicio)
      const fin = parseFechaYMD(reserva.fechaFin)
      inicio.setHours(0, 0, 0, 0)
      fin.setHours(0, 0, 0, 0)

      // Intersección con el mes visible
      const desde = inicio > inicioMes ? inicio : inicioMes
      const hasta = fin < finMes ? fin : finMes
      if (desde > hasta) continue

      let diasProp = mapa.get(reserva.propiedad)
      if (!diasProp) {
        diasProp = new Map<number, number>()
        mapa.set(reserva.propiedad, diasProp)
      }

      for (let d = new Date(desde); d <= hasta; d.setDate(d.getDate() + 1)) {
        diasProp.set(d.getDate(), reserva.precio)
      }
    }

    return mapa
  }, [reservas, mesVisor, añoVisor])

  // Cargar datos
  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setCargando(true)
    const inicioMedicion = performance.now()
    try {
      if (MODO_DEMO_CALENDARIO) {
        setPropiedades(PROPIEDADES_DEMO)
        setReservas(crearReservasDemo(añoVisor, mesVisor))
        return
      }

      const fetchWithTimeout = async (url: string, timeoutMs = 800) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
        try {
          return await fetch(url, { signal: controller.signal })
        } finally {
          clearTimeout(timeoutId)
        }
      }

      const [resPropiedades, resReservas] = await Promise.all([
        fetchWithTimeout('/api/propiedades'),
        fetchWithTimeout('/api/reservas')
      ])

      const dataPropiedades: any = resPropiedades.ok ? await resPropiedades.json() : null
      const dataReservas: any = resReservas.ok ? await resReservas.json() : null

      const propiedadesObtenidas: Propiedad[] =
        dataPropiedades?.success && Array.isArray(dataPropiedades.data) && dataPropiedades.data.length > 0
          ? dataPropiedades.data
          : PROPIEDADES_DEMO

      setPropiedades(propiedadesObtenidas)

      const reservasObtenidas: Reserva[] =
        dataReservas?.success && Array.isArray(dataReservas.data) && dataReservas.data.length > 0
          ? dataReservas.data
          : Array.isArray(dataReservas?.reservas) && dataReservas.reservas.length > 0
            ? dataReservas.reservas
            : crearReservasDemo(añoVisor, mesVisor)

      setReservas(reservasObtenidas)
    } catch (error) {
      const isAbort = error instanceof DOMException && error.name === 'AbortError'
      if (isAbort) {
        console.warn('[Calendario] Peticiones abortadas por timeout. Usando datos demo')
      } else {
        console.error('Error al cargar datos:', error)
      }
      setPropiedades(PROPIEDADES_DEMO)
      setReservas(crearReservasDemo(añoVisor, mesVisor))
    } finally {
      setCargando(false)
      const duracion = performance.now() - inicioMedicion
      console.log(`[Calendario] cargarDatos tomó ${duracion.toFixed(1)} ms`)
    }
  }

  // Handlers CRUD Alojamientos
  const abrirNuevoAlojamiento = () => {
    setPropEnEdicion(null)
    setIsAlojModalOpen(true)
  }

  const abrirEditarAlojamiento = (prop: Propiedad) => {
    setPropEnEdicion(prop)
    setIsAlojModalOpen(true)
  }

  const guardarAlojamiento = (data: { nombre: string; direccion?: string }) => {
    if (propEnEdicion) {
      setPropiedades((prev) => prev.map((p) => (p._id === propEnEdicion._id ? { ...p, nombre: data.nombre, direccion: data.direccion } : p)))
    } else {
      const nuevo: Propiedad = { _id: Date.now().toString(), nombre: data.nombre, direccion: data.direccion }
      setPropiedades((prev) => [nuevo, ...prev])
    }
  }

  const eliminarAlojamiento = (id: string) => {
    setPropiedades((prev) => prev.filter((p) => p._id !== id))
    // Opcional: limpiar reservas asociadas para evitar trabajo innecesario
    setReservas((prev) => prev.filter((r) => r.propiedad !== id))
  }

  // Chequeo O(1) usando el índice
  const obtenerEstadoDia = (propiedadId: string, diaNumero: number): EstadoDia => {
    const diasProp = ocupacionPorPropiedad.get(propiedadId)
    if (!diasProp) return { ocupado: false }
    const precio = diasProp.get(diaNumero)
    if (precio !== undefined) {
      return { ocupado: true, precio }
    }
    return { ocupado: false }
  }

  const cambiarMes = useCallback((direccion: 'anterior' | 'siguiente') => {
    let nuevoMes = mesVisor
    let nuevoAño = añoVisor
    
    if (direccion === 'anterior') {
      if (mesVisor === 0) {
        nuevoMes = 11
        nuevoAño = añoVisor - 1
      } else {
        nuevoMes = mesVisor - 1
      }
    } else {
      if (mesVisor === 11) {
        nuevoMes = 0
        nuevoAño = añoVisor + 1
      } else {
        nuevoMes = mesVisor + 1
      }
    }
    
    setMesVisor(nuevoMes)
    setAñoVisor(nuevoAño)

    // Ajustar scroll horizontal: siguiente => día 1; anterior => último día
    const cellWidth = 96
    const diasEnMesDestino = new Date(nuevoAño, nuevoMes + 1, 0).getDate()
    const leftDestino = direccion === 'siguiente' ? 0 : Math.max(0, (diasEnMesDestino - 1) * cellWidth)

    // Ejecutar tras el re-render del nuevo mes
    setTimeout(() => {
      if (!scrollRef.current) return
      scrollRef.current.scrollTo({ left: leftDestino, behavior: 'auto' })
    }, 0)
  }, [mesVisor, añoVisor])
  
  if (cargando) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center pb-16 md:pb-0">
        <div className="text-gray-400">Cargando...</div>
      </main>
    )
  }

  // Hoy precomputado para resaltar
  const hoy = new Date()
  const hoyDia = hoy.getDate()
  const hoyMes = hoy.getMonth()
  const hoyAño = hoy.getFullYear()

  return (
    <main className="min-h-screen bg-black text-white flex flex-col pb-16 md:pb-0">
      {/* Header con navegación de mes */}
      <div className="sticky top-0 bg-black z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => cambiarMes('anterior')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{NOMBRES_MESES[mesVisor]}</h2>
            <span className="text-sm text-gray-400">{añoVisor}</span>
          </div>
          
          <button
            onClick={() => cambiarMes('siguiente')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabla de calendario */}
      <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-auto relative">
        <div className="inline-flex flex-col min-w-full">
          {/* Fila de encabezados de días */}
          <div className="flex sticky top-0 bg-black z-20 border-t border-b border-gray-800">
            {/* Columna fija de alojamientos */}
            <div className="flex-shrink-0 sticky left-0 bg-black z-30 border-r border-gray-700" style={{ width: colWidth }}>
              <div className="h-12 flex items-center px-4">
                {colWidth > 102 && (
                  <span className="text-sm font-medium text-gray-400">Alojamientos</span>
                )}
              </div>
            </div>
            
            {/* Días del mes */}
            {diasDelMes.map((diaInfo) => {
              const esHoyHeader = hoyDia === diaInfo.dia && hoyMes === mesVisor && hoyAño === añoVisor
              return (
                <div
                  key={`dia-${diaInfo.dia}`}
                  className="w-24 flex-shrink-0 bg-black border-r border-gray-800"
                >
                  <div className="h-12 flex flex-col items-center justify-center text-xs">
                    <div className="text-gray-400">{diaInfo.nombreDia}</div>
                    <div className={`font-medium ${esHoyHeader ? 'text-orange-400 font-bold' : ''}`}>{diaInfo.dia}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Filas de propiedades */}
          {propiedades.map((propiedad) => (
            <div key={propiedad._id} className="group flex border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
              {/* Nombre de la propiedad (columna fija) */}
              <div className="flex-shrink-0 sticky left-0 bg-black z-20 border-r border-gray-700" style={{ width: colWidth }}>
                <div className="h-14 flex items-center px-4 gap-2">
                  <div className="text-sm font-medium text-white truncate flex-1">
                    {propiedad.nombre}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => abrirEditarAlojamiento(propiedad)}
                      className="p-1.5 rounded-md hover:bg-gray-800 text-gray-300"
                      title="Editar"
                    >
                      <IoPencil className="text-[18px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminarAlojamiento(propiedad._id)}
                      className="p-1.5 rounded-md hover:bg-gray-800 text-rose-400"
                      title="Eliminar"
                    >
                      <IoTrash className="text-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Celdas de días */}
              {diasDelMes.map((diaInfo) => {
                const estado = obtenerEstadoDia(propiedad._id, diaInfo.dia)
                
                return (
                  <div
                    key={`${propiedad._id}-${diaInfo.dia}`}
                    className="w-24 h-14 border-r border-gray-800 flex items-center justify-center"
                  >
                    {estado.ocupado ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border border-rose-600/40 text-rose-300 bg-rose-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        Ocupado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border border-emerald-600/30 text-emerald-300 bg-emerald-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Libre
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          {/* Mensaje si no hay propiedades */}
          {propiedades.length === 0 && (
            <div className="flex items-center justify-center py-20 text-gray-500">
              No hay propiedades registradas
            </div>
          )}
        </div>
        {/* Control pegado abajo-izquierda para ajustar ancho de columna */}
        <div className="sticky left-0 bottom-0 z-40 p-2">
          <div ref={ajusteRef} className="inline-flex flex-col items-start bg-black/50 backdrop-blur-sm rounded-lg border border-gray-800">
            <button
              type="button"
              onClick={() => setMostrarAjusteColumna((v) => !v)}
              className="px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 rounded-t-lg"
              title="Ajustar ancho de la columna de Alojamientos"
            >
              Ajustar columna
            </button>
            {mostrarAjusteColumna && (
              <div className="w-[220px] max-w-[70vw] px-3 pb-3">
                <div className="text-[11px] text-gray-400 mb-2">Ancho: {Math.round(colWidth)} px</div>
                <input
                  type="range"
                  min={80}
                  max={320}
                  value={colWidth}
                  onChange={(e) => setColWidth(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Botón flotante para agregar alojamiento */}
      <button
        onClick={abrirNuevoAlojamiento}
        className="fixed bottom-20 right-4 md:bottom-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors z-40"
        title="Agregar alojamiento"
      >
        <IoAdd className="text-3xl" />
      </button>

      {/* Modal de Alojamiento (crear/editar) */}
      <AlojamientoModal
        isOpen={isAlojModalOpen}
        onClose={() => setIsAlojModalOpen(false)}
        onSubmit={guardarAlojamiento}
        initialData={propEnEdicion ? { nombre: propEnEdicion.nombre, direccion: propEnEdicion.direccion } : undefined}
        mode={propEnEdicion ? 'edit' : 'create'}
        onDelete={propEnEdicion ? () => { eliminarAlojamiento(propEnEdicion._id); setIsAlojModalOpen(false) } : undefined}
      />
    </main>
  )
}
