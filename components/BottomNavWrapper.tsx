'use client'

import BottomNav from './BottomNav'
import { useModal } from '@/contexts/ModalContext'

export default function BottomNavWrapper() {
  const { isModalOpen } = useModal()
  
  return <BottomNav disabled={isModalOpen} />
}

