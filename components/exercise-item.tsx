"use client"

import { useState } from "react"
import { Dumbbell, MoreVertical, Video } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { EditExerciseDialog } from "@/components/edit-exercise-dialog"
import { VideoDialog } from "@/components/video-dialog"
import { deleteExercise } from "@/app/actions"
import type { WorkoutItem } from "@/lib/db"

interface ExerciseItemProps {
  exercise: WorkoutItem
  onUpdate?: () => void
}

export function ExerciseItem({ exercise, onUpdate }: ExerciseItemProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm(`「${exercise.name}」を削除してもよろしいですか？`)) {
      try {
        setIsDeleting(true)
        await deleteExercise(exercise.id)
        onUpdate?.()
      } catch (error) {
        console.error("削除に失敗しました:", error)
        alert("削除に失敗しました")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <Dumbbell className="h-5 w-5 mr-2 text-primary" />
              {exercise.name}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isDeleting}>
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">メニュー</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>編集</DropdownMenuItem>
                {exercise.video_url && (
                  <DropdownMenuItem onClick={() => setShowVideoDialog(true)}>動画を見る</DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-destructive" onClick={handleDelete} disabled={isDeleting}>
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Badge variant="outline">{exercise.category}</Badge>
            {exercise.video_url && (
              <div
                className="flex items-center mt-2 text-sm text-blue-600 cursor-pointer"
                onClick={() => setShowVideoDialog(true)}
              >
                <Video className="h-4 w-4 mr-1" />
                <span>動画あり</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditExerciseDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        exercise={exercise}
        onSuccess={onUpdate}
      />

      {exercise.video_url && (
        <VideoDialog
          open={showVideoDialog}
          onOpenChange={setShowVideoDialog}
          videoUrl={exercise.video_url}
          title={exercise.name}
        />
      )}
    </>
  )
}
