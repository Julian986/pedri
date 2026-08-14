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
  estado: 'Confirmada' | 'Cancelada' | 'Check-out' | 'Check-in' | 'Pendiente' | 'Sync'
  telefono: string
  total?: string
  sena?: string
  origen?: string
  externalUid?: string
  /** true si es sync iCal sin datos completos (total 0 / sin teléfono) */
  needsCompletar?: boolean
}

interface ReservationCardProps {
  reservation: Reservation
  selectedDay: number
  onCancelReservation?: (reservationId: string) => void
  onUncancelReservation?: (reservationId: string) => void
}

function origenBadge(reservation: Reservation): { label: string; className: string } | null {
  if (reservation.estado === 'Cancelada') return null

  const origen = (reservation.origen || '').trim()
  const isSync = Boolean(reservation.externalUid) || reservation.estado === 'Sync'

  if (reservation.estado === 'Pendiente' && (origen === 'Web' || !origen)) {
    return {
      label: 'Web · pendiente',
      className: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40',
    }
  }

  if (isSync) {
    if (origen === 'Airbnb') {
      return { label: reservation.needsCompletar ? 'Airbnb · completar' : 'Airbnb · sync', className: 'bg-pink-500/20 text-pink-300 ring-1 ring-pink-500/40' }
    }
    if (origen === 'Booking') {
      return { label: reservation.needsCompletar ? 'Booking · completar' : 'Booking · sync', className: 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40' }
    }
    return { label: reservation.needsCompletar ? 'Sync · completar' : 'OTA · sync', className: 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40' }
  }

  if (origen === 'Airbnb') {
    return { label: 'Airbnb', className: 'bg-pink-500/20 text-pink-300 ring-1 ring-pink-500/40' }
  }
  if (origen === 'Booking') {
    return { label: 'Booking', className: 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40' }
  }
  if (origen === 'Web') {
    return { label: 'Web', className: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40' }
  }
  if (origen === 'Particular') {
    return { label: 'Particular', className: 'bg-green-500/20 text-green-300 ring-1 ring-green-500/40' }
  }
  if (origen) {
    return { label: origen, className: 'bg-gray-500/20 text-gray-300 ring-1 ring-gray-500/40' }
  }
  return null
}

export default function ReservationCard({
  reservation,
  selectedDay,
  onCancelReservation,
  onUncancelReservation,
}: ReservationCardProps) {
  const isCheckOut = reservation.checkOutDay === selectedDay
  const isCheckIn = reservation.checkInDay === selectedDay
  const isOngoing = !isCheckOut && !isCheckIn

  const formatPhoneForWhatsApp = (raw: string) => {
    if (!raw) return ''
    let n = String(raw).replace(/\D+/g, '')
    n = n.replace(/^0+/, '')
    n = n.replace(/^00/, '')
    if (!n.startsWith('54')) {
      n = `54${n}`
    }
    return n
  }

  const handleWhatsAppClick = () => {
    const whatsappNumber = formatPhoneForWhatsApp(reservation.telefono || '')
    if (!whatsappNumber) return
    window.open(`https://wa.me/${whatsappNumber}`, '_blank')
  }

  const isCancelled = reservation.estado === 'Cancelada'
  const badge = origenBadge(reservation)

  const handleCancel = () => {
    onCancelReservation?.(reservation.id)
  }

  const handleUncancel = () => {
    onUncancelReservation?.(reservation.id)
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-4 relative">
      <div className={`relative ${isCancelled ? 'opacity-50' : ''}`}>
      <div className="mb-1.5 flex w-full min-w-0 items-center gap-2">
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
        {badge ? (
          <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}>
            {badge.label}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h4 className="text-gray-400 font-medium text-sm capitalize">{reservation.huesped}</h4>
        <button
          onClick={handleWhatsAppClick}
          className="p-1 hover:bg-zinc-800 rounded-full transition-colors"
          title="Abrir WhatsApp"
        >
          <IoChatbubbleOutline className="text-gray-400 text-xl" />
        </button>
      </div>

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
          <span>{reservation.telefono || (reservation.needsCompletar ? 'Sin teléfono' : '—')}</span>
        </div>
        {(reservation.sena || (reservation.total && Number(reservation.total) > 0)) && (
          <div className="flex items-center justify-between text-gray-400 pt-1">
            {reservation.total && Number(reservation.total) > 0 ? (
              <span className="text-white font-medium">Total: ${Number(reservation.total).toLocaleString('es-AR')}</span>
            ) : <span />}
            {reservation.sena ? (
              <span className="text-sky-400">Seña: ${Number(reservation.sena).toLocaleString('es-AR')}</span>
            ) : null}
          </div>
        )}
        {reservation.needsCompletar && (
          <p className="text-[11px] text-sky-400 pt-0.5">Faltan datos · completá en Reservas</p>
        )}
      </div>
      </div>

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
