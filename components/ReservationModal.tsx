'use client'

import { useState, useEffect } from 'react'
import { IoClose, IoRefreshOutline, IoChevronDown } from 'react-icons/io5'
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
  plataforma: '' | 'Airbnb' | 'Booking' | 'Facebook' | 'Mercado Libre' | 'Recomendado' | 'Otro' | 'Particular'
}

// Schema de validación con Zod
const reservationSchema = z.object({
  desde: z.string().min(1, 'La fecha de inicio es requerida'),
  hasta: z.string().min(1, 'La fecha de fin es requerida'),
  alojamiento: z.string().min(1, 'El alojamiento es requerido'),
  huesped: z.string().min(1, 'El nombre del huésped es requerido'),
  telefono: z.string().optional().or(z.literal('')),
  total: z.string().min(1, 'El total es requerido'),
  sena: z.string().optional().or(z.literal('')),
  plataforma: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v && v.length ? v : 'Particular'))
    .refine((v) => ['Airbnb', 'Booking', 'Facebook', 'Mercado Libre', 'Recomendado', 'Otro', 'Particular'].includes(v), {
      message: 'La plataforma no es válida',
    }),
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
    plataforma: 'Particular',
  })
  
  const [errors, setErrors] = useState<Partial<Record<keyof ReservationFormData, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof ReservationFormData, boolean>>>({})
  const [openPlataforma, setOpenPlataforma] = useState(false)
  const [openAlojamiento, setOpenAlojamiento] = useState(false)
  const [propertyNames, setPropertyNames] = useState<string[]>([])
  const [openUpAlojamiento, setOpenUpAlojamiento] = useState(false)
  const menuOpen = openPlataforma || openAlojamiento

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

  // Cargar propiedades para el selector de Alojamiento
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/propiedades')
        if (!res.ok) return
        const json = await res.json()
        const list: any[] = Array.isArray(json?.propiedades) ? json.propiedades : []
        setPropertyNames(list.map((p) => p?.nombre).filter(Boolean))
      } catch {}
    }
    if (isOpen) load()
  }, [isOpen])

  // Cerrar menús con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((openAlojamiento || openPlataforma) && e.key === 'Escape') {
        setOpenAlojamiento(false)
        setOpenPlataforma(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [openAlojamiento, openPlataforma])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      plataforma: 'Particular',
    })
    setErrors({})
    setTouched({})
    setOpenPlataforma(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar todos los campos
    try {
      const parsed = reservationSchema.parse(formData)
      // Si la validación pasa, enviar datos
      onSubmit({
        ...formData,
        plataforma: (parsed as any).plataforma || 'Particular',
        sena: formData.sena || '',
      })
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

  const PLATAFORMA_OPCIONES: ReservationFormData['plataforma'][] = [
    'Airbnb','Booking','Facebook','Mercado Libre','Recomendado','Otro','Particular'
  ]

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] flex items-end md:items-center justify-center pb-16 md:pb-0"
      style={{ paddingBottom: 'var(--kb-inset, 0px)' }}
      onClick={handleBackdropClick}
    >
      {/* Modal */}
      <div className="bg-gray-900 w-full md:max-w-lg md:rounded-t-2xl rounded-t-3xl animate-slide-up flex flex-col max-h-[85vh] relative">
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

        {/* Overlay para bloquear interacción cuando hay menús abiertos */}
        {menuOpen && (
          <div
            className="absolute inset-0 z-40"
            onClick={() => { setOpenAlojamiento(false); setOpenPlataforma(false) }}
            aria-hidden="true"
          />
        )}

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

          {/* Alojamiento (dropdown) */}
          <div className="relative">
            <label className="sr-only">Alojamiento</label>
            <button
              type="button"
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect()
                const espacioAbajo = window.innerHeight - rect.bottom
                setOpenUpAlojamiento(espacioAbajo < 240)
                setOpenAlojamiento((v) => !v)
                setOpenPlataforma(false)
              }}
              onBlur={() => setTouched({ ...touched, alojamiento: true })}
              className={`relative w-full bg-gray-800 border rounded-lg pl-10 pr-4 py-3 text-left transition-all ${
                touched.alojamiento && errors.alojamiento ? 'border-red-500' : 'border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
            >
              <IoChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <span className={`text-sm ${formData.alojamiento ? 'text-gray-200' : 'text-gray-400'}`}>
                {formData.alojamiento || 'Alojamiento'}
              </span>
            </button>
            {openAlojamiento && (
              <div className={`absolute left-0 right-0 ${openUpAlojamiento ? 'bottom-full mb-2' : 'top-full mt-2'} bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto`}>
                {propertyNames.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-400">No hay alojamientos</div>
                ) : propertyNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, alojamiento: name })
                      setErrors({ ...errors, alojamiento: undefined })
                      setTouched({ ...touched, alojamiento: true })
                      setOpenAlojamiento(false)
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
            {touched.alojamiento && errors.alojamiento && (
              <p className="text-red-500 text-xs mt-1 px-1">{errors.alojamiento}</p>
            )}
          </div>

          {/* Plataforma */}
          <div className="relative">
            <label className="sr-only">Plataforma</label>
            <button
              type="button"
              onClick={() => { setOpenPlataforma((v) => !v); setOpenAlojamiento(false) }}
              onBlur={() => setTouched({ ...touched, plataforma: true })}
              className={`relative w-full bg-gray-800 border rounded-lg pl-10 pr-4 py-3 text-left transition-all ${
                touched.plataforma && errors.plataforma ? 'border-red-500' : 'border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
            >
              <IoChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <span className={`text-sm ${formData.plataforma ? 'text-gray-200' : 'text-gray-400'}`}>
                {formData.plataforma || 'Plataforma'}
              </span>
            </button>
            {openPlataforma && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                {PLATAFORMA_OPCIONES.map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, plataforma: op });
                      setErrors({ ...errors, plataforma: undefined });
                      setTouched({ ...touched, plataforma: true });
                      setOpenPlataforma(false);
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}
            {touched.plataforma && errors.plataforma && (
              <p className="text-red-500 text-xs mt-1 px-1">{errors.plataforma}</p>
            )}
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
              className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:outline-none ${
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
              className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:outline-none ${
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
                className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:outline-none ${
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
                className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:outline-none ${
                  touched.sena && errors.sena 
                    ? 'border-red-500 placeholder-red-500 placeholder:text-[0.8rem]' 
                    : 'border-gray-700 focus:border-blue-500'
                }`}
              />
            </div>
          </div>
          </div>

          {/* Botón Agregar - Siempre visible al fondo */}
          <div className="p-4 border-t border-gray-800 bg-gray-900 flex-shrink-0">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

