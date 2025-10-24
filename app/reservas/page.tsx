'use client'

import { useState } from 'react'

interface Reserva {
  id: string
  desde: string
  hasta: string
  propiedad: string
  huesped: string
  telefono: string
  valorTotal: number
  comision: number
  propietario: number
  plataforma: 'Airbnb' | 'Booking' | 'Particular'
}

const reservasEjemplo: Reserva[] = [
  {
    id: '1',
    desde: '2025-10-15',
    hasta: '2025-10-20',
    propiedad: 'Ayres de Güemes',
    huesped: 'Carolina Fernández',
    telefono: '+54 9 11 3456-7890',
    valorTotal: 185000,
    comision: 27750,
    propietario: 157250,
    plataforma: 'Airbnb'
  },
  {
    id: '2',
    desde: '2025-10-22',
    hasta: '2025-10-28',
    propiedad: 'Frente al Mar con piscina',
    huesped: 'Martín López',
    telefono: '+54 9 11 5678-1234',
    valorTotal: 240000,
    comision: 36000,
    propietario: 204000,
    plataforma: 'Booking'
  },
  {
    id: '3',
    desde: '2025-11-01',
    hasta: '2025-11-05',
    propiedad: 'Lo de Vicente',
    huesped: 'Laura Sánchez',
    telefono: '+54 9 11 4567-8901',
    valorTotal: 120000,
    comision: 0,
    propietario: 120000,
    plataforma: 'Particular'
  }
]

export default function ReservasPage() {
  const [reservas] = useState<Reserva[]>(reservasEjemplo)

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
  }

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(monto)
  }

  const getPlataformaColor = (plataforma: string) => {
    switch (plataforma) {
      case 'Airbnb':
        return 'bg-pink-500'
      case 'Booking':
        return 'bg-blue-500'
      case 'Particular':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <main className="min-h-screen bg-black text-white pb-16 md:pb-0">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Reservas</h1>
          <p className="text-sm text-gray-400">Registro de todas las reservas</p>
        </div>

        {/* Lista de reservas */}
        <div className="space-y-4">
          {reservas.map((reserva) => (
            <div
              key={reserva.id}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-4"
            >
              {/* Fechas y plataforma */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {formatearFecha(reserva.desde)}
                  </span>
                  <span className="text-gray-500">→</span>
                  <span className="text-sm font-medium text-white">
                    {formatearFecha(reserva.hasta)}
                  </span>
                </div>
                <div className="bg-gray-800 px-4 py-1.5 rounded-full">
                  <span className="text-xs font-medium text-white">
                    {reserva.plataforma}
                  </span>
                </div>
              </div>

              {/* Propiedad */}
              <div className="mb-3">
                <h3 className="text-base font-semibold text-white">{reserva.propiedad}</h3>
              </div>

              {/* Huésped */}
              <div className="mb-3 pb-3 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Huésped</p>
                    <p className="text-sm font-medium text-white">{reserva.huesped}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Teléfono</p>
                    <p className="text-sm font-medium text-white">{reserva.telefono}</p>
                  </div>
                </div>
              </div>

              {/* Montos */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total</p>
                  <p className="text-sm font-bold text-white">{formatearMonto(reserva.valorTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Comisión</p>
                  <p className="text-sm font-medium text-orange-400">{formatearMonto(reserva.comision)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Propietario</p>
                  <p className="text-sm font-medium text-green-400">{formatearMonto(reserva.propietario)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

