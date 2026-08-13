'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import RangeDatePicker from '@/components/RangeDatePicker'
import { sendEvent } from '@/lib/gtag'

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const triggerClassName =
  'w-full rounded border border-[#8d90a1] bg-[#2a2a2a] py-3 pl-10 pr-3 text-[15px] font-medium text-[#e5e2e1] outline-none transition-colors focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff] text-left flex items-center justify-between'

export default function ReservarHeroBookingBar() {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [huespedes, setHuespedes] = useState('1')

  const minIngreso = useMemo(() => todayISO(), [])

  const handleDatesChange = (start: string, end: string) => {
    setCheckIn(start)
    setCheckOut(end)
  }

  const handleSearch = () => {
    sendEvent('buscar_click', {
      location: 'reservar_hero_booking_bar',
      has_check_in: Boolean(checkIn),
      has_check_out: Boolean(checkOut),
    })
    if (!checkIn || !checkOut) return
    const query = new URLSearchParams({ desde: checkIn, hasta: checkOut, huespedes })
    router.push(`/explorar?${query.toString()}`)
  }

  return (
    <div className="flex w-full max-w-4xl flex-col items-end gap-2 rounded-lg border border-[#434655] bg-[#131313]/80 p-3 shadow-2xl backdrop-blur-md md:flex-row">
      <div className="flex w-full min-w-0 flex-1 flex-col gap-1 md:flex-[2]">
        <div className="grid grid-cols-2 gap-3">
          <label className="ml-2 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#c3c5d8]">
            Ingreso
          </label>
          <label className="ml-2 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#c3c5d8]">
            Salida
          </label>
        </div>
        <div className="relative w-full">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-[#8d90a1]">
            calendar_month
          </span>
          <span className="material-symbols-outlined pointer-events-none absolute left-[calc(50%+1.125rem)] top-1/2 z-[1] -translate-y-1/2 text-[#8d90a1]">
            calendar_month
          </span>
          <RangeDatePicker
            startDate={checkIn}
            endDate={checkOut}
            onChange={handleDatesChange}
            trigger="split"
            requireBothDates
            minDate={minIngreso}
            placeholderStart="Agregar fecha"
            placeholderEnd="Agregar fecha"
            triggerClassName={triggerClassName}
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-1 md:max-w-[180px]">
        <label className="ml-2 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#c3c5d8]">
          Huéspedes
        </label>
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8d90a1]">
            person
          </span>
          <select
            value={huespedes}
            onChange={(e) => setHuespedes(e.target.value)}
            className="w-full appearance-none rounded border border-[#8d90a1] bg-[#2a2a2a] py-3 pl-10 pr-9 text-[15px] font-medium text-[#e5e2e1] outline-none transition-colors focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]"
          >
            <option value="1">1 huésped</option>
            <option value="2">2 huéspedes</option>
            <option value="3">3+ huéspedes</option>
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8d90a1]">
            expand_more
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSearch}
        className="flex h-[44px] w-full items-center justify-center gap-2 whitespace-nowrap rounded bg-[#2d68ff] px-10 text-[20px] font-semibold leading-7 text-[#fffcff] shadow-[0_4px_20px_rgba(45,104,255,0.3)] transition duration-200 hover:opacity-90 active:scale-95 md:mt-6 md:w-auto"
      >
        <span className="material-symbols-outlined">search</span>
        Buscar
      </button>
    </div>
  )
}
