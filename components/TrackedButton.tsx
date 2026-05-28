'use client'

import type { ButtonHTMLAttributes } from 'react'
import { sendEvent } from '@/lib/gtag'

type TrackedButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  eventName: string
  location: string
  eventParams?: Record<string, string | number | boolean | undefined>
}

export default function TrackedButton({
  eventName,
  location,
  eventParams,
  onClick,
  ...props
}: TrackedButtonProps) {
  return (
    <button
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
