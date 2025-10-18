'use client'

import { useState, useEffect } from 'react'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'

interface CalendarProps {
  reservations?: { [key: string]: number } // día: cantidad de reservas
  onDayClick?: (day: number) => void
}

export default function Calendar({ reservations = {}, onDayClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]

  const dayNames = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

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
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      })
    }

    // Días del mes actual
    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      
      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        isSelected: selectedDay === day,
        hasReservations: reservations[day] > 0,
      })
    }

    // Días del próximo mes
    const remainingDays = 42 - days.length // 6 semanas
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      })
    }

    return days
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    setSelectedDay(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    setSelectedDay(null)
  }

  const handleDayClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return
    setSelectedDay(day)
    if (onDayClick) {
      onDayClick(day)
    }
  }

  const days = getDaysInMonth(currentDate)
  const monthName = monthNames[currentDate.getMonth()]

  if (!mounted) {
    return (
      <div className="bg-black text-white h-[45vh] flex flex-col">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black text-white h-[45vh] flex flex-col">
      {/* Header con navegación del mes */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-900 rounded-full transition-colors"
        >
          <IoChevronBack className="text-xl" />
        </button>
        <h2 className="text-lg font-medium">{monthName}</h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-900 rounded-full transition-colors"
        >
          <IoChevronForward className="text-xl" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-0 px-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7 gap-0 px-2 flex-1">
        {days.map((dayInfo, index) => (
          <div
            key={index}
            className="flex items-center justify-center relative"
          >
            <button
              onClick={() => handleDayClick(dayInfo.day, dayInfo.isCurrentMonth)}
              disabled={!dayInfo.isCurrentMonth}
              className={`w-10 h-10 rounded-full flex flex-col items-center justify-center relative transition-colors
                ${dayInfo.isCurrentMonth ? 'text-white' : 'text-gray-600'}
                ${dayInfo.isToday ? 'bg-orange-500 text-white' : ''}
                ${dayInfo.isSelected ? 'bg-blue-600 text-white' : ''}
                ${!dayInfo.isToday && !dayInfo.isSelected && dayInfo.isCurrentMonth ? 'active:bg-gray-900' : ''}
                ${!dayInfo.isCurrentMonth ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <span className="text-sm">{dayInfo.day}</span>
              {/* Indicador de reservas - Azul = check-in, Gris = check-out */}
              {dayInfo.hasReservations && !dayInfo.isSelected && !dayInfo.isToday && (
                <div className="absolute bottom-1 flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                  <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                </div>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

