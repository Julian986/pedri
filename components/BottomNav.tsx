'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IoHomeOutline, IoHome } from 'react-icons/io5'
import { MdOutlineCalendarMonth, MdCalendarMonth } from 'react-icons/md'
import { BiReceipt, BiSolidReceipt } from 'react-icons/bi'
import { HiOutlineCurrencyDollar, HiCurrencyDollar } from 'react-icons/hi2'
import { IoStatsChartOutline, IoStatsChart } from 'react-icons/io5'

interface NavItem {
  name: string
  path: string
  iconOutline: React.ElementType
  iconFilled: React.ElementType
}

const navItems: NavItem[] = [
  {
    name: 'Inicio',
    path: '/',
    iconOutline: IoHomeOutline,
    iconFilled: IoHome,
  },
  {
    name: 'Calendario',
    path: '/calendario',
    iconOutline: MdOutlineCalendarMonth,
    iconFilled: MdCalendarMonth,
  },
  {
    name: 'Reservas',
    path: '/reservas',
    iconOutline: BiReceipt,
    iconFilled: BiSolidReceipt,
  },
  {
    name: 'Gastos',
    path: '/gastos',
    iconOutline: HiOutlineCurrencyDollar,
    iconFilled: HiCurrencyDollar,
  },
  {
    name: 'Análisis',
    path: '/analisis',
    iconOutline: IoStatsChartOutline,
    iconFilled: IoStatsChart,
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = isActive ? item.iconFilled : item.iconOutline

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-blue-500'
                  : 'text-gray-400 active:text-blue-400'
              }`}
            >
              <Icon className="text-2xl mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

