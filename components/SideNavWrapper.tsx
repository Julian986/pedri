'use client'

import { useEffect, useState } from 'react'
import { useModal } from '@/contexts/ModalContext'
import SideNav from './SideNav'

export default function SideNavWrapper() {
  const { isModalOpen } = useModal()
  const [collapsed, setCollapsed] = useState(false)

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

  return <SideNav disabled={isModalOpen} collapsed={collapsed} onToggleCollapsed={toggle} />
}

