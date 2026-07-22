'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type Mode = 'success' | 'pending' | 'failure'

export default function PaymentResult({ mode }: { mode: Mode }) {
  const searchParams = useSearchParams()
  const reservaId = searchParams.get('reserva') || searchParams.get('external_reference') || ''
  const [confirmed, setConfirmed] = useState(mode !== 'success')
  const [detail, setDetail] = useState<{ propiedad?: string; precioTotal?: number } | null>(null)

  useEffect(() => {
    if (!reservaId) return
    let cancelled = false
    let attempts = 0
    const check = async () => {
      try {
        const response = await fetch(`/api/reservas/public/${encodeURIComponent(reservaId)}`, {
          cache: 'no-store',
        })
        const json = await response.json()
        if (cancelled) return
        if (response.ok) {
          setDetail(json)
          if (json.pagoEstado === 'aprobado' || json.estado === 'confirmada') {
            setConfirmed(true)
            return
          }
        }
      } catch {}
      attempts += 1
      if (!cancelled && mode === 'success' && attempts < 15) {
        window.setTimeout(check, 2000)
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [mode, reservaId])

  const content = mode === 'success'
    ? confirmed
      ? {
          icon: 'check_circle',
          color: 'text-emerald-400',
          title: 'Reserva confirmada',
          text: 'El pago fue aprobado y las fechas quedaron reservadas.',
        }
      : {
          icon: 'sync',
          color: 'text-[#b5c4ff]',
          title: 'Estamos confirmando tu pago',
          text: 'Mercado Pago aprobó la operación. Esperá unos segundos mientras recibimos la confirmación.',
        }
    : mode === 'pending'
      ? {
          icon: 'schedule',
          color: 'text-amber-400',
          title: 'Pago pendiente',
          text: 'La reserva se confirmará automáticamente cuando Mercado Pago apruebe el pago.',
        }
      : {
          icon: 'error',
          color: 'text-red-400',
          title: 'No se completó el pago',
          text: 'No se realizó ningún cobro confirmado. Podés volver a buscar e intentarlo nuevamente.',
        }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#131313] px-6 text-[#e5e2e1]">
      <main className="w-full max-w-lg rounded-2xl border border-[#434655] bg-[#201f1f] p-8 text-center">
        <span className={`material-symbols-outlined text-6xl ${content.color}`}>{content.icon}</span>
        <h1 className="mt-5 text-3xl font-bold">{content.title}</h1>
        <p className="mt-3 text-[#c3c5d8]">{content.text}</p>
        {detail?.propiedad && <p className="mt-5 font-semibold">{detail.propiedad}</p>}
        {reservaId && <p className="mt-2 text-xs text-[#8d90a1]">Reserva: {reservaId}</p>}
        <Link href="/reservar" className="mt-8 flex w-full justify-center rounded bg-[#2d68ff] py-3 font-semibold">
          Volver a Pedri Reservas
        </Link>
      </main>
    </div>
  )
}
