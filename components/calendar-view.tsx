"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DayDetail } from "@/components/day-detail"
import { AddWorkoutDialog } from "@/components/add-workout-dialog"
import { ja } from "date-fns/locale"

export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [showAddWorkout, setShowAddWorkout] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">トレーニングカレンダー</h1>
        <Button onClick={() => setShowAddWorkout(true)}>
          <Plus className="mr-2 h-4 w-4" />
          トレーニングを追加
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <Calendar mode="single" selected={date} onSelect={setDate} locale={ja} className="rounded-md border" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">{date && <DayDetail date={date} />}</CardContent>
        </Card>
      </div>

      <AddWorkoutDialog open={showAddWorkout} onOpenChange={setShowAddWorkout} />
    </div>
  )
}
