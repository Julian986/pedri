'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type Propiedad = {
  _id: string
  nombre: string
  direccion?: string
  ciudad?: string
  capacidad?: number
  imagen?: string | null
  precioPorNoche: number
  cotizacion?: {
    noches: number
    descuentoTotalPct: number
    total: number
  } | null
}

const money = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)

export default function PublicPropertyResults() {
  const searchParams = useSearchParams()
  const desde = searchParams.get('desde') || ''
  const hasta = searchParams.get('hasta') || ''
  const huespedes = Math.max(1, Number(searchParams.get('huespedes') || 1))
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const query = new URLSearchParams()
        if (desde && hasta) {
          query.set('desde', desde)
          query.set('hasta', hasta)
          query.set('huespedes', String(huespedes))
        }
        const response = await fetch(`/api/reservas/disponibles?${query.toString()}`, {
          cache: 'no-store',
        })
        const json = await response.json()
        if (!response.ok) throw new Error(json?.error || 'No se pudo consultar disponibilidad')
        if (active) setPropiedades(Array.isArray(json?.propiedades) ? json.propiedades : [])
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar la búsqueda')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [desde, hasta, huespedes])

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1]">
      <header className="sticky top-0 z-40 border-b border-[#434655] bg-[#131313]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/reservar" className="text-[30px] font-bold text-[#b5c4ff]">Pedri</Link>
          <Link href="/reservar" className="text-sm text-[#b5c4ff]">Nueva búsqueda</Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Link href="/reservar" className="mb-6 inline-flex items-center gap-1 text-sm text-[#b5c4ff]">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver
        </Link>
        <h1 className="text-3xl font-bold">Propiedades disponibles</h1>
        <p className="mt-2 text-[#c3c5d8]">
          {desde && hasta
            ? `${desde.split('-').reverse().join('/')} al ${hasta.split('-').reverse().join('/')} · ${huespedes} ${huespedes === 1 ? 'huésped' : 'huéspedes'}`
            : 'Seleccioná un período para ver disponibilidad y precio final.'}
        </p>

        {loading && <p className="py-16 text-center text-[#c3c5d8]">Buscando alojamientos...</p>}
        {error && <p className="mt-8 rounded border border-red-900 bg-red-950/30 p-4 text-red-200">{error}</p>}
        {!loading && !error && propiedades.length === 0 && (
          <div className="mt-10 rounded-xl border border-[#434655] p-8 text-center">
            <p className="text-lg">No hay alojamientos disponibles para esta búsqueda.</p>
            <Link href="/reservar" className="mt-4 inline-block text-[#b5c4ff]">Probar otras fechas</Link>
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {propiedades.map((propiedad) => {
            const query = new URLSearchParams({
              propiedadId: propiedad._id,
              desde,
              hasta,
              huespedes: String(huespedes),
            })
            return (
              <article key={propiedad._id} className="overflow-hidden rounded-xl border border-[#434655] bg-[#1c1b1b]">
                <div className="h-56 bg-[#2a2a2a]">
                  {propiedad.imagen ? (
                    <img src={propiedad.imagen} alt={propiedad.nombre} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#8d90a1]">
                      <span className="material-symbols-outlined text-5xl">apartment</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold">{propiedad.nombre}</h2>
                  <p className="mt-1 text-sm text-[#c3c5d8]">
                    {[propiedad.direccion, propiedad.ciudad].filter(Boolean).join(' · ') || 'Argentina'}
                  </p>
                  <p className="mt-2 text-sm text-[#c3c5d8]">
                    Hasta {propiedad.capacidad || 1} {(propiedad.capacidad || 1) === 1 ? 'huésped' : 'huéspedes'}
                  </p>
                  <div className="mt-6 border-t border-[#434655] pt-5">
                    {propiedad.cotizacion ? (
                      <>
                        <p className="text-2xl font-bold">{money(propiedad.cotizacion.total)}</p>
                        <p className="text-sm text-[#c3c5d8]">
                          Total por {propiedad.cotizacion.noches} noches
                          {propiedad.cotizacion.descuentoTotalPct > 0
                            ? ` · ${propiedad.cotizacion.descuentoTotalPct}% de descuento`
                            : ''}
                        </p>
                      </>
                    ) : (
                      <p className="text-xl font-bold">{money(propiedad.precioPorNoche)} / noche</p>
                    )}
                  </div>
                  {desde && hasta ? (
                    <Link
                      href={`/finalizar?${query.toString()}`}
                      className="mt-5 flex w-full justify-center rounded bg-[#2d68ff] py-3 text-lg font-semibold hover:bg-[#0050e3]"
                    >
                      Reservar
                    </Link>
                  ) : (
                    <Link href="/reservar" className="mt-5 flex w-full justify-center rounded border border-[#b5c4ff] py-3 text-[#b5c4ff]">
                      Elegir fechas
                    </Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </main>
    </div>
  )
}
