'use client'

import { useState, useEffect } from 'react'

// Tipos de datos
interface Alojamiento {
  id: string
  nombre: string
  color: string
}

interface DiaCalendario {
  fecha: string
  ocupado: boolean
  alojamientoId?: string
}

// Datos de ejemplo
const alojamientos: Alojamiento[] = [
  { id: '1', nombre: 'Ayres de Güemes', color: 'bg-blue-500' },
  { id: '2', nombre: 'Excelente ubicación Güemes', color: 'bg-green-500' },
  { id: '3', nombre: 'Frente al Mar con cochera', color: 'bg-purple-500' },
  { id: '4', nombre: 'Frente al Mar con piscina', color: 'bg-orange-500' },
  { id: '5', nombre: 'Hermosas vistas', color: 'bg-pink-500' },
  { id: '6', nombre: 'Lo de Vicente', color: 'bg-teal-500' }
]

// Generar días del mes actual
const generarDiasMes = (mes: number, año: number): DiaCalendario[] => {
  const dias: DiaCalendario[] = []
  const primerDia = new Date(año, mes, 1)
  const ultimoDia = new Date(año, mes + 1, 0)
  const diasEnMes = ultimoDia.getDate()
  
  // Días del mes anterior
  const primerDiaSemana = primerDia.getDay()
  const mesAnterior = new Date(año, mes, 0)
  
  for (let i = primerDiaSemana - 1; i >= 0; i--) {
    const fecha = new Date(mesAnterior.getFullYear(), mesAnterior.getMonth(), mesAnterior.getDate() - i)
    dias.push({
      fecha: fecha.toISOString().split('T')[0],
      ocupado: false,
      alojamientoId: undefined
    })
  }
  
  // Días del mes actual
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fecha = new Date(año, mes, dia)
    dias.push({
      fecha: fecha.toISOString().split('T')[0],
      ocupado: Math.random() > 0.6,
      alojamientoId: alojamientos[Math.floor(Math.random() * alojamientos.length)].id
    })
  }
  
  // Días del mes siguiente
  const diasRestantes = 42 - dias.length
  for (let dia = 1; dia <= diasRestantes; dia++) {
    const fecha = new Date(año, mes + 1, dia)
    dias.push({
      fecha: fecha.toISOString().split('T')[0],
      ocupado: false,
      alojamientoId: undefined
    })
  }
  
  return dias
}

export default function CalendarioPage() {
  const [mesActual, setMesActual] = useState(new Date().getMonth())
  const [añoActual, setAñoActual] = useState(new Date().getFullYear())
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [diasMes, setDiasMes] = useState<DiaCalendario[]>([])
  
  const diasNombres = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
  const nombresMeses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]
  
  const minSwipeDistance = 50
  
  useEffect(() => {
    setMounted(true)
    setDiasMes(generarDiasMes(mesActual, añoActual))
  }, [])

  useEffect(() => {
    if (mounted) {
      setDiasMes(generarDiasMes(mesActual, añoActual))
    }
  }, [mesActual, añoActual, mounted])
  
  const cambiarMes = (direccion: 'anterior' | 'siguiente') => {
    if (direccion === 'anterior') {
      if (mesActual === 0) {
        setMesActual(11)
        setAñoActual(añoActual - 1)
      } else {
        setMesActual(mesActual - 1)
      }
    } else {
      if (mesActual === 11) {
        setMesActual(0)
        setAñoActual(añoActual + 1)
      } else {
        setMesActual(mesActual + 1)
      }
    }
  }

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe) {
      cambiarMes('siguiente')
    } else if (isRightSwipe) {
      cambiarMes('anterior')
    }
  }
  
  if (!mounted) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center pb-16 md:pb-0">
        <div className="text-gray-400">Cargando...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col pb-16 md:pb-0">
      {/* Calendario - 45% de la pantalla */}
      <div 
        className="h-[45vh] flex flex-col"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header con mes y año */}
        <div className="flex items-center justify-center gap-2 px-4 py-4">
          <h2 className="text-lg font-medium capitalize">{nombresMeses[mesActual]}</h2>
          <span className="text-sm text-gray-400">{añoActual}</span>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-0 px-2 mb-2">
          {diasNombres.map((dia, index) => (
            <div key={index} className="text-center text-xs text-gray-400 py-2">
              {dia}
            </div>
          ))}
        </div>

        {/* Grid de días */}
        <div className="grid grid-cols-7 gap-0 px-2 flex-1">
          {diasMes.map((dia, index) => {
            const fecha = new Date(dia.fecha)
            const esMesActual = fecha.getMonth() === mesActual
            const esHoy = mounted && fecha.toDateString() === new Date().toDateString()
            const alojamientoOcupado = dia.alojamientoId ? 
              alojamientos.find(a => a.id === dia.alojamientoId) : null

            return (
              <div key={index} className="flex items-center justify-center relative">
                <div
                  className={`w-10 h-10 rounded-full flex flex-col items-center justify-center relative
                    ${esMesActual ? 'text-white' : 'text-gray-600'}
                    ${esHoy ? 'bg-orange-500 text-white' : ''}
                  `}
                >
                  <span className="text-sm relative z-10">{fecha.getDate()}</span>
                  
                  {/* Línea diagonal para día ocupado */}
                  {!esHoy && dia.ocupado && alojamientoOcupado && esMesActual && (
                    <div 
                      className={`absolute inset-0 flex items-center justify-center`}
                      style={{
                        transform: 'rotate(-45deg)'
                      }}
                    >
                      <div className={`w-full h-[2px] ${alojamientoOcupado.color}`}></div>
                    </div>
                  )}
                  
                  {/* Línea diagonal cuando es hoy y está ocupado */}
                  {esHoy && dia.ocupado && alojamientoOcupado && (
                    <div 
                      className={`absolute inset-0 flex items-center justify-center`}
                      style={{
                        transform: 'rotate(-45deg)'
                      }}
                    >
                      <div className="w-full h-[2px] bg-white opacity-60"></div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Área de hospedajes - 55% restante */}
      <div className="flex-1 bg-black overflow-y-auto px-4 py-4">
        <div className="mb-3">
          <h3 className="text-xs text-gray-400 uppercase tracking-wide">Hospedajes</h3>
        </div>
        <div className="space-y-3">
          {alojamientos.map((alojamiento) => (
            <div
              key={alojamiento.id}
              className="p-4 rounded-lg border border-gray-800 bg-gray-900/50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${alojamiento.color}`}></div>
                <h3 className="text-sm font-medium text-white">
                  {alojamiento.nombre}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

