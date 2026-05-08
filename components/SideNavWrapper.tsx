'use client'

import { useEffect, useState } from 'react'
import { useModal } from '@/contexts/ModalContext'
import { usePathname } from 'next/navigation'
import SideNav from './SideNav'

const PUBLIC_PATHS = ['/reservar', '/explorar', '/detalle', '/finalizar']

export default function SideNavWrapper() {
  const { isModalOpen } = useModal()
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  useEffect(() => {
    try {
      const v = localStorage.getItem('sideNavCollapsed')
      if (v === '1') setCollapsed(true)
    } catch {}
  }, [])

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('sideNavCollapsed', next ? '1' : '0')
      } catch {}
      return next
    })
  }

  if (isPublic) return null

  return <SideNav disabled={isModalOpen} collapsed={collapsed} onToggleCollapsed={toggle} />
}

