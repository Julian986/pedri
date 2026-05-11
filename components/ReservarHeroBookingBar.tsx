'use client'

import { useMemo, useState } from 'react'
import DatePicker from '@/components/DatePicker'

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addOneDay(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const triggerClassName =
  'w-full rounded border border-[#8d90a1] bg-[#2a2a2a] py-3 pl-10 pr-3 text-[15px] font-medium text-[#e5e2e1] outline-none transition-colors focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]'

export default function ReservarHeroBookingBar() {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [activePicker, setActivePicker] = useState<'in' | 'out' | null>(null)

  const minIngreso = useMemo(() => todayISO(), [])

  const minSalida = checkIn ? addOneDay(checkIn) : minIngreso

  const handleCheckIn = (date: string) => {
    setCheckIn(date)
    if (checkOut && date >= checkOut) {
      setCheckOut('')
    }
  }

  return (
    <div className="flex w-full max-w-4xl flex-col items-end gap-2 rounded-lg border border-[#434655] bg-[#131313]/80 p-3 shadow-2xl backdrop-blur-md md:flex-row">
      <div className="flex w-full flex-col gap-1">
        <label className="ml-2 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#c3c5d8]">
          Ingreso
        </label>
        <div className="relative w-full">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-[#8d90a1]">
            calendar_month
          </span>
          <DatePicker
            label="Agregar fecha"
            value={checkIn}
            onChange={handleCheckIn}
            minDate={minIngreso}
            open={activePicker === 'in'}
            onOpenChange={(open) => setActivePicker(open ? 'in' : null)}
            triggerClassName={triggerClassName}
            modalSurface="reservar"
          />
        </div>
      </div>

      <div className={`flex w-full flex-col gap-1 ${!checkIn ? 'opacity-50' : ''}`}>
        <label className="ml-2 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#c3c5d8]">
          Salida
        </label>
        <div className="relative w-full">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-[#8d90a1]">
            calendar_month
          </span>
          <DatePicker
            label="Agregar fecha"
            value={checkOut}
            onChange={setCheckOut}
            minDate={minSalida}
            disabled={!checkIn}
            open={activePicker === 'out'}
            onOpenChange={(open) => setActivePicker(open ? 'out' : null)}
            triggerClassName={triggerClassName}
            modalSurface="reservar"
            referenceDate={checkIn || undefined}
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-1">
        <label className="ml-2 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-[#c3c5d8]">
          Huéspedes
        </label>
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8d90a1]">
            person
          </span>
          <select className="w-full appearance-none rounded border border-[#8d90a1] bg-[#2a2a2a] py-3 pl-10 pr-9 text-[15px] font-medium text-[#e5e2e1] outline-none transition-colors focus:border-[#2d68ff] focus:ring-1 focus:ring-[#2d68ff]">
            <option>1 huésped</option>
            <option>2 huéspedes</option>
            <option>3+ huéspedes</option>
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8d90a1]">
            expand_more
          </span>
        </div>
      </div>

      <button
        type="button"
        className="flex h-[44px] w-full items-center justify-center gap-2 whitespace-nowrap rounded bg-[#2d68ff] px-10 text-[20px] font-semibold leading-7 text-[#fffcff] shadow-[0_4px_20px_rgba(45,104,255,0.3)] transition duration-200 hover:opacity-90 active:scale-95 md:w-auto"
      >
        <span className="material-symbols-outlined">search</span>
        Buscar
      </button>
    </div>
  )
}
