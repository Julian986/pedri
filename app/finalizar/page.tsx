import { Suspense } from 'react'

import PublicCheckoutForm from '@/components/PublicCheckoutForm'

export const metadata = {
  title: 'Finalizar reserva',
  description: 'Completá tus datos y pagá de forma segura con Mercado Pago.',
}

export default function FinalizarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#131313]" />}>
      <PublicCheckoutForm />
    </Suspense>
  )
}
