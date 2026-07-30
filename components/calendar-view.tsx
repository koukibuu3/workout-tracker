'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DayDetail } from '@/components/day-detail'
import { QuickAddWorkoutDrawer } from '@/components/quick-add-workout-drawer'
import { ja } from 'date-fns/locale'

export function CalendarView() {
  const [date, setDate] = useState(new Date())
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const selectDate = (nextDate: Date | undefined) => {
    if (!nextDate) return
    setDate(nextDate)
    setShowQuickAdd(true)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">予定と記録を、ひとつの場所で</p>
          <h1 className="text-2xl font-bold tracking-tight">カレンダー</h1>
        </div>
        <Button className="shrink-0" onClick={() => setShowQuickAdd(true)}>
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
      </div>

      <Card>
        <CardContent className="flex justify-center p-2 sm:p-4">
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
