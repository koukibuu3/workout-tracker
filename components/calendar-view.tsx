'use client'

import { useEffect, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { DayDetail } from '@/components/day-detail'
import { QuickAddWorkoutDrawer } from '@/components/quick-add-workout-drawer'
import { ja } from 'date-fns/locale'
import { getCalendarDayStatuses } from '@/app/actions'

type CalendarDayStatuses = Record<string, { hasPlan: boolean; logCount: number }>

type CalendarViewProps = {
  initialDate: string
}

export function CalendarView({ initialDate }: CalendarViewProps) {
  const [date, setDate] = useState(() => new Date(`${initialDate}T00:00:00`))
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [month, setMonth] = useState(date)
  const [dayStatuses, setDayStatuses] = useState<CalendarDayStatuses>({})

  useEffect(() => {
    const loadDayStatuses = async () => {
      try {
        const statuses = await getCalendarDayStatuses(month.getFullYear(), month.getMonth() + 1)
        setDayStatuses(statuses)
      } catch (error) {
        console.error('カレンダーの状態取得に失敗しました:', error)
        setDayStatuses({})
      }
    }

    loadDayStatuses()
  }, [month, refreshKey])

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
            month={month}
            onMonthChange={setMonth}
            dayStatuses={dayStatuses}
            locale={ja}
            className="w-full"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <DayDetail
            key={`${date.toISOString()}-${refreshKey}`}
            date={date}
            onAdd={() => setShowQuickAdd(true)}
            onDataChange={() => setRefreshKey((current) => current + 1)}
          />
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
