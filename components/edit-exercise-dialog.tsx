"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateExercise } from "@/app/actions"
import type { WorkoutItem } from "@/lib/db"

interface EditExerciseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise: WorkoutItem
  onSuccess?: () => void
}

export function EditExerciseDialog({ open, onOpenChange, exercise, onSuccess }: EditExerciseDialogProps) {
  const [name, setName] = useState(exercise.name)
  const [category, setCategory] = useState(exercise.category)
  const [videoUrl, setVideoUrl] = useState(exercise.video_url || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // カテゴリーの選択肢
  const categories = ["胸", "背中", "肩", "腕", "脚", "腹筋", "有酸素", "その他"]

  // 種目データが変更されたときにフォームを更新
  useEffect(() => {
    if (open) {
      setName(exercise.name)
      setCategory(exercise.category)
      setVideoUrl(exercise.video_url || "")
    }
  }, [open, exercise])

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("種目名を入力してください")
      return
    }

    if (!category) {
      alert("カテゴリーを選択してください")
      return
    }

    try {
      setIsSubmitting(true)
      await updateExercise(exercise.id, name, category, videoUrl)
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("種目の更新に失敗しました:", error)
      alert("種目の更新に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>種目の編集</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">種目名</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">カテゴリー</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="edit-category">
                <SelectValue placeholder="カテゴリーを選択" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-video-url">動画URL（任意）</Label>
            <Input
              id="edit-video-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="例: https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-muted-foreground">YouTubeやVimeoなどの動画URLを入力してください</p>
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
