"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ExerciseItem } from "@/components/exercise-item"
import { AddExerciseDialog } from "@/components/add-exercise-dialog"
import { getWorkoutItems } from "@/app/actions"
import type { WorkoutItem } from "@/lib/db"

export function ExerciseList() {
  const [exercises, setExercises] = useState<WorkoutItem[]>([])
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 種目一覧を取得
  const fetchExercises = async () => {
    setIsLoading(true)
    try {
      const exercisesData = await getWorkoutItems()
      setExercises(exercisesData)
    } catch (error) {
      console.error("種目の取得に失敗しました:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchExercises()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">トレーニング種目管理</h1>
        <Button onClick={() => setShowAddExercise(true)}>
          <Plus className="mr-2 h-4 w-4" />
          種目を追加
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center py-8 text-muted-foreground">読み込み中...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((exercise) => (
            <ExerciseItem key={exercise.id} exercise={exercise} onUpdate={fetchExercises} />
          ))}

          {exercises.length === 0 && (
            <p className="col-span-full text-center py-8 text-muted-foreground">
              種目がありません。新しい種目を追加してください。
            </p>
          )}
        </div>
      )}

      <AddExerciseDialog open={showAddExercise} onOpenChange={setShowAddExercise} onSuccess={fetchExercises} />
    </div>
  )
}
