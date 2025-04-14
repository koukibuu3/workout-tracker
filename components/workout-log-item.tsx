"use client"

import { useState } from "react"
import { Dumbbell, MoreVertical, Video } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteWorkoutLog, saveLogAsTemplate } from "@/app/actions"
import { EditWorkoutDialog } from "@/components/edit-workout-dialog"
import { VideoDialog } from "@/components/video-dialog"
import type { WorkoutLog } from "@/lib/db"

interface WorkoutLogItemProps {
  log: WorkoutLog & { video_url?: string }
  onUpdate?: () => void
}

export function WorkoutLogItem({ log, onUpdate }: WorkoutLogItemProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)

  const handleDelete = async () => {
    if (confirm("この記録を削除してもよろしいですか？")) {
      try {
        setIsDeleting(true)
        await deleteWorkoutLog(log.id)
        onUpdate?.()
      } catch (error) {
        console.error("削除に失敗しました:", error)
        alert("削除に失敗しました")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleSaveAsTemplate = async () => {
    try {
      setIsSavingTemplate(true)
      await saveLogAsTemplate(log.id)
      alert("テンプレートとして保存しました")
    } catch (error) {
      console.error("テンプレートの保存に失敗しました:", error)
      alert("テンプレートの保存に失敗しました")
    } finally {
      setIsSavingTemplate(false)
    }
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Dumbbell className="h-5 w-5 mr-2 text-primary" />
              <div>
                <h3 className="font-medium">{log.item_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {log.sets}セット × {log.reps}回 ({log.weight}kg)
                </p>
                {log.memo && <p className="text-sm mt-1 text-muted-foreground">{log.memo}</p>}
                {log.video_url && (
                  <div
                    className="flex items-center mt-1 text-sm text-blue-600 cursor-pointer"
                    onClick={() => setShowVideoDialog(true)}
                  >
                    <Video className="h-4 w-4 mr-1" />
                    <span>動画を見る</span>
                  </div>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isDeleting || isSavingTemplate}>
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">メニュー</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>編集</DropdownMenuItem>
                {log.video_url && (
                  <DropdownMenuItem onClick={() => setShowVideoDialog(true)}>動画を見る</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSaveAsTemplate} disabled={isSavingTemplate}>
                  テンプレートとして保存
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={handleDelete} disabled={isDeleting}>
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <EditWorkoutDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        type="log"
        itemId={log.id}
        onSuccess={onUpdate}
      />

      {log.video_url && (
        <VideoDialog
          open={showVideoDialog}
          onOpenChange={setShowVideoDialog}
          videoUrl={log.video_url}
          title={log.item_name || "トレーニング動画"}
        />
      )}
    </>
  )
}
