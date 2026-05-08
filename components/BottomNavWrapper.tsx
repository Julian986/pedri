'use client'

import BottomNav from './BottomNav'
import { useModal } from '@/contexts/ModalContext'
import { usePathname } from 'next/navigation'

const PUBLIC_PATHS = ['/reservar', '/explorar', '/detalle', '/finalizar']

export default function BottomNavWrapper() {
  const { isModalOpen } = useModal()
  const pathname = usePathname()
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  if (isPublic) return null

  return <BottomNav disabled={isModalOpen} />
}

