'use client'

import { useState, useEffect } from 'react'
import { IoClose, IoRefreshOutline } from 'react-icons/io5'
import RangeDatePicker from './RangeDatePicker'
import { z } from 'zod'

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

// Schema de validación con Zod
const reservationSchema = z.object({
  desde: z.string().min(1, 'La fecha de inicio es requerida'),
  hasta: z.string().min(1, 'La fecha de fin es requerida'),
  alojamiento: z.string().min(1, 'El alojamiento es requerido'),
  huesped: z.string().min(1, 'El nombre del huésped es requerido'),
  telefono: z.string().min(1, 'El teléfono es requerido'),
  total: z.string().min(1, 'El total es requerido'),
  sena: z.string().min(1, 'La seña es requerida'),
})

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
  
  const [errors, setErrors] = useState<Partial<Record<keyof ReservationFormData, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof ReservationFormData, boolean>>>({})

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Limpiar el efecto al desmontar
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name as keyof ReservationFormData]) {
      setErrors({
        ...errors,
        [name]: undefined,
      })
    }
  }

  const handleBlur = (fieldName: keyof ReservationFormData) => {
    setTouched({
      ...touched,
      [fieldName]: true,
    })
    
    // Validar el campo individual
    try {
      reservationSchema.shape[fieldName].parse(formData[fieldName])
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({
          ...errors,
          [fieldName]: error.issues[0].message,
        })
      }
    }
  }

  const handleReset = () => {
    setFormData({
      desde: '',
      hasta: '',
      alojamiento: '',
      huesped: '',
      telefono: '',
      total: '',
      sena: '',
    })
    setErrors({})
    setTouched({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar todos los campos
    try {
      reservationSchema.parse(formData)
      // Si la validación pasa, enviar datos
      onSubmit(formData)
      // Resetear formulario
      handleReset()
      onClose()
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Marcar todos los campos como touched
        const allTouched: Partial<Record<keyof ReservationFormData, boolean>> = {}
        Object.keys(formData).forEach((key) => {
          allTouched[key as keyof ReservationFormData] = true
        })
        setTouched(allTouched)
        
        // Establecer errores
        const newErrors: Partial<Record<keyof ReservationFormData, string>> = {}
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof ReservationFormData] = err.message
          }
        })
        setErrors(newErrors)
      }
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Cerrar solo si se hace clic en el fondo (backdrop), no en el contenido del modal
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-[60] flex items-end md:items-center justify-center pb-16 md:pb-0"
      onClick={handleBackdropClick}
    >
      {/* Modal */}
      <div className="bg-zinc-900 w-full md:max-w-lg md:rounded-t-2xl rounded-t-3xl animate-slide-up flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-xl font-semibold text-white">Nueva Reserva</h2>
          <div className="flex items-center gap-2">
            {/* Botón de refrescar */}
            <button
              type="button"
              onClick={handleReset}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              title="Limpiar formulario"
            >
              <IoRefreshOutline className="text-2xl text-white" />
            </button>
            {/* Botón de cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              title="Cerrar"
            >
              <IoClose className="text-2xl text-white" />
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Campos del formulario - con scroll */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Periodo (Desde - Hasta) */}
          <div>
            <RangeDatePicker
              startDate={formData.desde}
              endDate={formData.hasta}
              onChange={(start, end) => {
                setFormData({ ...formData, desde: start, hasta: end })
                setTouched({ ...touched, desde: true, hasta: true })
                if (errors.desde) {
                  setErrors({ ...errors, desde: undefined })
                }
                if (errors.hasta) {
                  setErrors({ ...errors, hasta: undefined })
                }
              }}
            />
            {touched.desde && errors.desde && (
              <p className="text-red-500 text-xs mt-1 px-1">{errors.desde}</p>
            )}
            {touched.hasta && errors.hasta && (
              <p className="text-red-500 text-xs mt-1 px-1">{errors.hasta}</p>
            )}
          </div>

          {/* Alojamiento */}
          <div>
            <input
              type="text"
              name="alojamiento"
              value={formData.alojamiento}
              onChange={handleChange}
              onBlur={() => handleBlur('alojamiento')}
              placeholder={touched.alojamiento && errors.alojamiento ? errors.alojamiento : 'Alojamiento'}
              className={`w-full bg-zinc-800 text-white border rounded-lg px-4 py-3 focus:outline-none ${
                touched.alojamiento && errors.alojamiento 
                  ? 'border-red-500 placeholder-red-500 placeholder:text-[0.8rem]' 
                  : 'border-gray-700 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Huésped */}
          <div>
            <input
              type="text"
              name="huesped"
              value={formData.huesped}
              onChange={handleChange}
              onBlur={() => handleBlur('huesped')}
              placeholder={touched.huesped && errors.huesped ? errors.huesped : 'Huésped'}
              className={`w-full bg-zinc-800 text-white border rounded-lg px-4 py-3 focus:outline-none ${
                touched.huesped && errors.huesped 
                  ? 'border-red-500 placeholder-red-500 placeholder:text-[0.8rem]' 
                  : 'border-gray-700 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Teléfono */}
          <div>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={() => handleBlur('telefono')}
              placeholder={touched.telefono && errors.telefono ? errors.telefono : 'Teléfono'}
              className={`w-full bg-zinc-800 text-white border rounded-lg px-4 py-3 focus:outline-none ${
                touched.telefono && errors.telefono 
                  ? 'border-red-500 placeholder-red-500 placeholder:text-[0.8rem]' 
                  : 'border-gray-700 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Total y Seña */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                name="total"
                value={formData.total}
                onChange={handleChange}
                onBlur={() => handleBlur('total')}
                placeholder={touched.total && errors.total ? errors.total : 'Total'}
                className={`w-full bg-zinc-800 text-white border rounded-lg px-4 py-3 focus:outline-none ${
                  touched.total && errors.total 
                    ? 'border-red-500 placeholder-red-500 placeholder:text-[0.8rem]' 
                    : 'border-gray-700 focus:border-blue-500'
                }`}
              />
            </div>
            <div>
              <input
                type="number"
                name="sena"
                value={formData.sena}
                onChange={handleChange}
                onBlur={() => handleBlur('sena')}
                placeholder={touched.sena && errors.sena ? errors.sena : 'Seña'}
                className={`w-full bg-zinc-800 text-white border rounded-lg px-4 py-3 focus:outline-none ${
                  touched.sena && errors.sena 
                    ? 'border-red-500 placeholder-red-500 placeholder:text-[0.8rem]' 
                    : 'border-gray-700 focus:border-blue-500'
                }`}
              />
            </div>
          </div>
          </div>

          {/* Botón Agregar - Siempre visible al fondo */}
          <div className="p-4 border-t border-gray-800 bg-zinc-900 flex-shrink-0">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

