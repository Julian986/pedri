'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IoHomeOutline, IoHome } from 'react-icons/io5'
import { MdOutlineCalendarMonth, MdCalendarMonth } from 'react-icons/md'
import { BiReceipt, BiSolidReceipt } from 'react-icons/bi'
import { HiOutlineCurrencyDollar, HiCurrencyDollar } from 'react-icons/hi2'
import { IoStatsChartOutline, IoStatsChart } from 'react-icons/io5'
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'

interface NavItem {
  name: string
  path: string
  iconOutline: React.ElementType
  iconFilled: React.ElementType
}

const navItems: NavItem[] = [
  { name: 'Inicio', path: '/', iconOutline: IoHomeOutline, iconFilled: IoHome },
  { name: 'Calendario', path: '/calendario', iconOutline: MdOutlineCalendarMonth, iconFilled: MdCalendarMonth },
  { name: 'Reservas', path: '/reservas', iconOutline: BiReceipt, iconFilled: BiSolidReceipt },
  { name: 'Gastos', path: '/gastos', iconOutline: HiOutlineCurrencyDollar, iconFilled: HiCurrencyDollar },
  { name: 'Análisis', path: '/analisis', iconOutline: IoStatsChartOutline, iconFilled: IoStatsChart },
]

interface SideNavProps {
  disabled?: boolean
  collapsed?: boolean
  onToggleCollapsed?: () => void
}

export default function SideNav({ disabled = false, collapsed = false, onToggleCollapsed }: SideNavProps) {
  const pathname = usePathname()

  return (
    <aside
      className={`hidden md:flex md:flex-col md:h-screen md:sticky md:top-0 bg-black border-r border-gray-800 z-[60] transition-[width] duration-200 ${
        collapsed ? 'md:w-[72px]' : 'md:w-56'
      } ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className={`py-4 border-b border-gray-800 ${collapsed ? 'px-2' : 'px-4'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`text-white font-semibold tracking-wide ${collapsed ? 'sr-only' : ''}`}>Pedri</div>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="p-2 rounded-lg hover:bg-gray-900 text-gray-200"
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? (
              <FiChevronsRight className="text-xl" />
            ) : (
              <FiChevronsLeft className="text-xl" />
            )}
          </button>
        </div>
        {!collapsed && <div className="text-xs text-gray-400 mt-1">Navegación</div>}
      </div>

      <nav className={`flex-1 space-y-1 ${collapsed ? 'p-2' : 'p-3'}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = isActive ? item.iconFilled : item.iconOutline
          return (
            <Link
              key={item.path}
              href={item.path}
              title={item.name}
              aria-label={item.name}
              className={`flex items-center rounded-lg transition-colors ${
                collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-2'
              } ${
                isActive ? 'bg-gray-900 text-blue-500' : 'text-gray-200 hover:bg-gray-900/70 hover:text-white'
              }`}
            >
              <Icon className="text-xl" />
              {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

