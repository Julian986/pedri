'use client'

import { BiCalendar, BiMoon, BiPhone, BiUser } from 'react-icons/bi'
import { IoChatbubbleOutline, IoCloseCircleOutline, IoArrowUndoCircleOutline } from 'react-icons/io5'

export interface Reservation {
  id: string
  propiedad: string
  huesped: string
  checkIn: string
  checkOut: string
  checkInDay: number
  checkOutDay: number
  noches: number
  clientes: number
  estado: 'Confirmada' | 'Cancelada' | 'Check-out' | 'Check-in' | 'Pendiente'
  telefono: string
  total?: string
  sena?: string
}

interface ReservationCardProps {
  reservation: Reservation
  selectedDay: number
  onCancelReservation?: (reservationId: string) => void
  onUncancelReservation?: (reservationId: string) => void
}

export default function ReservationCard({
  reservation,
  selectedDay,
  onCancelReservation,
  onUncancelReservation,
}: ReservationCardProps) {
  // Determinar el tipo de estadía
  const isCheckOut = reservation.checkOutDay === selectedDay
  const isCheckIn = reservation.checkInDay === selectedDay
  const isOngoing = !isCheckOut && !isCheckIn // Estancia en curso

  const formatPhoneForWhatsApp = (raw: string) => {
    if (!raw) return ''
    // Quitar todo lo que no sea dígito
    let n = String(raw).replace(/\D+/g, '')
    // Quitar ceros iniciales
    n = n.replace(/^0+/, '')
    // Si viene con prefijo internacional tipo 0054..., quitar 00
    n = n.replace(/^00/, '')
    // Si ya empieza con 54, dejamos; si no, asumimos Argentina y preprendemos 54
    if (!n.startsWith('54')) {
      n = `54${n}`
    }
    return n
  }

  const handleWhatsAppClick = () => {
    const whatsappNumber = formatPhoneForWhatsApp(reservation.telefono || '')
    if (!whatsappNumber) return
    const whatsappUrl = `https://wa.me/${whatsappNumber}`
    window.open(whatsappUrl, '_blank')
  }

  const isCancelled = reservation.estado === 'Cancelada'
  const isPendiente = reservation.estado === 'Pendiente'

  const handleCancel = () => {
    if (onCancelReservation) {
      onCancelReservation(reservation.id)
    }
  }

  const handleUncancel = () => {
    if (onUncancelReservation) {
      onUncancelReservation(reservation.id)
    }
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-4 relative">
      {/* Contenido de la tarjeta con opacidad cuando está cancelada */}
      <div className={`relative ${isCancelled ? 'opacity-50' : ''}`}>
      {/* Nombre del alojamiento con punto de color */}
      <div className="mb-1.5 flex w-full min-w-0 items-center gap-2">
        {/* Indicador: Gris para salida, Azul para entrada, Dos puntos para estancia */}
        {!isOngoing && (
          <div 
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              isCheckOut ? 'bg-gray-500' : 'bg-blue-500'
            }`}
          />
        )}
        {isOngoing && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          </div>
        )}
        <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-white">{reservation.propiedad}</h3>
        {isPendiente ? (
          <span className="ml-auto shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300 ring-1 ring-amber-500/40">
            Web · pendiente
          </span>
        ) : null}
      </div>

      {/* Nombre del huésped con botón de chat */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-gray-400 font-medium text-sm capitalize">{reservation.huesped}</h4>
        
        {/* Botón de chat con WhatsApp */}
        <button 
          onClick={handleWhatsAppClick}
          className="p-1 hover:bg-zinc-800 rounded-full transition-colors"
          title="Abrir WhatsApp"
        >
          <IoChatbubbleOutline className="text-gray-400 text-xl" />
        </button>
      </div>

      {/* Detalles */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <BiCalendar className="text-lg" />
          <span>
            {reservation.checkIn} - {reservation.checkOut}
          </span>
        </div>
        <div className="flex items-center justify-between text-gray-400">
          <div className="flex items-center gap-2">
            <BiMoon className="text-lg" />
            <span>{reservation.noches} noches</span>
          </div>
          
          {/* Botón de cancelar (solo cuando no está cancelada) */}
          {!isCancelled && (
            <button 
              onClick={handleCancel}
              className="p-1 hover:bg-zinc-800 rounded-full transition-colors"
              title="Cancelar reserva"
            >
              <IoCloseCircleOutline className="text-gray-400 text-xl" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <BiUser className="text-lg" />
          <span>{reservation.clientes} huéspedes</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <BiPhone className="text-lg" />
          <span>{reservation.telefono}</span>
        </div>
      </div>
      </div>
      
      {/* Botón de deshacer - Fuera del contenedor con opacidad, en la línea de "noches" */}
      {isCancelled && (
        <button 
          onClick={handleUncancel}
          className="absolute right-4 p-1 hover:bg-zinc-800 rounded-full transition-colors"
          title="Deshacer cancelación"
          style={{ top: 'calc(100% - 68px)' }}
        >
          <IoArrowUndoCircleOutline className="text-blue-500 text-xl" />
        </button>
      )}
    </div>
  )
}

