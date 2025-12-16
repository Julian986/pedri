'use client'

import { useEffect, useState } from 'react'
import { IoClose, IoRefreshOutline, IoTrash } from 'react-icons/io5'
import { z } from 'zod'

interface AlojamientoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { nombre: string; direccion?: string; comisionPorcentaje?: number; base?: number; capacidad?: number }) => void
  initialData?: { nombre: string; direccion?: string; comisionPorcentaje?: number; base?: number; capacidad?: number }
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
  comisionPorcentaje: z.preprocess(
    (v) => {
      if (v === '' || v === undefined || v === null) return undefined
      const n = Number(v)
      return Number.isNaN(n) ? NaN : n
    },
    z.number().min(0, 'Entre 0 y 100').max(100, 'Entre 0 y 100').optional()
  ),
  base: z.preprocess(
    (v) => {
      if (v === '' || v === undefined || v === null) return undefined
      const n = Number(v)
      return Number.isNaN(n) ? NaN : n
    },
    z.number().min(0, 'Mínimo 0').optional()
  ),
  capacidad: z.preprocess(
    (v) => {
      if (v === '' || v === undefined || v === null) return undefined
      const n = Number(v)
      return Number.isNaN(n) ? NaN : n
    },
    z.number().min(1, 'Mínimo 1').optional()
  ),
})

export default function AlojamientoModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
  onDelete,
}: AlojamientoModalProps) {
  const [formData, setFormData] = useState<{ nombre: string; direccion: string; comisionPorcentaje: string; base: string; capacidad: string }>({
    nombre: initialData?.nombre ?? '',
    direccion: initialData?.direccion ?? '',
    comisionPorcentaje: initialData?.comisionPorcentaje != null ? String(initialData.comisionPorcentaje) : '',
    base: initialData?.base != null ? String(initialData.base) : '',
    capacidad: initialData?.capacidad != null ? String(initialData.capacidad) : '',
  })
  const [errors, setErrors] = useState<Partial<Record<'nombre' | 'direccion' | 'comisionPorcentaje' | 'base' | 'capacidad', string>>>({})
  const [touched, setTouched] = useState<Partial<Record<'nombre' | 'direccion' | 'comisionPorcentaje' | 'base' | 'capacidad', boolean>>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Sincronizar cuando cambie initialData (abrir modal en editar)
  useEffect(() => {
    setFormData({
      nombre: initialData?.nombre ?? '',
      direccion: initialData?.direccion ?? '',
      comisionPorcentaje: initialData?.comisionPorcentaje != null ? String(initialData.comisionPorcentaje) : '',
      base: initialData?.base != null ? String(initialData.base) : '',
      capacidad: initialData?.capacidad != null ? String(initialData.capacidad) : '',
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
    if (errors[name as 'nombre' | 'direccion' | 'comisionPorcentaje' | 'base' | 'capacidad']) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleBlur = (field: 'nombre' | 'direccion' | 'comisionPorcentaje' | 'base' | 'capacidad') => {
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
    setFormData({ nombre: '', direccion: '', comisionPorcentaje: '', base: '', capacidad: '' })
    setErrors({})
    setTouched({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const parsed = alojamientoSchema.parse(formData)
      onSubmit({
        nombre: parsed.nombre,
        direccion: parsed.direccion || undefined,
        comisionPorcentaje: parsed.comisionPorcentaje,
        base: parsed.base,
        capacidad: parsed.capacidad,
      })
      handleReset()
      onClose()
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Partial<Record<'nombre' | 'direccion' | 'comisionPorcentaje' | 'base' | 'capacidad', string>> = {}
        const allTouched: Partial<Record<'nombre' | 'direccion' | 'comisionPorcentaje' | 'base' | 'capacidad', boolean>> = { nombre: true, direccion: true, comisionPorcentaje: true, base: true, capacidad: true }
        err.issues.forEach((issue) => {
          const key = issue.path[0] as 'nombre' | 'direccion' | 'comisionPorcentaje' | 'base' | 'capacidad'
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
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] flex items-end md:items-center justify-center pb-16 md:pb-0"
      style={{ paddingBottom: 'var(--kb-inset, 0px)' }}
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
                onClick={() => setShowDeleteConfirm(true)}
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
            <div>
              <input
                type="number"
                name="comisionPorcentaje"
                value={formData.comisionPorcentaje}
                onChange={handleChange}
                onBlur={() => handleBlur('comisionPorcentaje')}
                placeholder={touched.comisionPorcentaje && errors.comisionPorcentaje ? errors.comisionPorcentaje : 'Comisión (%)'}
                className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:outline-none ${
                  touched.comisionPorcentaje && errors.comisionPorcentaje
                    ? 'border-red-500 placeholder-red-500 placeholder:text-[0.8rem]'
                    : 'border-gray-700 focus:border-blue-500'
                }`}
                min={0}
                max={100}
                step="0.1"
              />
            </div>
            <div>
              <input
                type="number"
                name="base"
                value={formData.base}
                onChange={handleChange}
                onBlur={() => handleBlur('base')}
                placeholder={touched.base && errors.base ? errors.base : 'Base'}
                className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:outline-none ${
                  touched.base && errors.base
                    ? 'border-red-500 placeholder-red-500 placeholder:text-[0.8rem]'
                    : 'border-gray-700 focus:border-blue-500'
                }`}
                min={0}
                step="1"
              />
            </div>
            <div>
              <input
                type="number"
                name="capacidad"
                value={formData.capacidad}
                onChange={handleChange}
                onBlur={() => handleBlur('capacidad')}
                placeholder={touched.capacidad && errors.capacidad ? errors.capacidad : 'Capacidad'}
                className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:outline-none ${
                  touched.capacidad && errors.capacidad
                    ? 'border-red-500 placeholder-red-500 placeholder:text-[0.8rem]'
                    : 'border-gray-700 focus:border-blue-500'
                }`}
                min={1}
                step="1"
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
        {/* Modal de confirmación de borrado */}
        {showDeleteConfirm && onDelete && (
          <div className="fixed inset-0 bg-black/70 z-[95] flex items-center justify-center px-4">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-sm w-full p-5 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-3">
                Eliminar alojamiento
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                ¿Estás seguro de que querés eliminar este alojamiento? Esta acción lo ocultará del calendario.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-200 border border-gray-700 hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    onDelete()
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


