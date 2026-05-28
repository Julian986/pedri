'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { MouseEvent, ReactNode } from 'react'
import { sendEvent } from '@/lib/gtag'

type PublicBackLinkProps = {
  href: string
  className?: string
  children: ReactNode
}

export default function PublicBackLink({ href, className, children }: PublicBackLinkProps) {
  const router = useRouter()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    sendEvent('volver_click', { location: 'public_back_link', href })

    // Si hay historial, priorizamos volver atrás para preservar scroll/foco.
    // Basarse solo en `document.referrer` puede fallar por políticas de navegador.
    const canGoBack = typeof window !== 'undefined' && window.history.length > 1

    if (canGoBack) {
      router.back()
      return
    }

    router.push(href)
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
