"use client"

import { useState } from "react"
import { Calendar, Clock, MoreVertical, Video } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteWorkoutPlan, savePlanAsLog } from "@/app/actions"
import { EditWorkoutDialog } from "@/components/edit-workout-dialog"
import { VideoDialog } from "@/components/video-dialog"
import { format } from "date-fns"
import type { WorkoutPlan } from "@/lib/db"

interface WorkoutPlanItemProps {
  plan: WorkoutPlan & { video_url?: string }
  onUpdate?: () => void
}

export function WorkoutPlanItem({ plan, onUpdate }: WorkoutPlanItemProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingAsLog, setIsSavingAsLog] = useState(false)

  // 時間のフォーマット
  const formattedTime = plan.time
    ? new Date(`2000-01-01T${plan.time}`).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "時間未設定"

  const handleDelete = async () => {
    if (confirm("この予定を削除してもよろしいですか？")) {
      try {
        setIsDeleting(true)
        await deleteWorkoutPlan(plan.id)
        onUpdate?.()
      } catch (error) {
        console.error("削除に失敗しました:", error)
        alert("削除に失敗しました")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleSaveAsLog = async () => {
    try {
      setIsSavingAsLog(true)
      // 現在の日付を使用
      const today = format(new Date(), "yyyy-MM-dd")
      await savePlanAsLog(plan.id, today)
      alert("記録として保存しました")
      onUpdate?.()
    } catch (error) {
      console.error("記録の保存に失敗しました:", error)
      alert("記録の保存に失敗しました")
    } finally {
      setIsSavingAsLog(false)
    }
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-medium">{plan.item_name}</h3>
              </div>
              <div className="flex items-center mt-1">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{formattedTime}</p>
              </div>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  {plan.sets}セット × {plan.reps}回 ({plan.weight}kg)
                </p>
                {plan.repeat_pattern && (
                  <p className="text-xs text-muted-foreground mt-1">
                    繰り返し:{" "}
                    {plan.repeat_pattern === "daily"
                      ? "毎日"
                      : plan.repeat_pattern === "weekly"
                        ? "毎週"
                        : plan.repeat_pattern === "monthly"
                          ? "毎月"
                          : ""}
                  </p>
                )}
                {plan.video_url && (
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
                <Button variant="ghost" size="icon" disabled={isDeleting || isSavingAsLog}>
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">メニュー</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>編集</DropdownMenuItem>
                {plan.video_url && (
                  <DropdownMenuItem onClick={() => setShowVideoDialog(true)}>動画を見る</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSaveAsLog} disabled={isSavingAsLog}>
                  記録として保存
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
        type="plan"
        itemId={plan.id}
        onSuccess={onUpdate}
      />

      {plan.video_url && (
        <VideoDialog
          open={showVideoDialog}
          onOpenChange={setShowVideoDialog}
          videoUrl={plan.video_url}
          title={plan.item_name || "トレーニング動画"}
        />
      )}
    </>
  )
}
