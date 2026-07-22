import { Suspense } from 'react'
import PaymentResult from '@/components/PaymentResult'

export default function PagoErrorPage() {
  return <Suspense><PaymentResult mode="failure" /></Suspense>
}
