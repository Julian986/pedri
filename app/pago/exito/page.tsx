import { Suspense } from 'react'
import PaymentResult from '@/components/PaymentResult'

export default function PagoExitoPage() {
  return <Suspense><PaymentResult mode="success" /></Suspense>
}
