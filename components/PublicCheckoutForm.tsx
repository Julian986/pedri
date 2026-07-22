'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type Propiedad = {
  _id: string
  nombre: string
  imagen?: string | null
  capacidad?: number
  cotizacion?: {
    noches: number
    precioBaseNoche: number
    subtotal: number
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

export default function PublicCheckoutForm() {
  const searchParams = useSearchParams()
  const propiedadId = searchParams.get('propiedadId') || ''
  const desde = searchParams.get('desde') || ''
  const hasta = searchParams.get('hasta') || ''
  const huespedes = Math.max(1, Number(searchParams.get('huespedes') || 1))
  const [propiedad, setPropiedad] = useState<Propiedad | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
  })

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!propiedadId || !desde || !hasta) {
        setError('Faltan datos de la reserva. Volvé a buscar una propiedad.')
        setLoading(false)
        return
      }
      try {
        const query = new URLSearchParams({ desde, hasta, huespedes: String(huespedes) })
        const response = await fetch(`/api/reservas/disponibles?${query}`, { cache: 'no-store' })
        const json = await response.json()
        if (!response.ok) throw new Error(json?.error || 'No se pudo verificar disponibilidad')
        const found = (json?.propiedades || []).find((item: Propiedad) => item._id === propiedadId)
        if (!found) throw new Error('La propiedad ya no está disponible para esas fechas.')
        if (active) setPropiedad(found)
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar la reserva')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [propiedadId, desde, hasta, huespedes])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!propiedad) return
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/mercadopago/preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propiedadId,
          desde,
          hasta,
          huespedes,
          ...form,
        }),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json?.error || 'No se pudo iniciar el pago')
      if (!json?.checkoutUrl) throw new Error('Mercado Pago no devolvió un enlace de pago')
      window.location.assign(json.checkoutUrl)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar el pago')
      setSubmitting(false)
    }
  }

  const query = new URLSearchParams({ desde, hasta, huespedes: String(huespedes) })

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#131313] text-[#c3c5d8]">Verificando disponibilidad...</div>
  }

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1]">
      <header className="border-b border-[#434655]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/reservar" className="text-3xl font-bold text-[#b5c4ff]">Pedri</Link>
          <span className="flex items-center gap-1 text-sm text-[#c3c5d8]">
            <span className="material-symbols-outlined text-lg">lock</span>
            Pago seguro
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_380px]">
        <div>
          <Link href={`/explorar?${query}`} className="mb-5 inline-flex items-center gap-1 text-sm text-[#b5c4ff]">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Volver a propiedades
          </Link>
          <h1 className="text-3xl font-bold">Confirmá tu reserva</h1>
          <p className="mt-2 text-[#c3c5d8]">Completá tus datos y continuá al sitio seguro de Mercado Pago.</p>

          {error && (
            <div className="mt-6 rounded border border-red-900 bg-red-950/30 p-4 text-red-200">{error}</div>
          )}

          {propiedad && (
            <form onSubmit={submit} className="mt-8 space-y-6">
              <section className="rounded-xl border border-[#434655] bg-[#201f1f] p-6">
                <h2 className="mb-5 text-xl font-semibold">Datos del huésped</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  {[
                    ['nombre', 'Nombre', 'Tu nombre', 'text'],
                    ['apellido', 'Apellido', 'Tu apellido', 'text'],
                    ['email', 'Correo electrónico', 'nombre@correo.com', 'email'],
                    ['telefono', 'Teléfono', '+54 9 11 1234 5678', 'tel'],
                  ].map(([key, label, placeholder, type]) => (
                    <label key={key} className="flex flex-col gap-2 text-sm text-[#c3c5d8]">
                      {label}
                      <input
                        type={type}
                        required
                        value={form[key as keyof typeof form]}
                        onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                        placeholder={placeholder}
                        className="rounded border border-[#434655] bg-[#1c1b1b] px-4 py-3 text-base text-white outline-none focus:border-[#2d68ff]"
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-[#434655] bg-[#201f1f] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#009ee3] text-white">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                  </div>
                  <div>
                    <h2 className="font-semibold">Mercado Pago</h2>
                    <p className="text-sm text-[#c3c5d8]">Tarjetas, dinero en cuenta y medios disponibles.</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-[#8d90a1]">
                  Los datos de pago se ingresan únicamente en Mercado Pago. Pedri no almacena números de tarjeta.
                </p>
              </section>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded bg-[#2d68ff] py-4 text-xl font-semibold disabled:cursor-wait disabled:opacity-60"
              >
                <span className="material-symbols-outlined">lock</span>
                {submitting ? 'Preparando pago...' : `Pagar ${money(propiedad.cotizacion?.total || 0)}`}
              </button>
            </form>
          )}
        </div>

        {propiedad && (
          <aside className="h-fit rounded-xl border border-[#434655] bg-[#201f1f] p-6 lg:sticky lg:top-6">
            <div className="flex gap-4 border-b border-[#434655] pb-5">
              {propiedad.imagen ? (
                <img src={propiedad.imagen} alt="" className="h-20 w-20 rounded object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded bg-[#2a2a2a]">
                  <span className="material-symbols-outlined text-3xl">apartment</span>
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-wider text-[#b5c4ff]">Alojamiento</p>
                <h2 className="mt-1 text-xl font-semibold">{propiedad.nombre}</h2>
              </div>
            </div>
            <dl className="space-y-3 border-b border-[#434655] py-5 text-sm">
              <div className="flex justify-between"><dt className="text-[#c3c5d8]">Ingreso</dt><dd>{desde.split('-').reverse().join('/')}</dd></div>
              <div className="flex justify-between"><dt className="text-[#c3c5d8]">Salida</dt><dd>{hasta.split('-').reverse().join('/')}</dd></div>
              <div className="flex justify-between"><dt className="text-[#c3c5d8]">Huéspedes</dt><dd>{huespedes}</dd></div>
              <div className="flex justify-between"><dt className="text-[#c3c5d8]">Noches</dt><dd>{propiedad.cotizacion?.noches || 0}</dd></div>
              {(propiedad.cotizacion?.descuentoTotalPct || 0) > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <dt>Descuento</dt><dd>{propiedad.cotizacion?.descuentoTotalPct}%</dd>
                </div>
              )}
            </dl>
            <div className="flex items-end justify-between pt-5">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-3xl font-bold">{money(propiedad.cotizacion?.total || 0)}</span>
            </div>
          </aside>
        )}
      </main>
    </div>
  )
}
