'use client'

import { useState, useEffect } from 'react'
import { IoClose } from 'react-icons/io5'

interface GastoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (gasto: {
    mes: string
    tipoGasto: string
    propiedad: string
    monto: number
  }) => void
}

export default function GastoModal({ isOpen, onClose, onSubmit }: GastoModalProps) {
  const [mes, setMes] = useState('')
  const [tipoGasto, setTipoGasto] = useState('')
  const [propiedad, setPropiedad] = useState('')
  const [monto, setMonto] = useState('')

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!mes || !tipoGasto || !propiedad || !monto) {
      return
    }

    onSubmit({
      mes,
      tipoGasto,
      propiedad,
      monto: parseFloat(monto)
    })

    // Resetear formulario
    setMes('')
    setTipoGasto('')
    setPropiedad('')
    setMonto('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center pb-16 md:pb-0">
      <div className="bg-gray-900 w-full md:max-w-md md:rounded-lg rounded-t-2xl max-h-[85vh] md:max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Nuevo Gasto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-lg"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Mes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mes
            </label>
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all [color-scheme:dark]"
              required
            />
          </div>

          {/* Tipo de gasto */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Gasto
            </label>
            <select
              value={tipoGasto}
              onChange={(e) => setTipoGasto(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              required
            >
              <option value="" className="bg-gray-800">Seleccionar tipo</option>
              <option value="Mantenimiento" className="bg-gray-800">Mantenimiento</option>
              <option value="Limpieza" className="bg-gray-800">Limpieza</option>
              <option value="Servicios" className="bg-gray-800">Servicios</option>
              <option value="Reparación" className="bg-gray-800">Reparación</option>
              <option value="Impuestos" className="bg-gray-800">Impuestos</option>
              <option value="Otro" className="bg-gray-800">Otro</option>
            </select>
          </div>

          {/* Propiedad */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Propiedad
            </label>
            <select
              value={propiedad}
              onChange={(e) => setPropiedad(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              required
            >
              <option value="" className="bg-gray-800">Seleccionar propiedad</option>
              <option value="Ayres de Güemes" className="bg-gray-800">Ayres de Güemes</option>
              <option value="Excelente ubicación Güemes, Luminoso" className="bg-gray-800">Excelente ubicación Güemes, Luminoso</option>
              <option value="Frente al Mar! Hermosas vistas! Cochera" className="bg-gray-800">Frente al Mar! Hermosas vistas! Cochera</option>
              <option value="Frente al Mar! Increíbles vistas! Con piscina" className="bg-gray-800">Frente al Mar! Increíbles vistas! Con piscina</option>
              <option value="Hermosas vistas, cálido y luminoso" className="bg-gray-800">Hermosas vistas, cálido y luminoso</option>
              <option value="Lo de Vicente" className="bg-gray-800">Lo de Vicente</option>
            </select>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Monto (ARS)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors border border-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Agregar Gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

