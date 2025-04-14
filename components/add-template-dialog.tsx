"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WorkoutExerciseForm } from "@/components/workout-exercise-form"
import { getWorkoutItems, saveAsTemplate } from "@/app/actions"
import type { WorkoutItem } from "@/lib/db"

interface AddTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddTemplateDialog({ open, onOpenChange, onSuccess }: AddTemplateDialogProps) {
  const [name, setName] = useState("")
  const [exercises, setExercises] = useState([{ id: 1, itemId: 0, name: "", sets: 3, reps: 10, weight: 0 }])
  const [workoutItems, setWorkoutItems] = useState<WorkoutItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 種目一覧を取得
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemsData = await getWorkoutItems()
        setWorkoutItems(itemsData)
      } catch (error) {
        console.error("種目の取得に失敗しました:", error)
      }
    }

    if (open) {
      fetchItems()
    }
  }, [open])

  // ダイアログが閉じられたときにフォームをリセット
  useEffect(() => {
    if (!open) {
      setName("")
      setExercises([{ id: 1, itemId: 0, name: "", sets: 3, reps: 10, weight: 0 }])
    }
  }, [open])

  const addExercise = () => {
    const newId = exercises.length > 0 ? Math.max(...exercises.map((e) => e.id)) + 1 : 1
    setExercises([...exercises, { id: newId, itemId: 0, name: "", sets: 3, reps: 10, weight: 0 }])
  }

  const removeExercise = (id: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((e) => e.id !== id))
    }
  }

  const updateExercise = (id: number, field: string, value: any) => {
    setExercises((prevExercises) => prevExercises.map((e) => (e.id === id ? { ...e, [field]: value } : e)))
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("テンプレート名を入力してください")
      return
    }

    const invalidExercises = exercises.filter((e) => !e.itemId)
    if (invalidExercises.length > 0) {
      alert("すべての種目を選択してください")
      return
    }

    try {
      setIsSubmitting(true)

      // 各種目をテンプレートとして保存
      for (const exercise of exercises) {
        await saveAsTemplate(exercise.itemId, exercise.sets, exercise.reps, exercise.weight)
      }

      // 成功時の処理
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("テンプレートの保存に失敗しました:", error)
      alert("テンプレートの保存に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>テンプレートの追加</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">テンプレート名</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 胸トレーニング"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>トレーニング種目</Label>
              <Button type="button" variant="outline" size="sm" onClick={addExercise}>
                種目を追加
              </Button>
            </div>

            <div className="space-y-4">
              {exercises.map((exercise) => (
                <WorkoutExerciseForm
                  key={exercise.id}
                  exercise={exercise}
                  workoutItems={workoutItems}
                  onChange={updateExercise}
                  onRemove={removeExercise}
                  showRemove={exercises.length > 1}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
