"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Plus } from "lucide-react"
import { getWorkoutLogsByDate, getWorkoutPlansByDate } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { SimpleWorkoutItem } from "@/components/simple-workout-item"
import type { WorkoutLog, WorkoutPlan } from "@/lib/db"

interface DayDetailProps {
  date: Date
  onAdd: () => void
}

export function DayDetail({ date, onAdd }: DayDetailProps) {
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const formattedDate = format(date, "M月d日（eee）", { locale: ja })
  const dateString = format(date, "yyyy-MM-dd")

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [logsData, plansData] = await Promise.all([
        getWorkoutLogsByDate(dateString),
        getWorkoutPlansByDate(dateString),
      ])
      setLogs(logsData)
      setPlans(plansData)
    } catch (error) {
      console.error("データの取得に失敗しました:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateString])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{formattedDate}</h2>
        <Button className="h-8" onClick={onAdd} size="sm" variant="outline"><Plus className="mr-1 h-4 w-4" />追加</Button>
      </div>

      {isLoading ? <p className="py-5 text-center text-sm text-muted-foreground">読み込み中...</p> : (
        <>
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">予定 {plans.length > 0 && <span className="text-muted-foreground">{plans.length}</span>}</h3>
            {plans.length > 0 ? plans.map((plan) => <SimpleWorkoutItem date={dateString} key={plan.id} onUpdate={fetchData} plan={plan} />) : <p className="py-2 text-sm text-muted-foreground">予定はありません</p>}
          </section>
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">記録 {logs.length > 0 && <span className="text-muted-foreground">{logs.length}</span>}</h3>
            {logs.length > 0 ? logs.map((log) => <SimpleWorkoutItem key={log.id} log={log} onUpdate={fetchData} />) : <p className="py-2 text-sm text-muted-foreground">記録はありません</p>}
          </section>
        </>
      )}
    </div>
  )
}
