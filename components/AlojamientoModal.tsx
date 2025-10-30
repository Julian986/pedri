'use client'

import { useEffect, useState } from 'react'
import { IoClose, IoRefreshOutline, IoTrash } from 'react-icons/io5'
import { z } from 'zod'

interface AlojamientoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { nombre: string; direccion?: string }) => void
  initialData?: { nombre: string; direccion?: string }
  mode?: 'create' | 'edit'
  onDelete?: () => void
}

const alojamientoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es requerido')
    .max(80, 'Máximo 80 caracteres'),
  direccion: z
    .string()
    .trim()
    .max(120, 'Máximo 120 caracteres')
    .optional()
    .or(z.literal('')),
})

export default function AlojamientoModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
  onDelete,
}: AlojamientoModalProps) {
  const [formData, setFormData] = useState<{ nombre: string; direccion: string }>({
    nombre: initialData?.nombre ?? '',
    direccion: initialData?.direccion ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<'nombre' | 'direccion', string>>>({})
  const [touched, setTouched] = useState<Partial<Record<'nombre' | 'direccion', boolean>>>({})

  // Sincronizar cuando cambie initialData (abrir modal en editar)
  useEffect(() => {
    setFormData({
      nombre: initialData?.nombre ?? '',
      direccion: initialData?.direccion ?? '',
    })
    setErrors({})
    setTouched({})
  }, [initialData])

  // Bloquear scroll de body
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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as 'nombre' | 'direccion']) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleBlur = (field: 'nombre' | 'direccion') => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    try {
      alojamientoSchema.shape[field].parse(formData[field])
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: err.issues[0].message }))
      }
    }
  }

  const handleReset = () => {
    setFormData({ nombre: '', direccion: '' })
    setErrors({})
    setTouched({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const parsed = alojamientoSchema.parse(formData)
      onSubmit({ nombre: parsed.nombre, direccion: parsed.direccion || undefined })
      handleReset()
      onClose()
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Partial<Record<'nombre' | 'direccion', string>> = {}
        const allTouched: Partial<Record<'nombre' | 'direccion', boolean>> = { nombre: true, direccion: true }
        err.issues.forEach((issue) => {
          const key = issue.path[0] as 'nombre' | 'direccion'
          newErrors[key] = issue.message
        })
        setTouched(allTouched)
        setErrors(newErrors)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center pb-16 md:pb-0"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 w-full md:max-w-lg md:rounded-t-2xl rounded-t-3xl animate-slide-up flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-xl font-semibold text-white">
            {mode === 'edit' ? 'Editar alojamiento' : 'Nuevo alojamiento'}
          </h2>
          <div className="flex items-center gap-2">
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                title="Eliminar"
              >
                <IoTrash className="text-2xl text-rose-400" />
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              title="Limpiar"
            >
              <IoRefreshOutline className="text-2xl text-white" />
            </button>
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

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={() => handleBlur('nombre')}
                placeholder={touched.nombre && errors.nombre ? errors.nombre : 'Nombre del alojamiento'}
                className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:outline-none ${
                  touched.nombre && errors.nombre
                    ? 'border-red-500 placeholder-red-500 placeholder:text-[0.8rem]'
                    : 'border-gray-700 focus:border-blue-500'
                }`}
              />
            </div>
            <div>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                onBlur={() => handleBlur('direccion')}
                placeholder={touched.direccion && errors.direccion ? errors.direccion : 'Dirección (opcional)'}
                className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:outline-none ${
                  touched.direccion && errors.direccion
                    ? 'border-red-500 placeholder-red-500 placeholder:text-[0.8rem]'
                    : 'border-gray-700 focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          <div className="p-4 border-t border-gray-800 bg-gray-900 flex-shrink-0">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              {mode === 'edit' ? 'Guardar cambios' : 'Agregar alojamiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


