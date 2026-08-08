'use client'

import { useRef, useState } from 'react'
import { addMonths, startOfMonth } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { DayDetail } from '@/components/day-detail'
import { QuickAddWorkoutDrawer } from '@/components/quick-add-workout-drawer'
import { ja } from 'date-fns/locale'

type CalendarViewProps = {
  initialDate: string
}

export function CalendarView({ initialDate }: CalendarViewProps) {
  const [date, setDate] = useState(() => new Date(`${initialDate}T00:00:00`))
  const [month, setMonth] = useState(() => startOfMonth(new Date(`${initialDate}T00:00:00`)))
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const didSwipe = useRef(false)

  const selectDate = (nextDate: Date | undefined) => {
    if (!nextDate) return
    setDate(nextDate)
    setMonth(startOfMonth(nextDate))
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
    didSwipe.current = false
  }

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current
    const touch = event.changedTouches[0]
    touchStart.current = null

    if (!start || !touch) return

    const horizontalDistance = touch.clientX - start.x
    const verticalDistance = touch.clientY - start.y
    const minimumSwipeDistance = 50

    if (
      Math.abs(horizontalDistance) < minimumSwipeDistance ||
      Math.abs(horizontalDistance) <= Math.abs(verticalDistance)
    ) {
      return
    }

    didSwipe.current = true
    setMonth((currentMonth) => addMonths(currentMonth, horizontalDistance < 0 ? 1 : -1))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card>
        <CardContent className="p-0">
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClickCapture={(event) => {
              if (!didSwipe.current) return
              event.preventDefault()
              event.stopPropagation()
              didSwipe.current = false
            }}
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={selectDate}
              month={month}
              onMonthChange={setMonth}
              locale={ja}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <DayDetail key={`${date.toISOString()}-${refreshKey}`} date={date} onAdd={() => setShowQuickAdd(true)} />
        </CardContent>
      </Card>

      <QuickAddWorkoutDrawer
        date={date}
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
        onSuccess={() => setRefreshKey((current) => current + 1)}
      />
    </div>
  )
}
