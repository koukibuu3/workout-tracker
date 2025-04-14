"use client"

import { useState } from "react"
import { Dumbbell, MoreVertical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteTemplate } from "@/app/actions"
import { AddWorkoutDialog } from "@/components/add-workout-dialog"

interface TemplateItemProps {
  template: {
    id: number
    name: string
    exercises: {
      id: number
      name: string
      sets: number
      reps: number
      weight: number
    }[]
  }
  onUpdate?: () => void
}

export function TemplateItem({ template, onUpdate }: TemplateItemProps) {
  const [showAddWorkoutDialog, setShowAddWorkoutDialog] = useState(false)
  const [workoutMode, setWorkoutMode] = useState<"log" | "plan">("log")
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm(`「${template.name}」テンプレートを削除してもよろしいですか？`)) {
      try {
        setIsDeleting(true)
        // テンプレート内の各エクササイズを削除
        for (const exercise of template.exercises) {
          await deleteTemplate(exercise.id)
        }
        onUpdate?.()
      } catch (error) {
        console.error("テンプレートの削除に失敗しました:", error)
        alert("テンプレートの削除に失敗しました")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleAddAsLog = () => {
    setWorkoutMode("log")
    setShowAddWorkoutDialog(true)
  }

  const handleAddAsPlan = () => {
    setWorkoutMode("plan")
    setShowAddWorkoutDialog(true)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <Dumbbell className="h-5 w-5 mr-2 text-primary" />
              {template.name}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isDeleting}>
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">メニュー</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleAddAsLog}>記録として追加</DropdownMenuItem>
                <DropdownMenuItem onClick={handleAddAsPlan}>予定として追加</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={handleDelete} disabled={isDeleting}>
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {template.exercises.map((exercise) => (
              <div key={exercise.id} className="text-sm">
                <p className="font-medium">{exercise.name}</p>
                <p className="text-muted-foreground">
                  {exercise.sets}セット × {exercise.reps}回 ({exercise.weight}kg)
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AddWorkoutDialog
        open={showAddWorkoutDialog}
        onOpenChange={setShowAddWorkoutDialog}
        mode={workoutMode}
        date={new Date()}
        initialTemplate={template.id.toString()}
        onSuccess={onUpdate}
      />
    </>
  )
}
