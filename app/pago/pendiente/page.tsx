import { Suspense } from 'react'
import PaymentResult from '@/components/PaymentResult'

export default function PagoPendientePage() {
  return <Suspense><PaymentResult mode="pending" /></Suspense>
}
