'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { sendPageView } from '@/lib/gtag'

export default function GoogleAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) sendPageView(pathname)
  }, [pathname])

  return null
}
