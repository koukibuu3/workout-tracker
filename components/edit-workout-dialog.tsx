"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getWorkoutItems,
  getWorkoutLogDetail,
  getWorkoutPlanDetail,
  updateWorkoutLog,
  updateWorkoutPlan,
} from "@/app/actions"
import type { WorkoutItem } from "@/lib/db"

interface EditWorkoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "log" | "plan"
  itemId: number
  onSuccess?: () => void
}

export function EditWorkoutDialog({ open, onOpenChange, type, itemId, onSuccess }: EditWorkoutDialogProps) {
  const [workoutItems, setWorkoutItems] = useState<WorkoutItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState<number>(0)
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(10)
  const [weight, setWeight] = useState(0)
  const [memo, setMemo] = useState("")
  const [time, setTime] = useState("18:00")
  const [repeatPattern, setRepeatPattern] = useState("none")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // データを取得
  useEffect(() => {
    const fetchData = async () => {
      if (!open || !itemId) return

      setIsLoading(true)
      try {
        // 種目一覧を取得
        const items = await getWorkoutItems()
        setWorkoutItems(items)

        // 詳細データを取得
        if (type === "log") {
          const log = await getWorkoutLogDetail(itemId)
          if (log) {
            setSelectedItemId(log.item_id)
            setSets(log.sets)
            setReps(log.reps)
            setWeight(log.weight)
            setMemo(log.memo || "")
          }
        } else {
          const plan = await getWorkoutPlanDetail(itemId)
          if (plan) {
            setSelectedItemId(plan.item_id)
            setSets(plan.sets)
            setReps(plan.reps)
            setWeight(plan.weight)
            setTime(plan.time || "18:00")
            setRepeatPattern(plan.repeat_pattern || "none")
          }
        }
      } catch (error) {
        console.error("データの取得に失敗しました:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [open, itemId, type])

  const handleSubmit = async () => {
    if (!selectedItemId) {
      alert("種目を選択してください")
      return
    }

    try {
      setIsSubmitting(true)

      if (type === "log") {
        await updateWorkoutLog(itemId, selectedItemId, sets, reps, weight, memo)
      } else {
        await updateWorkoutPlan(
          itemId,
          selectedItemId,
          sets,
          reps,
          weight,
          time,
          repeatPattern === "none" ? null : repeatPattern,
        )
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("更新に失敗しました:", error)
      alert("更新に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  const dialogTitle = type === "log" ? "トレーニング記録の編集" : "トレーニング予定の編集"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-6 text-center">読み込み中...</div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exercise">種目</Label>
              <Select value={selectedItemId.toString()} onValueChange={(value) => setSelectedItemId(Number(value))}>
                <SelectTrigger id="exercise">
                  <SelectValue placeholder="種目を選択">
                    {workoutItems.find((item) => item.id === selectedItemId)?.name || "種目を選択"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {workoutItems.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name} ({item.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sets">セット数</Label>
                <Input
                  id="sets"
                  type="number"
                  min="1"
                  value={sets}
                  onChange={(e) => setSets(Number.parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reps">回数</Label>
                <Input
                  id="reps"
                  type="number"
                  min="1"
                  value={reps}
                  onChange={(e) => setReps(Number.parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">重量 (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(Number.parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {type === "log" ? (
              <div className="space-y-2">
                <Label htmlFor="memo">メモ</Label>
                <Textarea id="memo" value={memo} onChange={(e) => setMemo(e.target.value)} />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="time">時間</Label>
                  <Input type="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repeat">繰り返し</Label>
                  <Select value={repeatPattern} onValueChange={setRepeatPattern}>
                    <SelectTrigger id="repeat">
                      <SelectValue placeholder="繰り返しなし" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">繰り返しなし</SelectItem>
                      <SelectItem value="daily">毎日</SelectItem>
                      <SelectItem value="weekly">毎週</SelectItem>
                      <SelectItem value="monthly">毎月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting || isLoading}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoading}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
