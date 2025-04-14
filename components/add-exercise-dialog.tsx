'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { addExercise } from '@/app/actions'

interface AddExerciseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddExerciseDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddExerciseDialogProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // カテゴリーの選択肢
  const categories = [
    '胸',
    '背中',
    '肩',
    '腕',
    '脚',
    '尻',
    '腹筋',
    '有酸素',
    'その他',
  ]

  // ダイアログが閉じられたときにフォームをリセット
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName('')
      setCategory('')
      setVideoUrl('')
    }
    onOpenChange(open)
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('種目名を入力してください')
      return
    }

    if (!category) {
      alert('カテゴリーを選択してください')
      return
    }

    try {
      setIsSubmitting(true)
      await addExercise(name, category, videoUrl)
      onSuccess?.()
      handleOpenChange(false)
    } catch (error) {
      console.error('種目の追加に失敗しました:', error)
      alert('種目の追加に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>種目の追加</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">種目名</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: ベンチプレス"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">カテゴリー</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
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
            <Label htmlFor="video-url">動画URL（任意）</Label>
            <Input
              id="video-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="例: https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-muted-foreground">
              YouTubeやVimeoなどの動画URLを入力してください
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
