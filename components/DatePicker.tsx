'use client'

import { useState, useEffect } from 'react'

interface DatePickerProps {
  label: string
  value: string // formato YYYY-MM-DD
  onChange: (date: string) => void
  minDate?: string
}

export default function DatePicker({ label, value, onChange, minDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Distancia mínima para considerar un swipe
  const minSwipeDistance = 50

  useEffect(() => {
    if (value) {
      const selectedDate = new Date(value + 'T00:00:00')
      setCurrentDate(selectedDate)
    }
  }, [value])

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
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

    // Días del mes anterior
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
      })
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        month,
        year,
        isCurrentMonth: true,
      })
    }

    // Días del próximo mes
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

  const handleDayClick = (year: number, month: number, day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return
    if (isDateDisabled(year, month, day)) return

    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onChange(dateString)
    setIsOpen(false)
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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-800 text-white border border-gray-700 rounded-lg px-4 py-3 text-left focus:outline-none focus:border-blue-500"
      >
        {value ? formatDisplayDate(value) : <span className="text-gray-500">{label}</span>}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Calendar Modal */}
          <div 
            className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
              {/* Header */}
              <div className="flex items-center justify-center px-6 py-4 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white capitalize">
                  {monthName} {year}
                </h3>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-0 px-4 pt-4">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm text-gray-400 py-2 font-medium"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid de días */}
              <div className="grid grid-cols-7 gap-2 p-4 pb-6">
                {days.map((dayInfo, index) => {
                  const disabled = !dayInfo.isCurrentMonth || isDateDisabled(dayInfo.year, dayInfo.month, dayInfo.day)
                  const selected = isDateSelected(dayInfo.year, dayInfo.month, dayInfo.day)
                  const today = isToday(dayInfo.year, dayInfo.month, dayInfo.day)

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDayClick(dayInfo.year, dayInfo.month, dayInfo.day, dayInfo.isCurrentMonth)}
                      disabled={disabled}
                      className={`
                        aspect-square rounded-full flex items-center justify-center text-base font-medium transition-colors
                        ${disabled ? 'text-gray-600 cursor-not-allowed' : 'text-white cursor-pointer'}
                        ${selected ? 'bg-blue-600 text-white font-bold scale-110' : ''}
                        ${today && !selected ? 'bg-orange-500 text-white' : ''}
                        ${!selected && !today && !disabled ? 'hover:bg-gray-800 active:scale-95' : ''}
                      `}
                    >
                      {dayInfo.day}
                    </button>
                  )
                })}
              </div>
          </div>
        </div>
      )}
    </div>
  )
}

