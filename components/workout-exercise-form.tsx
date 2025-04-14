"use client"

import { Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WorkoutItem } from "@/lib/db"

interface WorkoutExerciseFormProps {
  exercise: {
    id: number
    itemId: number
    name: string
    sets: number
    reps: number
    weight: number
  }
  workoutItems: WorkoutItem[]
  onChange: (id: number, field: string, value: any) => void
  onRemove: (id: number) => void
  showRemove: boolean
}

export function WorkoutExerciseForm({
  exercise,
  workoutItems,
  onChange,
  onRemove,
  showRemove,
}: WorkoutExerciseFormProps) {
  // 種目選択時の処理
  const handleItemSelect = (itemId: string) => {
    const item = workoutItems.find((i) => i.id.toString() === itemId)
    if (item) {
      onChange(exercise.id, "itemId", item.id)
      onChange(exercise.id, "name", item.name)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <Label htmlFor={`exercise-${exercise.id}`}>種目</Label>
              <Select value={exercise.itemId ? exercise.itemId.toString() : undefined} onValueChange={handleItemSelect}>
                <SelectTrigger id={`exercise-${exercise.id}`}>
                  <SelectValue placeholder="種目を選択">{exercise.name || "種目を選択"}</SelectValue>
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
            {showRemove && (
              <Button type="button" variant="ghost" size="icon" className="mt-6" onClick={() => onRemove(exercise.id)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">削除</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`sets-${exercise.id}`}>セット数</Label>
              <Input
                id={`sets-${exercise.id}`}
                type="number"
                min="1"
                value={exercise.sets}
                onChange={(e) => onChange(exercise.id, "sets", Number.parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`reps-${exercise.id}`}>回数</Label>
              <Input
                id={`reps-${exercise.id}`}
                type="number"
                min="1"
                value={exercise.reps}
                onChange={(e) => onChange(exercise.id, "reps", Number.parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`weight-${exercise.id}`}>重量 (kg)</Label>
              <Input
                id={`weight-${exercise.id}`}
                type="number"
                min="0"
                step="0.5"
                value={exercise.weight}
                onChange={(e) => onChange(exercise.id, "weight", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
