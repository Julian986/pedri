'use client'

import { useState } from 'react'
import { IoClose } from 'react-icons/io5'

interface ReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ReservationFormData) => void
}

export interface ReservationFormData {
  desde: string
  hasta: string
  alojamiento: string
  huesped: string
  telefono: string
  total: string
  sena: string
}

export default function ReservationModal({ isOpen, onClose, onSubmit }: ReservationModalProps) {
  const [formData, setFormData] = useState<ReservationFormData>({
    desde: '',
    hasta: '',
    alojamiento: '',
    huesped: '',
    telefono: '',
    total: '',
    sena: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    // Resetear formulario
    setFormData({
      desde: '',
      hasta: '',
      alojamiento: '',
      huesped: '',
      telefono: '',
      total: '',
      sena: '',
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center">
      {/* Modal */}
      <div className="bg-zinc-900 w-full md:max-w-lg md:rounded-t-2xl rounded-t-3xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Nueva Reserva</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <IoClose className="text-2xl text-white" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Desde - Hasta */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              name="desde"
              value={formData.desde}
              onChange={handleChange}
              required
              placeholder="Desde"
              className="w-full bg-zinc-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            />
            <input
              type="date"
              name="hasta"
              value={formData.hasta}
              onChange={handleChange}
              required
              placeholder="Hasta"
              className="w-full bg-zinc-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Alojamiento */}
          <input
            type="text"
            name="alojamiento"
            value={formData.alojamiento}
            onChange={handleChange}
            required
            placeholder="Alojamiento"
            className="w-full bg-zinc-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
          />

          {/* Huésped */}
          <input
            type="text"
            name="huesped"
            value={formData.huesped}
            onChange={handleChange}
            required
            placeholder="Huésped"
            className="w-full bg-zinc-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
          />

          {/* Teléfono */}
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
            placeholder="Teléfono"
            className="w-full bg-zinc-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
          />

          {/* Total y Seña */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="total"
              value={formData.total}
              onChange={handleChange}
              required
              placeholder="Total"
              className="w-full bg-zinc-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              name="sena"
              value={formData.sena}
              onChange={handleChange}
              required
              placeholder="Seña"
              className="w-full bg-zinc-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 text-white py-3 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

