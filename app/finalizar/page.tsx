'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PublicBackLink from '@/components/PublicBackLink'
import RangeDatePicker from '@/components/RangeDatePicker'
import TrackedButton from '@/components/TrackedButton'

type PropiedadCheckout = {
  _id: string
  nombre: string
  imagen?: string | null
  comisionPorcentaje?: number
  cotizacion?: {
    noches: number
    precioBaseNoche: number
    subtotal: number
    descuentoTotalPct: number
    total: number
  } | null
}

const formatARS = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)

function MercadoPagoLogo({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M15.95 4C9.35 4 4 9.35 4 15.95c0 6.6 5.35 11.95 11.95 11.95S27.9 22.55 27.9 15.95C27.9 9.35 22.55 4 15.95 4z"
        fill="#fff"
      />
      <path
        d="M21.6 11.2c-.45-.7-1.35-1.05-2.4-1.05h-6.5c-1.7 0-2.95 1.15-2.95 2.7 0 1.45.95 2.4 2.25 2.7l2.55.6c.55.15.9.45.9.85 0 .55-.55.9-1.35.9h-3.05c-.55 0-1 .15-1.35.4-.2.15-.3.35-.25.55.1.45.55.75 1.2.75h6.55c1.65 0 2.9-1.15 2.9-2.7 0-1.4-.95-2.35-2.25-2.65l-2.55-.6c-.55-.15-.9-.4-.9-.8 0-.55.55-.9 1.35-.9h2.85c.5 0 .9-.15 1.2-.4.2-.15.3-.35.25-.55-.1-.4-.5-.7-1.05-.7z"
        fill="#009EE3"
      />
    </svg>
  )
}

export default function FinalizarPage() {
  const searchParams = useSearchParams()
  const propiedadSlug = searchParams.get('propiedad') || 'yeso'
  const huespedes = Math.max(1, Number(searchParams.get('huespedes') || 1))
  const [desde, setDesde] = useState(searchParams.get('desde') || '')
  const [hasta, setHasta] = useState(searchParams.get('hasta') || '')
  const [propiedad, setPropiedad] = useState<PropiedadCheckout | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '' })

  const normalizar = (value: string) =>
    value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '')

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!desde || !hasta) {
        setPropiedad(null)
        setError('')
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const query = new URLSearchParams({ desde, hasta, huespedes: String(huespedes) })
        const response = await fetch(`/api/reservas/disponibles?${query.toString()}`, { cache: 'no-store' })
        const json = await response.json()
        if (!response.ok) throw new Error(json?.error || 'No se pudo verificar la disponibilidad')
        const found = (json?.propiedades || []).find(
          (item: PropiedadCheckout) => normalizar(item.nombre) === normalizar(propiedadSlug),
        )
        if (!found) throw new Error('La propiedad ya no está disponible para esas fechas.')
        if (active) setPropiedad(found)
      } catch (cause) {
        if (active) {
          setPropiedad(null)
          setError(cause instanceof Error ? cause.message : 'No se pudo cargar la reserva')
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [desde, hasta, huespedes, propiedadSlug])

  const handleDatesChange = (start: string, end: string) => {
    setDesde(start)
    setHasta(end)
  }

  const handlePay = async () => {
    if (!propiedad || submitting) return
    if (!desde || !hasta) {
      setError('Seleccioná las fechas de ingreso y salida.')
      return
    }
    if (!form.nombre.trim() || !form.apellido.trim() || !form.email.trim() || !form.telefono.trim()) {
      setError('Completá todos los datos del huésped.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/mercadopago/preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propiedadId: propiedad._id,
          desde,
          hasta,
          huespedes,
          ...form,
        }),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json?.error || 'No se pudo iniciar el pago')
      if (!json?.checkoutUrl) throw new Error('Mercado Pago no devolvió el enlace de pago')
      window.location.assign(json.checkoutUrl)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar el pago')
      setSubmitting(false)
    }
  }

  const detalleQuery = new URLSearchParams({
    propiedad: propiedadSlug,
    ...(desde ? { desde } : {}),
    ...(hasta ? { hasta } : {}),
    huespedes: String(huespedes),
  })
  const total = propiedad?.cotizacion?.total || 0
  const comision = Math.round((total * Number(propiedad?.comisionPorcentaje || 0)) / 100)
  const propietario = Math.max(0, total - comision)
  const canPay = Boolean(propiedad && desde && hasta && !loading && !submitting)

  return (
    <div className="min-h-[884px] bg-[#131313] text-[#e5e2e1] antialiased">
      <header className="sticky top-0 z-50 w-full border-b border-[#434655] bg-[#131313]">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-[#b5c4ff]">domain</span>
            <span className="text-[32px] font-bold tracking-tight text-[#b5c4ff]">Pedri</span>
          </div>
          <nav className="flex items-center text-sm">
            <TrackedButton eventName="ingresar_click" location="finalizar_header" className="px-1 text-[19px] font-extrabold leading-6 text-[#b5c4ff] transition duration-200 hover:text-[#d0daff] active:scale-95">
              <span>Ingresar</span>
            </TrackedButton>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-10 md:grid-cols-12">
        <div className="flex flex-col gap-10 md:col-span-7 lg:col-span-8">
          <div className="flex flex-col gap-1.5">
            <PublicBackLink href={`/detalle?${detalleQuery.toString()}`} className="inline-flex w-fit items-center gap-1 text-sm text-[#b5c4ff] hover:underline">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Volver a detalle
            </PublicBackLink>

            <div className="flex flex-col gap-2">
              <h1 className="text-[32px] font-bold">Confirmá tu reserva</h1>
              <p className="text-[16px] text-[#c3c5d8]">
                Revisá tus datos y completá el pago para asegurar tu estadía.
              </p>
            </div>
          </div>

          <section className="flex flex-col gap-6">
            <h2 className="text-[20px] font-semibold">Fechas de la estadía</h2>
            <div className="rounded-lg border border-[#353534] bg-[#201f1f] p-6">
              <RangeDatePicker
                startDate={desde}
                endDate={hasta}
                onChange={handleDatesChange}
                requireBothDates
                placeholder="Seleccionar ingreso y salida"
              />
              <p className="mt-3 text-[14px] text-[#8d90a1]">
                El calendario se mantiene abierto hasta que elijas ambas fechas.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <h2 className="text-[20px] font-semibold">Datos del huésped</h2>
            <div className="grid grid-cols-1 gap-6 rounded-lg border border-[#353534] bg-[#201f1f] p-6 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] text-[#c3c5d8]" htmlFor="firstName">Nombre</label>
                <input id="firstName" type="text" value={form.nombre} onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))} placeholder="Tu nombre" className="w-full rounded border border-[#353534] bg-[#1c1b1b] px-3 py-[10px] text-[16px] text-[#e5e2e1] outline-none transition focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] text-[#c3c5d8]" htmlFor="lastName">Apellido</label>
                <input id="lastName" type="text" value={form.apellido} onChange={(e) => setForm((prev) => ({ ...prev, apellido: e.target.value }))} placeholder="Tu apellido" className="w-full rounded border border-[#353534] bg-[#1c1b1b] px-3 py-[10px] text-[16px] text-[#e5e2e1] outline-none transition focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]" />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[14px] text-[#c3c5d8]" htmlFor="email">Correo electrónico</label>
                <input id="email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="nombre@correo.com" className="w-full rounded border border-[#353534] bg-[#1c1b1b] px-3 py-[10px] text-[16px] text-[#e5e2e1] outline-none transition focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]" />
                <p className="mt-1 text-[14px] text-[#8d90a1]">Te enviaremos aquí la confirmación de la reserva.</p>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[14px] text-[#c3c5d8]" htmlFor="phone">Teléfono</label>
                <div className="relative flex">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8d90a1]" style={{ fontSize: 20 }}>
                    call
                  </span>
                  <input id="phone" type="tel" value={form.telefono} onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))} placeholder="+54 9 11 1234 5678" className="w-full rounded border border-[#353534] bg-[#1c1b1b] py-[10px] pl-10 pr-3 text-[16px] text-[#e5e2e1] outline-none transition focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="relative md:col-span-5 lg:col-span-4">
          <div className="sticky top-[104px] flex flex-col gap-6 rounded-lg border border-[#353534] bg-[#201f1f] p-6">
            <div className="flex items-center gap-6 border-b border-[#353534] pb-6">
              <div className="h-20 w-20 shrink-0 rounded bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDI8CUT31KMiz4cpiddaPWzpdqTbikZZScYk7VGSNFy62b_1L8YFDioawm5BgtQtwPV9sjMEBDt44rV4ywrTC2uX6YPmyTJ5UpDpyi0p78-or5f2m-f8VJ92MeUKSRPo1oLh8SYJKjFsypqO8eUNlVTPucNpLhiYGA_SFN3F2Z1ULJeFe8vD9IHQuo7umNonrXvk6KSXV3AX_ASjcotOp21MNvnq-rRiSbUeX1dXl2lDLCLQtxROxtYhCnEw74bTgE6CMTaQwjtekyH')" }} />
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold uppercase tracking-widest text-[#b5c4ff]">Alojamiento completo</span>
                <h3 className="text-[20px] font-semibold leading-tight">
                  {loading ? 'Cargando...' : propiedad?.nombre || propiedadSlug}
                </h3>
                <div className="mt-1 flex items-center gap-1 text-[#c3c5d8]">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-[15px] font-medium">4.96</span>
                  <span className="text-[14px] text-[#8d90a1]">(124 reseñas)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#353534] pt-6 text-[14px]">
              <h4 className="mb-1 text-[20px] font-semibold">Detalle de precio</h4>
              <div className="flex justify-between">
                <span className="text-[#c3c5d8]">
                  {formatARS(propiedad?.cotizacion?.precioBaseNoche || 0)} x {propiedad?.cotizacion?.noches || 0} noches
                </span>
                <span>{formatARS(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="cursor-help text-[#c3c5d8] underline decoration-dotted underline-offset-4">Comisión Pedri</span>
                <span>{formatARS(comision)}</span>
              </div>
              <div className="flex justify-between">
                <span className="cursor-help text-[#c3c5d8] underline decoration-dotted underline-offset-4">Monto propietario</span>
                <span>{formatARS(propietario)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#c3c5d8]">Huéspedes</span>
                <span>{huespedes}</span>
              </div>
            </div>

            <div className="mt-2 flex items-end justify-between border-t border-[#353534] pt-6">
              <span className="text-[20px] font-semibold">Total (ARS)</span>
              <span className="text-[32px] font-bold tracking-tight text-[#e5e2e1]">{formatARS(total)}</span>
            </div>

            {error && <p className="text-center text-[14px] text-red-400">{error}</p>}
            {!desde || !hasta ? (
              <p className="text-center text-[14px] text-[#8d90a1]">Seleccioná las fechas para continuar.</p>
            ) : null}

            <TrackedButton
              type="button"
              disabled={!canPay}
              onClick={handlePay}
              eventName="confirmar_pagar_click"
              location="finalizar_cta"
              className="flex w-full items-center justify-center gap-3 rounded bg-[#009EE3] py-[14px] text-[18px] font-semibold text-white shadow-[0_4px_20px_rgba(0,158,227,0.35)] transition-colors hover:bg-[#0088c6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MercadoPagoLogo className="h-7 w-7" />
              {submitting ? 'Redirigiendo...' : 'Pagar con Mercado Pago'}
            </TrackedButton>
            <p className="mt-1 text-center text-[14px] text-[#8d90a1]">
              Serás redirigido al sitio seguro de Mercado Pago.
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-auto w-full border-t border-[#434655] bg-[#0e0e0e]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
          <span className="text-[12px] font-semibold uppercase tracking-widest text-[#b5c4ff]">© 2026 Pedri. Todos los derechos reservados.</span>
          <nav className="flex gap-6">
            <a className="text-[14px] text-[#c3c5d8] opacity-80 transition hover:text-[#e5e2e1] hover:opacity-100" href="#">Explorar</a>
            <a className="text-[14px] text-[#c3c5d8] opacity-80 transition hover:text-[#e5e2e1] hover:opacity-100" href="#">Cómo funciona</a>
            <a className="text-[14px] text-[#c3c5d8] opacity-80 transition hover:text-[#e5e2e1] hover:opacity-100" href="#">Soporte</a>
            <a className="text-[14px] text-[#c3c5d8] opacity-80 transition hover:text-[#e5e2e1] hover:opacity-100" href="#">Privacidad</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
