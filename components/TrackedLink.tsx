'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { sendEvent } from '@/lib/gtag'

type TrackedLinkProps = ComponentProps<typeof Link> & {
  eventName: string
  location: string
  eventParams?: Record<string, string | number | boolean | undefined>
}

export default function TrackedLink({
  eventName,
  location,
  eventParams,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        sendEvent(eventName, {
          location,
          ...(eventParams ?? {}),
        })
        onClick?.(event)
      }}
    />
  )
}
