'use client'

import { useState, useEffect } from 'react'
import { IoClose } from 'react-icons/io5'

interface RangeDatePickerProps {
  startDate: string // formato YYYY-MM-DD
  endDate: string // formato YYYY-MM-DD
  onChange: (startDate: string, endDate: string) => void
  trigger?: 'single' | 'split'
  placeholder?: string
  placeholderStart?: string
  placeholderEnd?: string
  /** Si true, el calendario no se cierra hasta elegir inicio y fin. */
  requireBothDates?: boolean
}

export default function RangeDatePicker({
  startDate,
  endDate,
  onChange,
  trigger = 'single',
  placeholder = 'Seleccionar periodo',
  placeholderStart = 'Fecha inicio',
  placeholderEnd = 'Fecha fin',
  requireBothDates = false,
}: RangeDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pickMode, setPickMode] = useState<'range' | 'start' | 'end'>('range')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tempStartDate, setTempStartDate] = useState<string>('')
  const [tempEndDate, setTempEndDate] = useState<string>('')
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Distancia mínima para considerar un swipe
  const minSwipeDistance = 50

  // Sincronizar con props cuando se abre el picker
  useEffect(() => {
    if (isOpen) {
      setTempStartDate(startDate)
      setTempEndDate(endDate)
      // Si ya hay una fecha de inicio, navegar a ese mes
      const base = (pickMode === 'end' ? endDate : startDate) || startDate || endDate
      if (base) {
        const date = new Date(base + 'T00:00:00')
        setCurrentDate(date)
      }
    }
  }, [isOpen, startDate, endDate, pickMode])

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]

  const dayNames = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString + 'T00:00:00')
    const day = date.getDate()
    const month = monthNames[date.getMonth()].slice(0, 3)
    return `${day} ${month}`
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

  const isDateInRange = (year: number, month: number, day: number) => {
    if (!tempStartDate || !tempEndDate) return false
    const dateToCheck = new Date(year, month, day)
    const start = new Date(tempStartDate + 'T00:00:00')
    const end = new Date(tempEndDate + 'T00:00:00')
    return dateToCheck > start && dateToCheck < end
  }

  const isDateSelected = (year: number, month: number, day: number, type: 'start' | 'end') => {
    const dateToCheck = type === 'start' ? tempStartDate : tempEndDate
    if (!dateToCheck) return false
    const selectedDate = new Date(dateToCheck + 'T00:00:00')
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

    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const clickedDate = new Date(year, month, day)

    // Modo selección simple: si se abrió desde Inicio o Fin, setear ese campo y cerrar
    if (pickMode === 'start') {
      const nextStart = dateString
      let nextEnd = tempEndDate
      if (nextEnd) {
        const startObj = new Date(nextStart + 'T00:00:00')
        const endObj = new Date(nextEnd + 'T00:00:00')
        if (endObj <= startObj) nextEnd = ''
      }
      setTempStartDate(nextStart)
      setTempEndDate(nextEnd)
      onChange(nextStart, nextEnd)
      setIsOpen(false)
      return
    }

    if (pickMode === 'end') {
      const nextEnd = dateString
      setTempEndDate(nextEnd)
      onChange(tempStartDate, nextEnd)
      setIsOpen(false)
      return
    }

    // Si no hay fecha de inicio, establecer como inicio
    if (!tempStartDate) {
      setTempStartDate(dateString)
      return
    }

    // Si ya hay inicio pero no fin
    if (tempStartDate && !tempEndDate) {
      const startDateObj = new Date(tempStartDate + 'T00:00:00')
      
      // Si hace clic antes del inicio, reiniciar con nueva fecha de inicio
      if (clickedDate < startDateObj) {
        setTempStartDate(dateString)
        setTempEndDate('')
        return
      }
      
      // Si hace clic después del inicio, establecer como fin
      if (clickedDate > startDateObj) {
        setTempEndDate(dateString)
        onChange(tempStartDate, dateString)
        setIsOpen(false)
        return
      }
      
      // Si hace clic en el mismo día, no hacer nada
      return
    }

    // Si ya hay ambas fechas, reiniciar con nueva fecha de inicio
    if (tempStartDate && tempEndDate) {
      setTempStartDate(dateString)
      setTempEndDate('')
    }
  }

  const handleClear = () => {
    setTempStartDate('')
    setTempEndDate('')
    onChange('', '')
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
      {trigger === 'split' ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setPickMode('start')
              setIsOpen(true)
            }}
            className="w-full bg-zinc-800 text-white border border-gray-700 rounded-lg px-4 py-3 text-left focus:outline-none focus:border-blue-500 flex items-center justify-between"
          >
            {startDate ? (
              <span>{formatDisplayDate(startDate)}</span>
            ) : (
              <span className="text-gray-500">{placeholderStart}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setPickMode('end')
              setIsOpen(true)
            }}
            className="w-full bg-zinc-800 text-white border border-gray-700 rounded-lg px-4 py-3 text-left focus:outline-none focus:border-blue-500 flex items-center justify-between"
          >
            {endDate ? (
              <span>{formatDisplayDate(endDate)}</span>
            ) : (
              <span className="text-gray-500">{placeholderEnd}</span>
            )}

            {(startDate || endDate) && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    handleClear()
                  }
                }}
                className="ml-2 p-1 hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Limpiar selección"
              >
                <IoClose className="text-lg" />
              </span>
            )}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setPickMode('range')
            setIsOpen(!isOpen)
          }}
          className="w-full bg-zinc-800 text-white border border-gray-700 rounded-lg px-4 py-3 text-left focus:outline-none focus:border-blue-500 flex items-center justify-between"
        >
          {startDate && endDate ? (
            <span>{formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}</span>
          ) : startDate ? (
            <span>{formatDisplayDate(startDate)} - <span className="text-gray-500">...</span></span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          {(startDate || endDate) && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  handleClear()
                }
              }}
              className="ml-2 p-1 hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Limpiar selección"
            >
              <IoClose className="text-lg" />
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center p-4"
          onClick={() => {
            if (requireBothDates && (!tempStartDate || !tempEndDate)) return
            setIsOpen(false)
          }}
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
              <div className="flex flex-col items-center justify-center gap-1 px-6 py-4 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white capitalize">
                  {monthName} {year}
                </h3>
                {requireBothDates && (
                  <p className="text-sm text-gray-400">
                    {!tempStartDate
                      ? 'Seleccioná la fecha de inicio'
                      : !tempEndDate
                        ? 'Seleccioná la fecha de fin'
                        : `${formatDisplayDate(tempStartDate)} - ${formatDisplayDate(tempEndDate)}`}
                  </p>
                )}
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-0 px-4">
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
                  const isStart = isDateSelected(dayInfo.year, dayInfo.month, dayInfo.day, 'start')
                  const isEnd = isDateSelected(dayInfo.year, dayInfo.month, dayInfo.day, 'end')
                  const inRange = isDateInRange(dayInfo.year, dayInfo.month, dayInfo.day)
                  const today = isToday(dayInfo.year, dayInfo.month, dayInfo.day)

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDayClick(dayInfo.year, dayInfo.month, dayInfo.day, dayInfo.isCurrentMonth)}
                      disabled={!dayInfo.isCurrentMonth}
                      className={`
                        aspect-square rounded-full flex items-center justify-center text-base font-medium transition-all relative
                        ${!dayInfo.isCurrentMonth ? 'text-gray-600 cursor-not-allowed' : 'text-white cursor-pointer'}
                        ${isStart ? 'bg-blue-600 text-white font-bold scale-110 z-10' : ''}
                        ${isEnd ? 'bg-gray-500 text-white font-bold scale-110 z-10' : ''}
                        ${inRange ? 'bg-gray-800/50' : ''}
                        ${today && !isStart && !isEnd ? 'bg-orange-500 text-white' : ''}
                        ${!isStart && !isEnd && !today && dayInfo.isCurrentMonth ? 'hover:bg-gray-800 active:scale-95' : ''}
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

