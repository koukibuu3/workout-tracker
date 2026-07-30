"use client"

import { useState } from "react"
import { Check, MoreHorizontal, Trash2 } from "lucide-react"
import { deleteWorkoutLog, deleteWorkoutPlan, savePlanAsLog } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { WorkoutLog, WorkoutPlan } from "@/lib/db"

type SimpleWorkoutItemProps = {
  log?: WorkoutLog
  plan?: WorkoutPlan
  date?: string
  onUpdate: () => void
}

export function SimpleWorkoutItem({ log, plan, date, onUpdate }: SimpleWorkoutItemProps) {
  const [isWorking, setIsWorking] = useState(false)
  const entry = log || plan
  if (!entry) return null

  const details = [
    entry.sets && entry.sets > 0 ? `${entry.sets}セット` : null,
    entry.reps && entry.reps > 0 ? `${entry.reps}回` : null,
    entry?.weight && entry.weight > 0 ? `${entry.weight}kg` : null,
  ].filter(Boolean).join(" × ")

  const remove = async () => {
    if (!entry || !confirm(`${log ? "記録" : "予定"}を削除しますか？`)) return
    try {
      setIsWorking(true)
      if (log) await deleteWorkoutLog(entry.id)
      if (plan) await deleteWorkoutPlan(entry.id)
      onUpdate()
    } finally {
      setIsWorking(false)
    }
  }

  const completePlan = async () => {
    if (!plan || !date) return
    try {
      setIsWorking(true)
      await savePlanAsLog(plan.id, date)
      onUpdate()
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center gap-3 p-3">
        <span className={`h-9 w-1 rounded-full ${plan ? "bg-violet-500" : "bg-emerald-500"}`} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{entry.item_name || "名称なし"}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{plan?.time || details || (plan ? "時間・詳細なし" : "詳細なし")}</p>
          {log?.memo && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{log.memo}</p>}
        </div>
        {plan && <Button aria-label="予定を記録として追加" disabled={isWorking} onClick={completePlan} size="icon" title="記録として追加" variant="ghost"><Check className="h-4 w-4" /></Button>}
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button aria-label="操作メニュー" disabled={isWorking} size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end"><DropdownMenuItem className="text-destructive" onClick={remove}><Trash2 className="mr-2 h-4 w-4" />削除</DropdownMenuItem></DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}
