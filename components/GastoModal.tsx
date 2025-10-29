'use client'

import { useState, useEffect, useRef } from 'react'
import { IoClose, IoChevronDown, IoRefreshOutline } from 'react-icons/io5'
import { z } from 'zod'

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

  const [errors, setErrors] = useState<Partial<Record<'mes' | 'tipoGasto' | 'propiedad' | 'monto', string>>>({})
  const [touched, setTouched] = useState<Partial<Record<'mes' | 'tipoGasto' | 'propiedad' | 'monto', boolean>>>({})

  const [openMes, setOpenMes] = useState(false)
  const [openTipo, setOpenTipo] = useState(false)
  const [openPropiedad, setOpenPropiedad] = useState(false)
  const [openUpMes, setOpenUpMes] = useState(false)
  const [openUpTipo, setOpenUpTipo] = useState(false)
  const [openUpPropiedad, setOpenUpPropiedad] = useState(false)

  const mesRef = useRef<HTMLDivElement | null>(null)
  const tipoRef = useRef<HTMLDivElement | null>(null)
  const propiedadRef = useRef<HTMLDivElement | null>(null)

  const now = new Date()
  const [mesPickerYear, setMesPickerYear] = useState<number>(now.getFullYear())

  const TIPO_OPCIONES = [
    'Mantenimiento',
    'Limpieza',
    'Servicios',
    'Reparación',
    'Impuestos',
    'Otro'
  ]

  const PROPIEDAD_OPCIONES = [
    'Ayres de Güemes',
    'Excelente ubicación Güemes, Luminoso',
    'Frente al Mar! Hermosas vistas! Cochera',
    'Frente al Mar! Increíbles vistas! Con piscina',
    'Hermosas vistas, cálido y luminoso',
    'Lo de Vicente'
  ]

  const NOMBRES_MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const pad2 = (n: number) => String(n).padStart(2, '0')

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

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (openMes && mesRef.current && !mesRef.current.contains(target)) setOpenMes(false)
      if (openTipo && tipoRef.current && !tipoRef.current.contains(target)) setOpenTipo(false)
      if (openPropiedad && propiedadRef.current && !propiedadRef.current.contains(target)) setOpenPropiedad(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMes, openTipo, openPropiedad])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const schema = z.object({
      mes: z.string().min(1, 'Seleccioná un mes'),
      tipoGasto: z.string().min(1, 'Seleccioná un tipo'),
      propiedad: z.string().min(1, 'Seleccioná una propiedad'),
      monto: z.string().min(1, 'Ingresá un monto')
    })

    try {
      schema.parse({ mes, tipoGasto, propiedad, monto })
      onSubmit({ mes, tipoGasto, propiedad, monto: parseFloat(monto) })
      handleReset()
      onClose()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<'mes' | 'tipoGasto' | 'propiedad' | 'monto', string>> = {}
        error.issues.forEach((issue) => {
          const field = issue.path[0] as 'mes' | 'tipoGasto' | 'propiedad' | 'monto'
          newErrors[field] = issue.message
        })
        setErrors(newErrors)
        setTouched({ mes: true, tipoGasto: true, propiedad: true, monto: true })
      }
    }
  }

  const handleReset = () => {
    setMes('')
    setTipoGasto('')
    setPropiedad('')
    setMonto('')
    setErrors({})
    setTouched({})
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center pb-16 md:pb-0">
      <div className="bg-gray-900 w-full md:max-w-md md:rounded-lg rounded-t-2xl max-h-[85vh] md:max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Nuevo Gasto</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              title="Limpiar formulario"
            >
              <IoRefreshOutline className="text-2xl text-white" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full"
              title="Cerrar"
            >
              <IoClose className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          {/* Mes (selector personalizado) */}
          <div ref={mesRef} className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mes
            </label>
            <button
              type="button"
              onClick={() => {
                // Inicializar año del picker según valor actual
                if (mes) {
                  const [y] = mes.split('-')
                  setMesPickerYear(parseInt(y, 10))
                } else {
                  setMesPickerYear(now.getFullYear())
                }
                // decidir abrir hacia arriba o abajo según espacio disponible
                if (mesRef.current) {
                  const rect = mesRef.current.getBoundingClientRect()
                  const espacioAbajo = window.innerHeight - rect.bottom
                  setOpenUpMes(espacioAbajo < 240)
                }
                setOpenMes((v) => !v)
                setOpenTipo(false)
                setOpenPropiedad(false)
              }}
              className="relative w-full bg-gray-800 border border-gray-700 rounded-lg pl-4 pr-12 py-3 text-left text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <span className="text-sm text-gray-300">
                {mes ? (() => { const [y,mn] = mes.split('-'); return `${NOMBRES_MESES_CORTOS[parseInt(mn,10)-1]} ${y}` })() : 'Seleccionar mes'}
              </span>
              <IoChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            </button>
            {openMes && (
              <div className={`absolute left-0 right-0 ${openUpMes ? 'bottom-full mb-2' : 'top-full mt-2'} bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 p-3 max-h-72 overflow-y-auto`}
              >
                <div className="flex items-center justify-between mb-2">
                  <button type="button" onClick={() => setMesPickerYear((y) => y - 1)} className="px-2 py-1 rounded-lg bg-gray-800 text-white border border-gray-700 hover:bg-gray-700">-</button>
                  <span className="text-white font-semibold">{mesPickerYear}</span>
                  <button type="button" onClick={() => setMesPickerYear((y) => y + 1)} className="px-2 py-1 rounded-lg bg-gray-800 text-white border border-gray-700 hover:bg-gray-700">+</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {NOMBRES_MESES_CORTOS.map((nombre, idx) => (
                    <button
                      key={nombre}
                      type="button"
                      onClick={() => {
                        const value = `${mesPickerYear}-${pad2(idx + 1)}`
                        setMes(value)
                        setTouched((t) => ({ ...t, mes: true }))
                        setErrors((e) => ({ ...e, mes: undefined }))
                        setOpenMes(false)
                      }}
                      className="bg-gray-800 border border-gray-700 text-white rounded-md py-2 hover:bg-gray-700"
                    >
                      {nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {touched.mes && errors.mes && (
              <p className="text-red-500 text-xs mt-1 px-1">{errors.mes}</p>
            )}
          </div>

          {/* Tipo de gasto (dropdown custom) */}
          <div ref={tipoRef} className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Gasto
            </label>
            <button
              type="button"
              onClick={() => {
                if (tipoRef.current) {
                  const rect = tipoRef.current.getBoundingClientRect()
                  const espacioAbajo = window.innerHeight - rect.bottom
                  setOpenUpTipo(espacioAbajo < 240)
                }
                setOpenTipo((v) => !v); setOpenMes(false); setOpenPropiedad(false)
              }}
              className="relative w-full bg-gray-800 border border-gray-700 rounded-lg pl-4 pr-12 py-3 text-left text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <span className={`text-sm ${tipoGasto ? 'text-gray-200' : 'text-gray-400'}`}>{tipoGasto || 'Seleccionar tipo'}</span>
              <IoChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            </button>
            {openTipo && (
              <div className={`absolute left-0 right-0 ${openUpTipo ? 'bottom-full mb-2' : 'top-full mt-2'} bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto`}
              >
                {TIPO_OPCIONES.map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => { setTipoGasto(op); setTouched((t)=>({...t,tipoGasto:true})); setErrors((e)=>({...e,tipoGasto: undefined})); setOpenTipo(false) }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}
            {touched.tipoGasto && errors.tipoGasto && (
              <p className="text-red-500 text-xs mt-1 px-1">{errors.tipoGasto}</p>
            )}
          </div>

          {/* Propiedad (dropdown custom) */}
          <div ref={propiedadRef} className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Propiedad
            </label>
            <button
              type="button"
              onClick={() => {
                if (propiedadRef.current) {
                  const rect = propiedadRef.current.getBoundingClientRect()
                  const espacioAbajo = window.innerHeight - rect.bottom
                  setOpenUpPropiedad(espacioAbajo < 240)
                }
                setOpenPropiedad((v) => !v); setOpenMes(false); setOpenTipo(false)
              }}
              className="relative w-full bg-gray-800 border border-gray-700 rounded-lg pl-4 pr-12 py-3 text-left text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <span className={`text-sm ${propiedad ? 'text-gray-200' : 'text-gray-400'}`}>{propiedad || 'Seleccionar propiedad'}</span>
              <IoChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            </button>
            {openPropiedad && (
              <div className={`absolute left-0 right-0 ${openUpPropiedad ? 'bottom-full mb-2' : 'top-full mt-2'} bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto`}
              >
                {PROPIEDAD_OPCIONES.map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => { setPropiedad(op); setTouched((t)=>({...t,propiedad:true})); setErrors((e)=>({...e,propiedad: undefined})); setOpenPropiedad(false) }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}
            {touched.propiedad && errors.propiedad && (
              <p className="text-red-500 text-xs mt-1 px-1">{errors.propiedad}</p>
            )}
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
                onChange={(e) => { setMonto(e.target.value); if (errors.monto) setErrors({ ...errors, monto: undefined }) }}
                onBlur={() => setTouched({ ...touched, monto: true })}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`w-full bg-gray-800 border rounded-lg pl-8 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.monto && errors.monto ? 'border-red-500' : 'border-gray-700'}`}
              />
            </div>
            {touched.monto && errors.monto && (
              <p className="text-red-500 text-xs mt-1 px-1">{errors.monto}</p>
            )}
          </div>

          {/* Botón principal */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Agregar Gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

