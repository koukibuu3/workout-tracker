'use client'

import { useState } from 'react'
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
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const selectDate = (nextDate: Date | undefined) => {
    if (!nextDate) return
    setDate(nextDate)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card>
        <CardContent className="p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={selectDate}
            locale={ja}
            className="w-full"
          />
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
