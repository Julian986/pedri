'use client'

import { useState } from 'react'
import { IoChevronDown, IoChevronUp } from 'react-icons/io5'
import { BiCalendar, BiMoon, BiUser } from 'react-icons/bi'
import { IoChatbubbleOutline } from 'react-icons/io5'

interface Reservation {
  id: string
  propiedad: string
  huesped: string
  checkIn: string
  checkOut: string
  noches: number
  clientes: number
  estado: 'Confirmada' | 'Cancelada' | 'Check-out' | 'Check-in'
  telefono?: string
  total?: string
  sena?: string
}

interface ReservationCardProps {
  propiedad: string
  reservations: Reservation[]
  checkIns: number
  estancias: number
  checkOuts: number
}

export default function ReservationCard({
  propiedad,
  reservations,
  checkIns,
  estancias,
  checkOuts,
}: ReservationCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden mb-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-zinc-800 transition-colors"
      >
        <h3 className="text-white font-medium text-left">{propiedad}</h3>
        {isExpanded ? (
          <IoChevronUp className="text-white text-xl" />
        ) : (
          <IoChevronDown className="text-white text-xl" />
        )}
      </button>

      {isExpanded && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 px-4 pb-3 border-b border-gray-800">
            <div className="text-center">
              <div className="text-gray-400 text-xs mb-1">Check-ins</div>
              <div className="text-white text-lg font-semibold">{checkIns}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs mb-1">Estancias</div>
              <div className="text-white text-lg font-semibold">{estancias}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs mb-1">Check-outs</div>
              <div className="text-white text-lg font-semibold">{checkOuts}</div>
            </div>
          </div>

          {/* Reservaciones */}
          <div className="p-4 space-y-3">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-zinc-800 rounded-lg p-4 space-y-3"
              >
                {/* Estado */}
                <div className="flex items-center gap-2">
                  {reservation.estado === 'Cancelada' && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <span className="text-lg">⊗</span>
                      <span>Cancelada</span>
                    </div>
                  )}
                  {reservation.estado === 'Check-out' && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-lg">↗</span>
                      <span>Check-out</span>
                    </div>
                  )}
                  {reservation.estado === 'Check-in' && (
                    <div className="flex items-center gap-2 text-blue-500 text-sm">
                      <span className="text-lg">↘</span>
                      <span>Check-in</span>
                    </div>
                  )}
                  {reservation.estado === 'Confirmada' && (
                    <div className="flex items-center gap-2 text-green-500 text-sm">
                      <span className="text-lg">✓</span>
                      <span>Confirmada</span>
                    </div>
                  )}
                  
                  {/* Botón de chat */}
                  <button className="ml-auto p-2 hover:bg-zinc-700 rounded-full transition-colors">
                    <IoChatbubbleOutline className="text-gray-400 text-lg" />
                  </button>
                </div>

                {/* Nombre del huésped */}
                <h4 className="text-white font-medium">{reservation.huesped}</h4>

                {/* Detalles */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <BiCalendar className="text-lg" />
                    <span>
                      {reservation.checkIn} - {reservation.checkOut}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <BiMoon className="text-lg" />
                    <span>{reservation.noches} noches</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <BiUser className="text-lg" />
                    <span>{reservation.clientes} clientes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

