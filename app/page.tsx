'use client'

import { useState, useEffect } from 'react'
import Calendar from '@/components/Calendar'
import ReservationModal, { ReservationFormData } from '@/components/ReservationModal'
import ReservationCard from '@/components/ReservationCard'
import { IoAdd } from 'react-icons/io5'
import { useModal } from '@/contexts/ModalContext'

interface Reservation {
  id: string
  propiedad: string
  huesped: string
  checkIn: string
  checkOut: string
  checkInDay: number
  checkInMonth: number
  checkInYear: number
  checkOutDay: number
  checkOutMonth: number
  checkOutYear: number
  noches: number
  clientes: number
  estado: 'Confirmada' | 'Cancelada' | 'Check-out' | 'Check-in'
  telefono: string
  total: string
  sena: string
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { setIsModalOpen: setGlobalModalOpen } = useModal()
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  
  // Sincronizar estado local con contexto global
  useEffect(() => {
    setGlobalModalOpen(isModalOpen)
  }, [isModalOpen, setGlobalModalOpen])
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: '1',
      propiedad: 'Departamento Palermo Soho',
      huesped: 'carolina fernández',
      checkIn: '10 oct',
      checkOut: '15 oct',
      checkInDay: 10,
      checkInMonth: 9, // octubre (0-indexed)
      checkInYear: 2025,
      checkOutDay: 15,
      checkOutMonth: 9,
      checkOutYear: 2025,
      noches: 5,
      clientes: 2,
      estado: 'Confirmada',
      telefono: '+54 9 11 3456-7890',
      total: '185000',
      sena: '60000',
    },
    {
      id: '2',
      propiedad: 'Loft Recoleta con Terraza',
      huesped: 'martín lópez',
      checkIn: '15 oct',
      checkOut: '20 oct',
      checkInDay: 15,
      checkInMonth: 9,
      checkInYear: 2025,
      checkOutDay: 20,
      checkOutMonth: 9,
      checkOutYear: 2025,
      noches: 5,
      clientes: 2,
      estado: 'Confirmada',
      telefono: '+54 9 11 5678-1234',
      total: '175000',
      sena: '55000',
    },
    {
      id: '3',
      propiedad: 'Departamento Belgrano',
      huesped: 'laura sánchez',
      checkIn: '8 nov',
      checkOut: '12 nov',
      checkInDay: 8,
      checkInMonth: 10, // noviembre (0-indexed)
      checkInYear: 2025,
      checkOutDay: 12,
      checkOutMonth: 10,
      checkOutYear: 2025,
      noches: 4,
      clientes: 3,
      estado: 'Confirmada',
      telefono: '+54 9 11 4567-8901',
      total: '150000',
      sena: '50000',
    },
  ])

  // Calcular indicadores de reservas por día para el mes actual del calendario
  const reservationIndicators: { [key: number]: { checkIn: boolean; checkOut: boolean } } = {}
  
  reservations.forEach((res) => {
    // Solo agregar indicadores si la reserva pertenece al mes actual del calendario
    if (res.checkInMonth === currentMonth && res.checkInYear === currentYear) {
      if (!reservationIndicators[res.checkInDay]) {
        reservationIndicators[res.checkInDay] = { checkIn: false, checkOut: false }
      }
      reservationIndicators[res.checkInDay].checkIn = true
    }

    if (res.checkOutMonth === currentMonth && res.checkOutYear === currentYear) {
      if (!reservationIndicators[res.checkOutDay]) {
        reservationIndicators[res.checkOutDay] = { checkIn: false, checkOut: false }
      }
      reservationIndicators[res.checkOutDay].checkOut = true
    }
  })

  // Obtener reservas del día ordenadas (salidas, entradas, estancias en curso)
  const getReservationsForDay = (day: number) => {
    // Usar el mes/año seleccionado o el actual del calendario
    const monthToUse = selectedMonth !== null ? selectedMonth : currentMonth
    const yearToUse = selectedYear !== null ? selectedYear : currentYear
    
    const dayReservations = reservations.filter((res) => {
      // Crear fechas completas para comparar
      const checkInDate = new Date(res.checkInYear, res.checkInMonth, res.checkInDay)
      const checkOutDate = new Date(res.checkOutYear, res.checkOutMonth, res.checkOutDay)
      const selectedDate = new Date(yearToUse, monthToUse, day)
      
      // Incluir si es check-in, check-out, o está en medio de la estancia
      return selectedDate >= checkInDate && selectedDate <= checkOutDate
    })

    // Ordenar: salidas primero, luego entradas, luego estancias en curso al final
    return dayReservations.sort((a, b) => {
      const aIsCheckOut = a.checkOutDay === day
      const bIsCheckOut = b.checkOutDay === day
      const aIsCheckIn = a.checkInDay === day
      const bIsCheckIn = b.checkInDay === day
      const aIsOngoing = !aIsCheckOut && !aIsCheckIn
      const bIsOngoing = !bIsCheckOut && !bIsCheckIn
      
      // Salidas primero
      if (aIsCheckOut && !bIsCheckOut) return -1
      if (!aIsCheckOut && bIsCheckOut) return 1
      
      // Luego entradas
      if (aIsCheckIn && !bIsCheckIn) return -1
      if (!aIsCheckIn && bIsCheckIn) return 1
      
      // Estancias en curso al final
      if (aIsOngoing && !bIsOngoing) return 1
      if (!aIsOngoing && bIsOngoing) return -1
      
      // Mantener orden si son del mismo tipo
      return 0
    })
  }

  const handleDayClick = (day: number) => {
    setSelectedDay(day)
    setSelectedMonth(currentMonth)
    setSelectedYear(currentYear)
  }

  const handleMonthChange = (month: number, year: number) => {
    // Solo actualizar si realmente cambió el mes
    if (month !== currentMonth || year !== currentYear) {
      setCurrentMonth(month)
      setCurrentYear(year)
      setSelectedDay(null) // Limpiar selección solo si cambió el mes
    }
  }

  const handleViewNextReservations = () => {
    // Obtener la fecha actual completa
    const today = new Date()
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // Buscar la reserva más cercana en el futuro
    let closestReservation: Reservation | null = null
    let closestDate: Date | null = null
    let isCheckIn: boolean = true

    reservations.forEach((res) => {
      const checkInDate = new Date(res.checkInYear, res.checkInMonth, res.checkInDay)
      const checkOutDate = new Date(res.checkOutYear, res.checkOutMonth, res.checkOutDay)

      // Verificar check-in futuro o actual
      if (checkInDate >= todayDate) {
        if (!closestDate || checkInDate < closestDate) {
          closestDate = checkInDate
          closestReservation = res
          isCheckIn = true
        }
      }
      
      // Verificar check-out futuro o actual
      if (checkOutDate >= todayDate) {
        if (!closestDate || checkOutDate < closestDate) {
          closestDate = checkOutDate
          closestReservation = res
          isCheckIn = false
        }
      }

      // Si estamos en medio de una estancia
      if (checkInDate <= todayDate && checkOutDate >= todayDate) {
        if (!closestDate || todayDate < closestDate) {
          closestDate = todayDate
          closestReservation = res
          isCheckIn = false
        }
      }
    })

    if (closestReservation) {
      // Establecer la selección sin cambiar el calendario visible
      const res = closestReservation as Reservation
      const targetMonth = isCheckIn ? res.checkInMonth : res.checkOutMonth
      const targetYear = isCheckIn ? res.checkInYear : res.checkOutYear
      const targetDay = isCheckIn ? res.checkInDay : res.checkOutDay
      
      setSelectedDay(targetDay)
      setSelectedMonth(targetMonth)
      setSelectedYear(targetYear)
    }
  }

  const handleCancelReservation = (reservationId: string) => {
    setReservations(reservations.map(res => 
      res.id === reservationId 
        ? { ...res, estado: 'Cancelada' as const }
        : res
    ))
  }

  const handleUncancelReservation = (reservationId: string) => {
    setReservations(reservations.map(res => 
      res.id === reservationId 
        ? { ...res, estado: 'Confirmada' as const }
        : res
    ))
  }

  const handleNewReservation = (data: ReservationFormData) => {
    // Agregar hora para evitar problemas de zona horaria
    const desde = new Date(data.desde + 'T00:00:00')
    const hasta = new Date(data.hasta + 'T00:00:00')
    const noches = Math.ceil((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24))

    const newReservation: Reservation = {
      id: Date.now().toString(),
      propiedad: data.alojamiento,
      huesped: data.huesped,
      checkIn: `${desde.getDate()} ${desde.toLocaleDateString('es', { month: 'short' })}`,
      checkOut: `${hasta.getDate()} ${hasta.toLocaleDateString('es', { month: 'short' })}`,
      checkInDay: desde.getDate(),
      checkInMonth: desde.getMonth(),
      checkInYear: desde.getFullYear(),
      checkOutDay: hasta.getDate(),
      checkOutMonth: hasta.getMonth(),
      checkOutYear: hasta.getFullYear(),
      noches,
      clientes: 2, // Podríamos agregarlo al formulario
      estado: 'Confirmada',
      telefono: data.telefono,
      total: data.total,
      sena: data.sena,
    }

    setReservations([...reservations, newReservation])
  }

  return (
    <main className="min-h-screen bg-black flex flex-col">
      {/* Calendario - 45% de la pantalla */}
      <Calendar 
        reservations={reservationIndicators} 
        onDayClick={handleDayClick}
        onMonthChange={handleMonthChange}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />

      {/* Área de eventos - 55% restante */}
      <div className="flex-1 bg-black overflow-y-auto px-4 py-4">
        {selectedDay === null ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-3">
              Selecciona un día para ver las reservas
            </p>
            <button 
              onClick={handleViewNextReservations}
              className="text-blue-500 text-sm font-medium hover:text-blue-400 transition-colors"
            >
              Ver las próximas reservas
            </button>
          </div>
        ) : getReservationsForDay(selectedDay).length > 0 ? (
          <div className="space-y-3">
            {getReservationsForDay(selectedDay).map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                selectedDay={selectedDay}
                onCancelReservation={handleCancelReservation}
                onUncancelReservation={handleUncancelReservation}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-3">
              Este día no llega ningún cliente
            </p>
            <button 
              onClick={handleViewNextReservations}
              className="text-blue-500 text-sm font-medium hover:text-blue-400 transition-colors"
            >
              Ver las próximas reservas
            </button>
          </div>
        )}
      </div>

      {/* Botón flotante de agregar */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors z-40"
      >
        <IoAdd className="text-3xl" />
      </button>

      {/* Modal de nueva reserva */}
      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewReservation}
      />
    </main>
  )
}

