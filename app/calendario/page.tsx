'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

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
  const hasScrolledToTodayRef = useRef(false)

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
    try {
      // Cargar en paralelo para mayor velocidad
      const [resPropiedades, resReservas] = await Promise.all([
        fetch('/api/propiedades'),
        fetch('/api/reservas')
      ])
      
      const [dataPropiedades, dataReservas] = await Promise.all([
        resPropiedades.json(),
        resReservas.json()
      ])
      
      if (dataPropiedades.success && dataPropiedades.data.length > 0) {
        setPropiedades(dataPropiedades.data)
      } else {
        setPropiedades([
          { _id: '1', nombre: 'Ayres de Güemes' },
          { _id: '2', nombre: 'Excelente ubicación Güemes, Luminoso' },
          { _id: '3', nombre: 'Frente al Mar! Hermosas vistas! Cochera' },
          { _id: '4', nombre: 'Frente al Mar! Increíbles vistas! Con piscina' },
          { _id: '5', nombre: 'Hermosas vistas, cálido y luminoso' },
          { _id: '6', nombre: 'Lo de Vicente' }
        ])
      }
      let reservasResultado: Reserva[] = []
      if (dataReservas.success) {
        reservasResultado = dataReservas.data
      } else {
        // Fallback mínimo
        reservasResultado = [
          {
            _id: 'r1',
            propiedad: '1',
            fechaInicio: new Date(añoVisor, mesVisor, 5).toISOString().split('T')[0],
            fechaFin: new Date(añoVisor, mesVisor, 8).toISOString().split('T')[0],
            precio: 250,
            nombreHuesped: 'Huésped 1'
          }
        ]
      }

      // Generar reservas demo para visualización
      // Solo si no hay reservas del backend
      if (reservasResultado.length === 0 || !dataReservas.success) {
        const props = (dataPropiedades.success && dataPropiedades.data.length > 0)
          ? dataPropiedades.data as Propiedad[]
          : [
              { _id: '1', nombre: 'Ayres de Güemes' },
              { _id: '2', nombre: 'Excelente ubicación Güemes, Luminoso' },
              { _id: '3', nombre: 'Frente al Mar! Hermosas vistas! Cochera' }
            ]
        const demo: Reserva[] = []
        const diasEnMes = new Date(añoVisor, mesVisor + 1, 0).getDate()
        
        // Marcar algunas ocupadas de forma simple para la demo visual
        if (props[0]) {
          demo.push({
            _id: 'demo-1', propiedad: props[0]._id,
            fechaInicio: new Date(añoVisor, mesVisor, 3).toISOString().split('T')[0],
            fechaFin: new Date(añoVisor, mesVisor, 6).toISOString().split('T')[0],
            precio: 200
          } as Reserva)
        }
        if (props[1]) {
          demo.push({
            _id: 'demo-2', propiedad: props[1]._id,
            fechaInicio: new Date(añoVisor, mesVisor, 12).toISOString().split('T')[0],
            fechaFin: new Date(añoVisor, mesVisor, 15).toISOString().split('T')[0],
            precio: 180
          } as Reserva)
        }
        if (props[2]) {
          demo.push({
            _id: 'demo-3', propiedad: props[2]._id,
            fechaInicio: new Date(añoVisor, mesVisor, 22).toISOString().split('T')[0],
            fechaFin: new Date(añoVisor, mesVisor, 24).toISOString().split('T')[0],
            precio: 220
          } as Reserva)
        }
        // Agregar ocupaciones en los últimos días del mes para variación
        if (props[0] && diasEnMes >= 29) {
          demo.push({
            _id: 'demo-4', propiedad: props[0]._id,
            fechaInicio: new Date(añoVisor, mesVisor, 28).toISOString().split('T')[0],
            fechaFin: new Date(añoVisor, mesVisor, 30).toISOString().split('T')[0],
            precio: 195
          } as Reserva)
        }
        if (props[2] && diasEnMes >= 30) {
          demo.push({
            _id: 'demo-5', propiedad: props[2]._id,
            fechaInicio: new Date(añoVisor, mesVisor, 29).toISOString().split('T')[0],
            fechaFin: new Date(añoVisor, mesVisor, 31).toISOString().split('T')[0],
            precio: 210
          } as Reserva)
        }
        if (props[4] && diasEnMes >= 29) {
          demo.push({
            _id: 'demo-6', propiedad: props[4]._id,
            fechaInicio: new Date(añoVisor, mesVisor, 28).toISOString().split('T')[0],
            fechaFin: new Date(añoVisor, mesVisor, 29).toISOString().split('T')[0],
            precio: 175
          } as Reserva)
        }
        reservasResultado = [...reservasResultado, ...demo]
      }

      setReservas(reservasResultado)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      setPropiedades([
        { _id: '1', nombre: 'Ayres de Güemes' },
        { _id: '2', nombre: 'Excelente ubicación Güemes, Luminoso' },
        { _id: '3', nombre: 'Frente al Mar! Hermosas vistas! Cochera' }
      ])
      setReservas([])
    } finally {
      setCargando(false)
    }
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
  
  // Scroll inicial al día de hoy (una sola vez)
  useEffect(() => {
    if (cargando) return
    if (hasScrolledToTodayRef.current) return
    
    const hoy = new Date()
    const hoyDia = hoy.getDate()
    const hoyMes = hoy.getMonth()
    const hoyAño = hoy.getFullYear()
    
    if (mesVisor !== hoyMes || añoVisor !== hoyAño) return
    if (!scrollRef.current) return
    
    const cellWidth = 96
    const left = Math.max(0, (hoyDia - 1) * cellWidth)
    // Pequeño timeout para asegurar layout listo
    const id = setTimeout(() => {
      if (!scrollRef.current) return
      scrollRef.current.scrollTo({ left, behavior: 'auto' })
      hasScrolledToTodayRef.current = true
    }, 0)
    return () => clearTimeout(id)
  }, [cargando, mesVisor, añoVisor])
  
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
      <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="inline-flex flex-col min-w-full">
          {/* Fila de encabezados de días */}
          <div className="flex sticky top-0 bg-black z-20 border-t border-b border-gray-800">
            {/* Columna fija de alojamientos */}
            <div className="w-48 flex-shrink-0 sticky left-0 bg-black z-30 border-r border-gray-700">
              <div className="h-12 flex items-center px-4">
                <span className="text-sm font-medium text-gray-400">Alojamientos</span>
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
            <div key={propiedad._id} className="flex border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
              {/* Nombre de la propiedad (columna fija) */}
              <div className="w-48 flex-shrink-0 sticky left-0 bg-black z-20 border-r border-gray-700">
                <div className="h-14 flex items-center px-4">
                  <div className="text-sm font-medium text-white truncate">
                    {propiedad.nombre}
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
      </div>
    </main>
  )
}
