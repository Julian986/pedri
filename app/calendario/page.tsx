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

interface DiaCalendario {
  dia: number
  mes: number
  año: number
  fecha: Date
}

export default function CalendarioPage() {
  const fechaInicial = new Date()
  const añoActual = fechaInicial.getFullYear()
  const [mesVisor, setMesVisor] = useState(fechaInicial.getMonth())
  const [añoVisor, setAñoVisor] = useState(añoActual)
  const [mounted, setMounted] = useState(false)
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [cargando, setCargando] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const mesActualRef = useRef(fechaInicial.getMonth())
  const añoActualRef = useRef(fechaInicial.getFullYear())
  const lastDiaIndexRef = useRef(-1)
  const hasScrolledToTodayRef = useRef(false)
  
  const diasNombresCortos = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  // Generar array de días para múltiples meses (solo 6 meses: 3 antes y 3 después)
  const diasCalendario = useMemo(() => {
    const dias: DiaCalendario[] = []
    
    // Generar solo los meses necesarios para un buffer razonable
    // Comenzamos 3 meses antes del mes actual
    const mesInicio = añoActual - 1 >= 2024 ? 9 : 0 // Octubre 2024 o Enero del año
    const añoInicio = añoActual - 1 >= 2024 ? añoActual : añoActual
    
    for (let mesOffset = 0; mesOffset < 18; mesOffset++) { // 18 meses = 1.5 años
      const mesIndex = (mesInicio + mesOffset) % 12
      const añoParaMes = añoInicio + Math.floor((mesInicio + mesOffset) / 12)
      const diasEnMes = new Date(añoParaMes, mesIndex + 1, 0).getDate()
      
      for (let dia = 1; dia <= diasEnMes; dia++) {
        dias.push({
          dia,
          mes: mesIndex,
          año: añoParaMes,
          fecha: new Date(añoParaMes, mesIndex, dia)
        })
      }
    }
    
    console.log(`Array generado: ${dias.length} días. Primer día: ${dias[0]?.dia}/${dias[0]?.mes}/${dias[0]?.año}`)
    return dias
  }, []) // No se regenera

  // Precalcular los offsets exactos del primer día de cada mes
  const monthOffsets = useMemo(() => {
    const offsets: { mes: number, año: number, offset: number }[] = []
    
    diasCalendario.forEach((dia, index) => {
      // Si es día 1 y tiene un día anterior de otro mes, es una línea rosa
      if (dia.dia === 1 && index > 0) {
        const diaAnterior = diasCalendario[index - 1]
        if (diaAnterior.mes !== dia.mes || diaAnterior.año !== dia.año) {
          offsets.push({
            mes: dia.mes,
            año: dia.año,
            offset: index * 96
          })
        }
      }
    })
    
    return offsets
  }, [diasCalendario])

  // Cargar propiedades y reservas (solo al inicio)
  useEffect(() => {
    setMounted(true)
    cargarDatos()
  }, [])

  // Centrar el scroll en el día de hoy al cargar (solo una vez)
  const scrollToToday = useCallback(() => {
    if (!hasScrolledToTodayRef.current && scrollRef.current && diasCalendario.length > 0) {
      const hoy = new Date()
      const mesHoy = hoy.getMonth()
      const añoHoy = hoy.getFullYear()
      const diaHoy = hoy.getDate()
      
      console.log(`Buscando día de hoy: ${diaHoy}/${mesHoy}/${añoHoy}`);
      
      // Buscar el índice del día de hoy en el array
      const diaHoyIndex = diasCalendario.findIndex(dia => 
        dia.dia === diaHoy && dia.mes === mesHoy && dia.año === añoHoy
      )
      
      if (diaHoyIndex !== -1) {
        const cellWidth = 96
        const scrollPosition = Math.max(0, (diaHoyIndex - 3) * cellWidth)
        
        console.log(`Encontrado en índice: ${diaHoyIndex}, scroll a: ${scrollPosition}`);
        
        scrollRef.current.scroll({
          left: scrollPosition,
          behavior: 'auto'
        })
        
        setMesVisor(mesHoy)
        mesActualRef.current = mesHoy
        añoActualRef.current = añoHoy
        hasScrolledToTodayRef.current = true
      }
    }
  }, [diasCalendario])
  
  useEffect(() => {
    if (mounted) {
      // Intentar scrollear después de que todo esté montado
      const timeoutId = setTimeout(scrollToToday, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [mounted, scrollToToday])

  const cargarDatos = async () => {
    setCargando(true)
    try {
      // Cargar propiedades
      const resPropiedades = await fetch('/api/propiedades')
      const dataPropiedades = await resPropiedades.json()
      
      let propiedadesCargadas: Propiedad[] = []
      
      if (dataPropiedades.success && dataPropiedades.data.length > 0) {
        propiedadesCargadas = dataPropiedades.data
      } else {
        // Si no hay propiedades, usar ejemplos
        propiedadesCargadas = [
          { _id: '1', nombre: 'Ayres de Güemes' },
          { _id: '2', nombre: 'Excelente ubicación Güemes, Luminoso' },
          { _id: '3', nombre: 'Frente al Mar! Hermosas vistas! Cochera' },
          { _id: '4', nombre: 'Frente al Mar! Increíbles vistas! Con piscina' },
          { _id: '5', nombre: 'Hermosas vistas, cálido y luminoso' },
          { _id: '6', nombre: 'Lo de Vicente' }
        ]
      }
      
      setPropiedades(propiedadesCargadas)

      // Cargar reservas del mes
      const resReservas = await fetch('/api/reservas')
      const dataReservas = await resReservas.json()
      
      if (dataReservas.success) {
        // Filtrar reservas para el mes actual
        const reservasFiltradas = dataReservas.data.filter((reserva: Reserva) => {
          const inicio = new Date(reserva.fechaInicio)
          const fin = new Date(reserva.fechaFin)
          const primerDiaMes = new Date(añoVisor, mesVisor, 1)
          const ultimoDiaMes = new Date(añoVisor, mesVisor + 1, 0)
          
          return (inicio <= ultimoDiaMes && fin >= primerDiaMes)
        })
        setReservas(reservasFiltradas)
      } else {
        // Generar algunas reservas de ejemplo
        const reservasEjemplo: Reserva[] = []
        
        // Generar reservas aleatorias para cada propiedad
        propiedadesCargadas.forEach((prop) => {
          const numReservas = Math.floor(Math.random() * 3) + 1 // 1-3 reservas por propiedad
          
          for (let i = 0; i < numReservas; i++) {
            const diaInicio = Math.floor(Math.random() * 28) + 1
            const duracion = Math.floor(Math.random() * 7) + 2 // 2-8 días
            const fechaInicio = new Date(añoVisor, mesVisor, diaInicio)
            const fechaFin = new Date(añoVisor, mesVisor, diaInicio + duracion)
            
            reservasEjemplo.push({
              _id: `reserva-${prop._id}-${i}`,
              propiedad: prop._id,
              fechaInicio: fechaInicio.toISOString().split('T')[0],
              fechaFin: fechaFin.toISOString().split('T')[0],
              precio: Math.floor(Math.random() * 400) + 50,
              nombreHuesped: `Huésped ${i + 1}`
            })
          }
        })
        
        setReservas(reservasEjemplo)
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      
      // En caso de error, mostrar datos de ejemplo
      setPropiedades([
        { _id: '1', nombre: 'Ayres de Güemes' },
        { _id: '2', nombre: 'Excelente ubicación Güemes, Luminoso' },
        { _id: '3', nombre: 'Frente al Mar! Hermosas vistas! Cochera' },
        { _id: '4', nombre: 'Frente al Mar! Increíbles vistas! Con piscina' },
        { _id: '5', nombre: 'Hermosas vistas, cálido y luminoso' },
        { _id: '6', nombre: 'Lo de Vicente' }
      ])
      
      // Generar algunas reservas de ejemplo
      const reservasEjemplo: Reserva[] = [
        {
          _id: 'r1',
          propiedad: '1',
          fechaInicio: new Date(añoVisor, mesVisor, 5).toISOString().split('T')[0],
          fechaFin: new Date(añoVisor, mesVisor, 10).toISOString().split('T')[0],
          precio: 250,
          nombreHuesped: 'Huésped 1'
        },
        {
          _id: 'r2',
          propiedad: '2',
          fechaInicio: new Date(añoVisor, mesVisor, 15).toISOString().split('T')[0],
          fechaFin: new Date(añoVisor, mesVisor, 20).toISOString().split('T')[0],
          precio: 300,
          nombreHuesped: 'Huésped 2'
        },
        {
          _id: 'r3',
          propiedad: '3',
          fechaInicio: new Date(añoVisor, mesVisor, 1).toISOString().split('T')[0],
          fechaFin: new Date(añoVisor, mesVisor, 7).toISOString().split('T')[0],
          precio: 450,
          nombreHuesped: 'Huésped 3'
        }
      ]
      
      setReservas(reservasEjemplo)
    } finally {
      setCargando(false)
    }
  }

  // Verificar si una fecha está ocupada para una propiedad
  const obtenerEstadoDia = (propiedadId: string, fecha: Date): EstadoDia => {
    const fechaStr = fecha.toISOString().split('T')[0]
    
    for (const reserva of reservas) {
      if (reserva.propiedad === propiedadId) {
        const inicio = new Date(reserva.fechaInicio)
        const fin = new Date(reserva.fechaFin)
        
        // Normalizar fechas para comparación
        inicio.setHours(0, 0, 0, 0)
        fin.setHours(0, 0, 0, 0)
        const fechaNormalizada = new Date(fecha)
        fechaNormalizada.setHours(0, 0, 0, 0)
        
        if (fechaNormalizada >= inicio && fechaNormalizada <= fin) {
          return {
            ocupado: true,
            precio: reserva.precio,
            reservaId: reserva._id
          }
        }
      }
    }
    
    return { ocupado: false }
  }


  const obtenerNombreDia = (fecha: Date) => {
    return diasNombresCortos[fecha.getDay()]
  }

  const formatearPrecio = (precio: number) => {
    return `$${precio}`
  }
  
  if (!mounted || cargando) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center pb-16 md:pb-0">
        <div className="text-gray-400">Cargando...</div>
      </main>
    )
  }

  const cambiarMes = (direccion: 'anterior' | 'siguiente') => {
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
    
    // Calcular offset para scrollear al nuevo mes
    if (scrollRef.current) {
      let diasAntes = 0
      for (let mes = 0; mes < nuevoMes; mes++) {
        diasAntes += new Date(nuevoAño, mes + 1, 0).getDate()
      }
      
      const scrollPosition = diasAntes * 96
      scrollRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' })
    }
  }

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
          
          <h2 className="text-lg font-semibold">
            {nombresMeses[mesVisor]} {añoVisor}
          </h2>
          
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

      {/* Contenedor principal con scroll horizontal único */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-x-auto overflow-y-auto"
        onScroll={(e) => {
          const scrollLeft = e.currentTarget.scrollLeft;
          const cellWidth = 96;
          const diaIndexVisible = Math.floor(scrollLeft / cellWidth);
          
          // Solo procesar si cambió el índice del día (cada 96px)
          if (diaIndexVisible === lastDiaIndexRef.current) return;
          
          console.log(`Día visible: ${diaIndexVisible}, scrollLeft: ${scrollLeft}`);
          
          lastDiaIndexRef.current = diaIndexVisible;
          
          if (diaIndexVisible >= 0 && diaIndexVisible < diasCalendario.length) {
            const diaInfo = diasCalendario[diaIndexVisible];
            
            console.log(`Día ${diaInfo.dia} de mes ${diaInfo.mes} (${nombresMeses[diaInfo.mes]})`);
            
            // Solo actualizar si el mes cambió
            if (diaInfo.mes !== mesActualRef.current || diaInfo.año !== añoActualRef.current) {
              console.log(`Cambiando mes de ${mesActualRef.current} a ${diaInfo.mes}, año visible: ${diaInfo.año}`);
              mesActualRef.current = diaInfo.mes;
              añoActualRef.current = diaInfo.año;
              setMesVisor(diaInfo.mes);
              
              // Solo actualizar añoVisor si cambió el año de forma significativa (no por errores de scroll)
              // Esto evita que el año "salte" hacia atrás
              const diferenciaAños = Math.abs(diaInfo.año - añoVisor)
              if (diferenciaAños === 1 && diaInfo.año > añoVisor) {
                // Avanzamos un año hacia adelante
                setAñoVisor(diaInfo.año)
              } else if (diferenciaAños === 0) {
                // Mantenemos el año actual
                // No hacemos nada, añoVisor ya es correcto
              }
              // Si hay un salto de años mayor a 1, ignoramos
            }
          }
        }}
      >
        <div className="inline-flex flex-col min-w-full">
          {/* Fila de encabezados de días */}
          <div className="flex sticky top-0 bg-black z-20 border-t border-b border-gray-800">
            {/* Columna fija de alojamientos */}
            <div className="w-48 flex-shrink-0 sticky left-0 bg-black z-30 border-r border-gray-700">
              <div className="h-12 flex items-center px-4">
                <span className="text-sm font-medium text-gray-400">Alojamientos</span>
              </div>
            </div>
            
            {/* Días continuos */}
            {diasCalendario.map((diaInfo, idx) => {
              // Verificar si el DÍA ANTERIOR tiene cambio de mes (para poner la línea rosa después del último día del mes)
              const hayCambioMes = idx > 0 && (diaInfo.mes !== diasCalendario[idx - 1].mes || diaInfo.año !== diasCalendario[idx - 1].año)
              
              return (
                <div
                  key={`${diaInfo.año}-${diaInfo.mes}-${diaInfo.dia}`}
                  className={`w-24 flex-shrink-0 bg-black ${hayCambioMes ? 'border-l border-fuchsia-400' : 'border-r border-gray-800'}`}
                >
                  <div className="h-12 flex flex-col items-center justify-center text-xs">
                    <div className="text-gray-400">{obtenerNombreDia(diaInfo.fecha)}</div>
                    <div className="font-medium">{diaInfo.dia}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Filas de propiedades */}
          {propiedades.map((propiedad, idx) => (
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
              {diasCalendario.map((diaInfo, idx) => {
                const estado = obtenerEstadoDia(propiedad._id, diaInfo.fecha)
                const hoy = new Date()
                const esHoy = hoy.getDate() === diaInfo.dia && 
                              hoy.getMonth() === diaInfo.mes && 
                              hoy.getFullYear() === diaInfo.año
                
                // Verificar si el DÍA ANTERIOR tiene cambio de mes
                const hayCambioMes = idx > 0 && (diaInfo.mes !== diasCalendario[idx - 1].mes || diaInfo.año !== diasCalendario[idx - 1].año)
                
                return (
                  <div
                    key={`${propiedad._id}-${diaInfo.año}-${diaInfo.mes}-${diaInfo.dia}`}
                    className={`w-24 flex-shrink-0 h-14 flex items-center justify-center relative
                      ${esHoy ? 'bg-blue-500/10' : ''}
                      ${hayCambioMes ? 'border-l border-fuchsia-400' : 'border-r border-gray-800'}
                    `}
                  >
                    {estado.ocupado ? (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-700 flex flex-col items-center justify-center">
                        <span className="text-sm font-bold text-white">{formatearPrecio(estado.precio || 0)}</span>
                        <span className="text-[9px] text-emerald-100 uppercase tracking-wider">Ocupado</span>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl text-gray-700">-</span>
                      </div>
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

