'use client'

import { useState } from 'react'

interface Gasto {
  id: string
  mes: string
  tipoGasto: string
  propiedad: string
  monto: number
}

const gastosEjemplo: Gasto[] = [
  {
    id: '1',
    mes: '2025-10',
    tipoGasto: 'Mantenimiento',
    propiedad: 'Ayres de Güemes',
    monto: 25000
  },
  {
    id: '2',
    mes: '2025-10',
    tipoGasto: 'Limpieza',
    propiedad: 'Frente al Mar con piscina',
    monto: 18000
  },
  {
    id: '3',
    mes: '2025-10',
    tipoGasto: 'Servicios',
    propiedad: 'Lo de Vicente',
    monto: 12500
  },
  {
    id: '4',
    mes: '2025-09',
    tipoGasto: 'Reparación',
    propiedad: 'Ayres de Güemes',
    monto: 45000
  },
  {
    id: '5',
    mes: '2025-09',
    tipoGasto: 'Impuestos',
    propiedad: 'Frente al Mar con piscina',
    monto: 32000
  }
]

export default function GastosPage() {
  const [gastos] = useState<Gasto[]>(gastosEjemplo)

  const formatearMes = (mes: string) => {
    const [año, mesNum] = mes.split('-')
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]
    return `${meses[parseInt(mesNum) - 1]} ${año}`
  }

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(monto)
  }

  return (
    <main className="min-h-screen bg-black text-white pb-16 md:pb-0">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Gastos</h1>
          <p className="text-sm text-gray-400">Registro de todos los gastos</p>
        </div>

        {/* Lista de gastos */}
        <div className="space-y-4">
          {gastos.map((gasto) => (
            <div
              key={gasto.id}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-4"
            >
              {/* Mes y tipo de gasto */}
              <div className="flex items-center justify-between mb-3">
                <div className="bg-gray-800 px-4 py-1.5 rounded-full">
                  <span className="text-xs font-medium text-white capitalize">
                    {formatearMes(gasto.mes)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-400">
                  {gasto.tipoGasto}
                </span>
              </div>

              {/* Propiedad y monto */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Propiedad</p>
                  <h3 className="text-base font-semibold text-white">{gasto.propiedad}</h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 mb-1">Monto</p>
                  <p className="text-md font-bold text-red-400">{formatearMonto(gasto.monto)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

