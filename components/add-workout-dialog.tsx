"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WorkoutExerciseForm } from "@/components/workout-exercise-form"
import { getWorkoutItems, addWorkoutLog, addWorkoutPlan, getWorkoutTemplates } from "@/app/actions"
import type { WorkoutItem, WorkoutTemplate } from "@/lib/db"

interface AddWorkoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "log" | "plan"
  date?: Date
  initialTemplate?: string
  onSuccess?: () => void
}

export function AddWorkoutDialog({
  open,
  onOpenChange,
  mode = "log",
  date = new Date(),
  initialTemplate,
  onSuccess,
}: AddWorkoutDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("new")
  const [exercises, setExercises] = useState([{ id: 1, itemId: 0, name: "", sets: 3, reps: 10, weight: 0 }])
  const [memo, setMemo] = useState("")
  const [time, setTime] = useState("18:00")
  const [repeatPattern, setRepeatPattern] = useState("none")
  const [workoutItems, setWorkoutItems] = useState<WorkoutItem[]>([])
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formattedDate = format(date, "yyyy年MM月dd日 (eee)", { locale: ja })
  const dateString = format(date, "yyyy-MM-dd")
  const dialogTitle = mode === "log" ? "トレーニング記録の追加" : "トレーニング予定の追加"

  // 種目一覧とテンプレートを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, templatesData] = await Promise.all([getWorkoutItems(), getWorkoutTemplates()])
        setWorkoutItems(itemsData)
        setTemplates(templatesData)

        // 初期テンプレートが指定されている場合
        if (initialTemplate) {
          setActiveTab("template")
          setSelectedTemplate(initialTemplate)
          const template = templatesData.find((t) => t.id.toString() === initialTemplate)
          if (template && template.exercises.length > 0) {
            const templateExercises = template.exercises.map((ex, index) => ({
              id: index + 1,
              itemId: itemsData.find((item) => item.name === ex.name)?.id || 0,
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
            }))
            setExercises(templateExercises)
          }
        }
      } catch (error) {
        console.error("データの取得に失敗しました:", error)
      }
    }

    if (open) {
      fetchData()
    }
  }, [open, initialTemplate])

  // ダイアログが閉じられたときにフォームをリセット
  useEffect(() => {
    if (!open) {
      setExercises([{ id: 1, itemId: 0, name: "", sets: 3, reps: 10, weight: 0 }])
      setMemo("")
      setTime("18:00")
      setRepeatPattern("none")
      setSelectedTemplate("")
      setActiveTab("new")
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

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates.find((t) => t.id.toString() === templateId)
    if (template && template.exercises.length > 0) {
      // テンプレートの種目を設定
      const templateExercises = template.exercises.map((ex, index) => ({
        id: index + 1,
        itemId: workoutItems.find((item) => item.name === ex.name)?.id || 0,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
      }))
      setExercises(templateExercises)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      if (activeTab === "new") {
        // 新規作成の場合
        for (const exercise of exercises) {
          if (!exercise.itemId) {
            alert("種目を選択してください")
            return
          }

          if (mode === "log") {
            await addWorkoutLog(dateString, exercise.itemId, exercise.sets, exercise.reps, exercise.weight, memo)
          } else {
            await addWorkoutPlan(
              dateString,
              exercise.itemId,
              exercise.sets,
              exercise.reps,
              exercise.weight,
              time,
              repeatPattern === "none" ? null : repeatPattern,
            )
          }
        }
      } else {
        // テンプレート使用の場合
        if (!selectedTemplate) {
          alert("テンプレートを選択してください")
          return
        }

        for (const exercise of exercises) {
          if (mode === "log") {
            await addWorkoutLog(dateString, exercise.itemId, exercise.sets, exercise.reps, exercise.weight, memo)
          } else {
            await addWorkoutPlan(
              dateString,
              exercise.itemId,
              exercise.sets,
              exercise.reps,
              exercise.weight,
              time,
              repeatPattern === "none" ? null : repeatPattern,
            )
          }
        }
      }

      // 成功時の処理
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("保存に失敗しました:", error)
      alert("保存に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">{formattedDate}</p>

          <Tabs defaultValue="new" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">新規作成</TabsTrigger>
              <TabsTrigger value="template">テンプレート</TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-4 mt-4">
              {mode === "plan" && (
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              )}

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

              {mode === "log" && (
                <div className="space-y-2">
                  <Label htmlFor="memo">メモ</Label>
                  <Textarea
                    id="memo"
                    placeholder="トレーニングのメモを入力"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="template" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="template">テンプレート選択</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="テンプレートを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {mode === "plan" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time-template">時間</Label>
                    <Input type="time" id="time-template" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="repeat-template">繰り返し</Label>
                    <Select value={repeatPattern} onValueChange={setRepeatPattern}>
                      <SelectTrigger id="repeat-template">
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
                </div>
              )}

              {mode === "log" && (
                <div className="space-y-2">
                  <Label htmlFor="memo-template">メモ</Label>
                  <Textarea
                    id="memo-template"
                    placeholder="トレーニングのメモを入力"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
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
