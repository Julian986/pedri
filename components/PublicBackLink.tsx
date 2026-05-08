'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { MouseEvent, ReactNode } from 'react'

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

    const hasReferrer = Boolean(document.referrer)
    const sameOriginReferrer =
      hasReferrer && new URL(document.referrer).origin === window.location.origin
    const canGoBack = window.history.length > 1 && sameOriginReferrer

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
