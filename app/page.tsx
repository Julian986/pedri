'use client'

import { useState } from 'react'
import Calendar from '@/components/Calendar'
import ReservationModal, { ReservationFormData } from '@/components/ReservationModal'
import ReservationCard from '@/components/ReservationCard'
import { IoAdd } from 'react-icons/io5'

interface Reservation {
  id: string
  propiedad: string
  huesped: string
  checkIn: string
  checkOut: string
  checkInDay: number
  checkOutDay: number
  noches: number
  clientes: number
  estado: 'Confirmada' | 'Cancelada' | 'Check-out' | 'Check-in'
  telefono: string
  total: string
  sena: string
}

export default function Home() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: '1',
      propiedad: 'Ayres de Güemes',
      huesped: 'matías alves de oliveira',
      checkIn: '10 oct',
      checkOut: '12 oct',
      checkInDay: 10,
      checkOutDay: 12,
      noches: 2,
      clientes: 2,
      estado: 'Cancelada',
      telefono: '+54 9 11 1234-5678',
      total: '50000',
      sena: '15000',
    },
    {
      id: '2',
      propiedad: 'Frente al MAR hermosas vistas, con balcón y cochera',
      huesped: 'Adrian Marino',
      checkIn: '26 sep',
      checkOut: '10 oct',
      checkInDay: 26,
      checkOutDay: 10,
      noches: 14,
      clientes: 2,
      estado: 'Check-out',
      telefono: '+54 9 11 9876-5432',
      total: '120000',
      sena: '40000',
    },
  ])

  // Calcular indicadores de reservas por día
  const reservationIndicators: { [key: number]: { checkIn: boolean; checkOut: boolean } } = {}
  
  reservations.forEach((res) => {
    if (!reservationIndicators[res.checkInDay]) {
      reservationIndicators[res.checkInDay] = { checkIn: false, checkOut: false }
    }
    reservationIndicators[res.checkInDay].checkIn = true

    if (!reservationIndicators[res.checkOutDay]) {
      reservationIndicators[res.checkOutDay] = { checkIn: false, checkOut: false }
    }
    reservationIndicators[res.checkOutDay].checkOut = true
  })

  // Contar reservas por día (para el calendario)
  const reservationCounts: { [key: number]: number } = {}
  reservations.forEach((res) => {
    reservationCounts[res.checkInDay] = (reservationCounts[res.checkInDay] || 0) + 1
    if (res.checkInDay !== res.checkOutDay) {
      reservationCounts[res.checkOutDay] = (reservationCounts[res.checkOutDay] || 0) + 1
    }
  })

  // Agrupar reservas por propiedad y día
  const getReservationsForDay = (day: number) => {
    const dayReservations = reservations.filter(
      (res) => res.checkInDay === day || res.checkOutDay === day
    )

    // Agrupar por propiedad
    const byProperty: { [key: string]: Reservation[] } = {}
    dayReservations.forEach((res) => {
      if (!byProperty[res.propiedad]) {
        byProperty[res.propiedad] = []
      }
      byProperty[res.propiedad].push(res)
    })

    return byProperty
  }

  const handleDayClick = (day: number) => {
    setSelectedDay(day)
  }

  const handleNewReservation = (data: ReservationFormData) => {
    const desde = new Date(data.desde)
    const hasta = new Date(data.hasta)
    const noches = Math.ceil((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24))

    const newReservation: Reservation = {
      id: Date.now().toString(),
      propiedad: data.alojamiento,
      huesped: data.huesped,
      checkIn: `${desde.getDate()} ${desde.toLocaleDateString('es', { month: 'short' })}`,
      checkOut: `${hasta.getDate()} ${hasta.toLocaleDateString('es', { month: 'short' })}`,
      checkInDay: desde.getDate(),
      checkOutDay: hasta.getDate(),
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-xl font-medium text-white">Reservas</h1>
        <div className="flex items-center gap-3">
          <button className="p-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button className="p-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendario - 45% de la pantalla */}
      <Calendar reservations={reservationCounts} onDayClick={handleDayClick} />

      {/* Área de eventos - 55% restante */}
      <div className="flex-1 bg-black overflow-y-auto px-4 py-4">
        {selectedDay === null ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-3">
              Selecciona un día para ver las reservas
            </p>
            <button className="text-blue-500 text-sm font-medium">
              Ver las próximas reservas
            </button>
          </div>
        ) : Object.keys(getReservationsForDay(selectedDay)).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(getReservationsForDay(selectedDay)).map(([propiedad, propReservations]) => (
              <ReservationCard
                key={propiedad}
                propiedad={propiedad}
                reservations={propReservations}
                checkIns={propReservations.filter((r) => r.checkInDay === selectedDay).length}
                estancias={propReservations.filter((r) => r.checkInDay !== selectedDay && r.checkOutDay !== selectedDay).length}
                checkOuts={propReservations.filter((r) => r.checkOutDay === selectedDay).length}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-3">
              Este día no llega ningún cliente
            </p>
            <button className="text-blue-500 text-sm font-medium">
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

