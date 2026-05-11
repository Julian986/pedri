'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'

interface DatePickerProps {
  label: string
  value: string
  onChange: (date: string) => void
  minDate?: string
  /** Desactiva el disparador (p. ej. salida hasta elegir ingreso). */
  disabled?: boolean
  /** Clases del botón disparador; si no se pasan, se usa el estilo por defecto. */
  triggerClassName?: string
  /** Modo controlado: si se define junto con `onOpenChange`, el padre controla la visibilidad del modal. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Paleta del modal del calendario (p. ej. `reservar` alinea con la página pública /reservar). */
  modalSurface?: 'default' | 'reservar'
  /** Fecha de referencia (YYYY-MM-DD), p. ej. ingreso en el calendario de salida: muestra un punto debajo del día. */
  referenceDate?: string
}

export default function DatePicker({
  label,
  value,
  onChange,
  minDate,
  disabled = false,
  triggerClassName,
  open: controlledOpen,
  onOpenChange,
  modalSurface = 'default',
  referenceDate,
}: DatePickerProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  const minSwipeDistance = 50

  // Al abrir: mes de la fecha elegida (salida) o, si no hay, mes del ingreso (referenceDate).
  useEffect(() => {
    if (!isOpen) return
    if (value) {
      setCurrentDate(new Date(value + 'T12:00:00'))
      return
    }
    if (referenceDate) {
      setCurrentDate(new Date(referenceDate + 'T12:00:00'))
    }
  }, [isOpen, value, referenceDate])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, setOpen])

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]

  const dayNames = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString + 'T00:00:00')
    const day = date.getDate()
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const days = []

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
      })
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        month,
        year,
        isCurrentMonth: true,
      })
    }

    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
      })
    }

    return days
  }

  const isDateDisabled = (year: number, month: number, day: number) => {
    if (!minDate) return false
    const dateToCheck = new Date(year, month, day)
    const min = new Date(minDate + 'T00:00:00')
    return dateToCheck < min
  }

  const isDateSelected = (year: number, month: number, day: number) => {
    if (!value) return false
    const selectedDate = new Date(value + 'T00:00:00')
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    )
  }

  const isToday = (year: number, month: number, day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    )
  }

  const isReferenceDate = (year: number, month: number, day: number) => {
    if (!referenceDate) return false
    const ref = new Date(referenceDate + 'T00:00:00')
    return ref.getFullYear() === year && ref.getMonth() === month && ref.getDate() === day
  }

  const handleDayClick = (year: number, month: number, day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return
    if (isDateDisabled(year, month, day)) return

    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onChange(dateString)
    setOpen(false)
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextMonth()
    } else if (isRightSwipe) {
      previousMonth()
    }
  }

  const days = getDaysInMonth(currentDate)
  const monthName = monthNames[currentDate.getMonth()]
  const year = currentDate.getFullYear()

  const defaultTriggerClass =
    'w-full rounded-lg border border-gray-700 bg-zinc-800 px-4 py-3 text-left text-white transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  const isReservar = modalSurface === 'reservar'
  const modal = isReservar
    ? {
        overlay: 'bg-[#0e0e0e]/85 backdrop-blur-sm',
        panel:
          'rounded-lg border border-[#434655] bg-[#131313] text-[#e5e2e1] shadow-[0_24px_48px_rgba(0,0,0,0.45)]',
        chevron:
          'text-[#8d90a1] transition-colors hover:bg-[#2a2a2a] hover:text-[#b5c4ff]',
        year: 'text-[#c3c5d8]',
        weekday: 'text-[#8d90a1]',
        dayDisabled: 'text-[#434655]',
        dayEnabled: 'text-[#e5e2e1]',
        daySelected: 'bg-[#2d68ff] text-[#fffcff] shadow-[0_4px_20px_rgba(45,104,255,0.25)]',
        dayToday: 'bg-[#1c1b1b] text-[#b5c4ff] ring-1 ring-[#434655]',
        dayIdle: 'hover:bg-[#2a2a2a] active:bg-[#201f1f]',
        refDot: 'bg-[#b5c4ff]',
      }
    : {
        overlay: 'bg-black/80',
        panel: 'border border-gray-800 bg-black text-white shadow-2xl',
        chevron: 'text-gray-400 transition-colors hover:bg-gray-800 hover:text-white',
        year: 'text-gray-400',
        weekday: 'text-gray-400',
        dayDisabled: 'text-gray-600',
        dayEnabled: 'text-white',
        daySelected: 'bg-blue-600 text-white',
        dayToday: 'bg-orange-500 text-white',
        dayIdle: 'active:bg-gray-900',
        refDot: 'bg-sky-400',
      }

  const emptyLabelClass = isReservar ? 'text-[#8d90a1]' : 'text-gray-500'

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!isOpen)}
        className={
          triggerClassName
            ? `${triggerClassName} disabled:cursor-not-allowed disabled:opacity-50`
            : defaultTriggerClass
        }
      >
        {value ? (
          <span className="capitalize">{formatDisplayDate(value)}</span>
        ) : (
          <span className={emptyLabelClass}>{label}</span>
        )}
      </button>

      {mounted &&
        isOpen &&
        createPortal(
          <div
            className={`fixed inset-0 z-[60] flex items-center justify-center p-4 ${modal.overlay}`}
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false)
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false)
            }}
            onTouchEnd={(e) => {
              if (e.target === e.currentTarget) setOpen(false)
            }}
          >
            <div
              className={`flex w-full max-w-md flex-col ${modal.panel}`}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              role="dialog"
              aria-modal="true"
              aria-label="Elegir fecha"
            >
            <div className="flex items-center justify-between gap-2 px-4 py-4">
              <button
                type="button"
                onClick={previousMonth}
                aria-label="Mes anterior"
                className={`flex h-10 w-10 flex-shrink-0 touch-manipulation items-center justify-center rounded-full ${modal.chevron}`}
              >
                <IoChevronBack className="text-xl" />
              </button>
              <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
                <h2 className="text-lg font-medium capitalize">{monthName}</h2>
                <span className={`text-sm ${modal.year}`}>{year}</span>
              </div>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Mes siguiente"
                className={`flex h-10 w-10 flex-shrink-0 touch-manipulation items-center justify-center rounded-full ${modal.chevron}`}
              >
                <IoChevronForward className="text-xl" />
              </button>
            </div>

            <div
              className={`grid grid-cols-7 gap-0 border-b px-2 pb-2 pt-1 ${isReservar ? 'border-[#353534]' : 'border-gray-800'}`}
            >
              {dayNames.map((day) => (
                <div key={day} className={`py-2 text-center text-xs font-medium ${modal.weekday}`}>
                  {day}
                </div>
              ))}
            </div>

            <div className="grid max-h-[min(52vh,420px)] grid-cols-7 gap-0 px-2 pb-6">
              {days.map((dayInfo, index) => {
                const disabledDay =
                  !dayInfo.isCurrentMonth || isDateDisabled(dayInfo.year, dayInfo.month, dayInfo.day)
                const selected = isDateSelected(dayInfo.year, dayInfo.month, dayInfo.day)
                const today = isToday(dayInfo.year, dayInfo.month, dayInfo.day)
                const refDay = isReferenceDate(dayInfo.year, dayInfo.month, dayInfo.day)

                return (
                  <div key={index} className="relative flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        handleDayClick(dayInfo.year, dayInfo.month, dayInfo.day, dayInfo.isCurrentMonth)
                      }
                      disabled={disabledDay}
                      className={`relative flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm font-medium transition-colors
                        ${disabledDay ? `cursor-not-allowed ${modal.dayDisabled}` : `cursor-pointer ${modal.dayEnabled}`}
                        ${selected ? modal.daySelected : ''}
                        ${today && !selected ? modal.dayToday : ''}
                        ${!selected && !today && !disabledDay ? modal.dayIdle : ''}
                      `}
                    >
                      <span className="leading-none">{dayInfo.day}</span>
                      {refDay && (
                        <span
                          className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${modal.refDot}`}
                          aria-hidden
                          title="Día de ingreso"
                        />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
