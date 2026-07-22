import { Suspense } from 'react'

import PublicPropertyResults from '@/components/PublicPropertyResults'

export const metadata = {
  title: 'Propiedades disponibles',
  description: 'Explorá alojamientos disponibles y reservá de forma segura.',
}

export default function ExplorarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#131313]" />}>
      <PublicPropertyResults />
    </Suspense>
  )
}
