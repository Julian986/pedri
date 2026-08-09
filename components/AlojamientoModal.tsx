'use client'

import { useEffect, useMemo, useState } from 'react'
import { IoClose, IoCopyOutline, IoRefreshOutline, IoTrash } from 'react-icons/io5'
import { z } from 'zod'

export type CanalSyncInfo = {
  icalImportUrl?: string
  icalExportToken?: string
  ultimoSyncAt?: string | Date | null
  ultimoSyncError?: string | null
}

export type CanalesForm = {
  icalExportToken?: string
  airbnb?: CanalSyncInfo
  booking?: CanalSyncInfo
}

interface AlojamientoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    nombre: string
    direccion?: string
    comisionPorcentaje?: number
    base?: number
    capacidad?: number
    canales?: CanalesForm
  }) => void | Promise<void>
  initialData?: {
    nombre: string
    direccion?: string
    comisionPorcentaje?: number
    base?: number
    capacidad?: number
    _id?: string
    canales?: CanalesForm
  }
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

function formatSyncAt(value?: string | Date | null): string {
  if (!value) return 'Nunca'
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return 'Nunca'
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AlojamientoModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
  onDelete,
}: AlojamientoModalProps) {
  const [formData, setFormData] = useState<{
    nombre: string
    direccion: string
    comisionPorcentaje: string
    base: string
    capacidad: string
    airbnbIcalUrl: string
    bookingIcalUrl: string
  }>({
    nombre: initialData?.nombre ?? '',
    direccion: initialData?.direccion ?? '',
    comisionPorcentaje: initialData?.comisionPorcentaje != null ? String(initialData.comisionPorcentaje) : '',
    base: initialData?.base != null ? String(initialData.base) : '',
    capacidad: initialData?.capacidad != null ? String(initialData.capacidad) : '',
    airbnbIcalUrl: initialData?.canales?.airbnb?.icalImportUrl ?? '',
    bookingIcalUrl: initialData?.canales?.booking?.icalImportUrl ?? '',
  })
  const [errors, setErrors] = useState<
    Partial<Record<'nombre' | 'direccion' | 'comisionPorcentaje' | 'base' | 'capacidad', string>>
  >({})
  const [touched, setTouched] = useState<
    Partial<Record<'nombre' | 'direccion' | 'comisionPorcentaje' | 'base' | 'capacidad', boolean>>
  >({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const [localCanales, setLocalCanales] = useState<CanalesForm | undefined>(initialData?.canales)

  const exportToken =
    localCanales?.icalExportToken ||
    localCanales?.airbnb?.icalExportToken ||
    localCanales?.booking?.icalExportToken ||
    ''

  const exportUrl = useMemo(() => {
    if (!initialData?._id || !exportToken || typeof window === 'undefined') return ''
    return `${window.location.origin}/api/ical/${initialData._id}/${exportToken}.ics`
  }, [initialData?._id, exportToken])

  // Sincronizar cuando cambie initialData (abrir modal en editar)
  useEffect(() => {
    setFormData({
      nombre: initialData?.nombre ?? '',
      direccion: initialData?.direccion ?? '',
      comisionPorcentaje: initialData?.comisionPorcentaje != null ? String(initialData.comisionPorcentaje) : '',
      base: initialData?.base != null ? String(initialData.base) : '',
      capacidad: initialData?.capacidad != null ? String(initialData.capacidad) : '',
      airbnbIcalUrl: initialData?.canales?.airbnb?.icalImportUrl ?? '',
      bookingIcalUrl: initialData?.canales?.booking?.icalImportUrl ?? '',
    })
    setLocalCanales(initialData?.canales)
    setErrors({})
    setTouched({})
    setSyncMsg(null)
    setCopied(false)
  }, [initialData, isOpen])

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
    setFormData({
      nombre: '',
      direccion: '',
      comisionPorcentaje: '',
      base: '',
      capacidad: '',
      airbnbIcalUrl: '',
      bookingIcalUrl: '',
    })
    setErrors({})
    setTouched({})
  }

  const buildCanalesPayload = (): CanalesForm => ({
    icalExportToken: exportToken || undefined,
    airbnb: {
      ...(localCanales?.airbnb || {}),
      icalImportUrl: formData.airbnbIcalUrl.trim(),
      icalExportToken: exportToken || localCanales?.airbnb?.icalExportToken,
    },
    booking: {
      ...(localCanales?.booking || {}),
      icalImportUrl: formData.bookingIcalUrl.trim(),
      icalExportToken: exportToken || localCanales?.booking?.icalExportToken,
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const parsed = alojamientoSchema.parse(formData)
      await onSubmit({
        nombre: parsed.nombre,
        direccion: parsed.direccion || undefined,
        comisionPorcentaje: parsed.comisionPorcentaje,
        base: parsed.base,
        capacidad: parsed.capacidad,
        canales: mode === 'edit' || formData.airbnbIcalUrl || formData.bookingIcalUrl
          ? buildCanalesPayload()
          : undefined,
      })
      handleReset()
      onClose()
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Partial<
          Record<'nombre' | 'direccion' | 'comisionPorcentaje' | 'base' | 'capacidad', string>
        > = {}
        const allTouched: Partial<
          Record<'nombre' | 'direccion' | 'comisionPorcentaje' | 'base' | 'capacidad', boolean>
        > = {
          nombre: true,
          direccion: true,
          comisionPorcentaje: true,
          base: true,
          capacidad: true,
        }
        err.issues.forEach((issue) => {
          const key = issue.path[0] as 'nombre' | 'direccion' | 'comisionPorcentaje' | 'base' | 'capacidad'
          newErrors[key] = issue.message
        })
        setTouched(allTouched)
        setErrors(newErrors)
      }
    }
  }

  const handleCopyExport = async () => {
    if (!exportUrl) return
    try {
      await navigator.clipboard.writeText(exportUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setSyncMsg('No se pudo copiar. Seleccioná la URL manualmente.')
    }
  }

  const handleSyncNow = async () => {
    if (!initialData?._id) return
    setSyncing(true)
    setSyncMsg(null)
    try {
      // Guardar URLs primero vía PUT implícito no: sync usa lo ya persistido.
      // Pedimos sync puntual; si no hay URLs guardadas, avisar.
      const res = await fetch(`/api/propiedades/${initialData._id}/ical-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airbnbIcalUrl: formData.airbnbIcalUrl.trim(),
          bookingIcalUrl: formData.bookingIcalUrl.trim(),
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || `Error ${res.status}`)

      if (json.propiedad?.canales) {
        setLocalCanales(json.propiedad.canales)
      }
      const parts = (json.results || []).map(
        (r: { canal: string; ok: boolean; imported: number; updated: number; cancelled: number; error?: string }) =>
          `${r.canal}: ${r.ok ? `OK (+${r.imported}/~${r.updated}/-${r.cancelled})` : r.error || 'error'}`
      )
      setSyncMsg(parts.length ? parts.join(' · ') : 'Sin feeds configurados')
    } catch (e) {
      setSyncMsg(e instanceof Error ? e.message : 'Error al sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  if (!isOpen) return null

  const airbnbSync = localCanales?.airbnb
  const bookingSync = localCanales?.booking

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
                placeholder={
                  touched.comisionPorcentaje && errors.comisionPorcentaje
                    ? errors.comisionPorcentaje
                    : 'Comisión (%)'
                }
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

            {/* Sync iCal */}
            <div className="rounded-xl border border-gray-800 bg-gray-950/50 p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Calendarios (iCal)</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Pegá los feeds de export de Airbnb y Booking. Copiá el de Pedri y pegalo en ambas OTAs.
                </p>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">URL iCal Airbnb (import)</label>
                <input
                  type="url"
                  name="airbnbIcalUrl"
                  value={formData.airbnbIcalUrl}
                  onChange={handleChange}
                  placeholder="https://www.airbnb.com/calendar/ical/..."
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Última sync: {formatSyncAt(airbnbSync?.ultimoSyncAt)}
                  {airbnbSync?.ultimoSyncError ? (
                    <span className="text-amber-400"> · {airbnbSync.ultimoSyncError}</span>
                  ) : airbnbSync?.ultimoSyncAt ? (
                    <span className="text-emerald-400"> · OK</span>
                  ) : null}
                </p>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">URL iCal Booking (import)</label>
                <input
                  type="url"
                  name="bookingIcalUrl"
                  value={formData.bookingIcalUrl}
                  onChange={handleChange}
                  placeholder="https://admin.booking.com/hotel/hoteladmin/ical/..."
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Última sync: {formatSyncAt(bookingSync?.ultimoSyncAt)}
                  {bookingSync?.ultimoSyncError ? (
                    <span className="text-amber-400"> · {bookingSync.ultimoSyncError}</span>
                  ) : bookingSync?.ultimoSyncAt ? (
                    <span className="text-emerald-400"> · OK</span>
                  ) : null}
                </p>
              </div>

              {mode === 'edit' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">URL iCal Pedri (export → pegar en OTAs)</label>
                  {exportUrl ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={exportUrl}
                        className="flex-1 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg px-3 py-2.5 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyExport}
                        className="shrink-0 px-3 py-2 rounded-lg border border-gray-700 text-white hover:bg-gray-800 transition-colors"
                        title="Copiar"
                      >
                        <IoCopyOutline className="text-lg" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Guardá el alojamiento para generar la URL de exportación.
                    </p>
                  )}
                  {copied && <p className="text-[11px] text-emerald-400 mt-1">Copiado</p>}
                </div>
              )}

              {mode === 'edit' && initialData?._id && (
                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={syncing}
                  className="w-full text-sm py-2.5 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {syncing ? 'Sincronizando…' : 'Sincronizar ahora'}
                </button>
              )}
              {syncMsg && <p className="text-[11px] text-gray-400">{syncMsg}</p>}
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
              <h3 className="text-lg font-semibold text-white mb-3">Eliminar alojamiento</h3>
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
