"use client"

import { useEffect, useLayoutEffect, useState } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { CalendarClock, ClipboardCheck } from "lucide-react"
import { addSimpleWorkout } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type WorkoutType = "log" | "plan"

type QuickAddWorkoutDrawerProps = {
  date: Date
  open: boolean
  onOpenChange: (open: boolean) => void
  initialType?: WorkoutType
  onSuccess?: () => void
}

const asOptionalNumber = (value: string) => (value.trim() ? Number(value) : null)

type KeyboardViewport = {
  bottom: number
  height: number | null
}

const CLOSED_KEYBOARD_VIEWPORT: KeyboardViewport = { bottom: 0, height: null }
const KEYBOARD_HEIGHT_THRESHOLD = 100

function getKeyboardViewport(): KeyboardViewport {
  const viewport = window.visualViewport
  if (!viewport) return CLOSED_KEYBOARD_VIEWPORT

  const keyboardHeight = Math.max(
    0,
    window.innerHeight - (viewport.height + viewport.offsetTop),
  )

  return keyboardHeight >= KEYBOARD_HEIGHT_THRESHOLD
    ? { bottom: keyboardHeight, height: viewport.height }
    : CLOSED_KEYBOARD_VIEWPORT
}

export function QuickAddWorkoutDrawer({
  date,
  open,
  onOpenChange,
  initialType = "log",
  onSuccess,
}: QuickAddWorkoutDrawerProps) {
  const [type, setType] = useState<WorkoutType>(initialType)
  const [name, setName] = useState("")
  const [showDetails, setShowDetails] = useState(false)
  const [sets, setSets] = useState("")
  const [reps, setReps] = useState("")
  const [weight, setWeight] = useState("")
  const [memo, setMemo] = useState("")
  const [time, setTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [keyboardViewport, setKeyboardViewport] = useState<KeyboardViewport>(
    CLOSED_KEYBOARD_VIEWPORT,
  )

  useEffect(() => {
    if (!open) {
      setType(initialType)
      setName("")
      setShowDetails(false)
      setSets("")
      setReps("")
      setWeight("")
      setMemo("")
      setTime("")
    }
  }, [initialType, open])

  useLayoutEffect(() => {
    if (!open) {
      setKeyboardViewport(CLOSED_KEYBOARD_VIEWPORT)
      return
    }

    const updateKeyboardViewport = () => {
      setKeyboardViewport(getKeyboardViewport())
    }

    const viewport = window.visualViewport
    updateKeyboardViewport()
    viewport?.addEventListener("resize", updateKeyboardViewport)
    viewport?.addEventListener("scroll", updateKeyboardViewport)

    return () => {
      viewport?.removeEventListener("resize", updateKeyboardViewport)
      viewport?.removeEventListener("scroll", updateKeyboardViewport)
    }
  }, [open])

  const submit = async () => {
    if (!name.trim()) {
      alert(type === "log" ? "何をしたか入力してください" : "予定の内容を入力してください")
      return
    }

    try {
      setIsSubmitting(true)
      await addSimpleWorkout({
        date: format(date, "yyyy-MM-dd"),
        type,
        name,
        sets: asOptionalNumber(sets),
        reps: asOptionalNumber(reps),
        weight: asOptionalNumber(weight),
        memo,
        time,
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("保存に失敗しました:", error)
      alert("保存に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formattedDate = format(date, "M月d日（eee）", { locale: ja })
  const prompt = type === "log" ? "何をしましたか？" : "どんな予定ですか？"

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent
        className="mx-auto max-w-2xl"
        style={
          keyboardViewport.height
            ? {
                bottom: `${keyboardViewport.bottom}px`,
                maxHeight: `${keyboardViewport.height}px`,
              }
            : undefined
        }
      >
        <DrawerHeader className="pb-2 text-left">
          <DrawerDescription>{formattedDate}</DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 overflow-y-auto px-4 pb-2">
          <div aria-label="追加する内容" className="grid grid-cols-2 rounded-lg bg-muted p-1" role="tablist">
            <Button
              aria-selected={type === "log"}
              className={type === "log" ? "h-11 bg-primary font-semibold !text-primary-foreground shadow-sm hover:bg-primary/90 hover:!text-primary-foreground" : "h-11 text-muted-foreground hover:bg-background/70 hover:text-foreground"}
              onClick={() => setType("log")}
              role="tab"
              type="button"
              variant="ghost"
            >
              <ClipboardCheck className="mr-2 h-4 w-4" />
              記録を追加
            </Button>
            <Button
              aria-selected={type === "plan"}
              className={type === "plan" ? "h-11 bg-primary font-semibold !text-primary-foreground shadow-sm hover:bg-primary/90 hover:!text-primary-foreground" : "h-11 text-muted-foreground hover:bg-background/70 hover:text-foreground"}
              onClick={() => setType("plan")}
              role="tab"
              type="button"
              variant="ghost"
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              予定を追加
            </Button>
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="quick-workout-name">{prompt}</Label>
            <Input
              id="quick-workout-name"
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={type === "log" ? "例：スクワット" : "例：ジムに行く"}
            />
          </div>

          {!showDetails ? (
            <Button className="mt-3 px-0" type="button" variant="link" onClick={() => setShowDetails(true)}>
              ＋ 詳細を追加
            </Button>
          ) : (
            <div className="mt-4 space-y-4 rounded-xl border bg-muted/30 p-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1"><Label htmlFor="quick-sets">セット数</Label><Input id="quick-sets" inputMode="numeric" min="0" type="number" value={sets} onChange={(event) => setSets(event.target.value)} /></div>
                <div className="space-y-1"><Label htmlFor="quick-reps">回数</Label><Input id="quick-reps" inputMode="numeric" min="0" type="number" value={reps} onChange={(event) => setReps(event.target.value)} /></div>
                <div className="space-y-1"><Label htmlFor="quick-weight">重量 kg</Label><Input id="quick-weight" inputMode="decimal" min="0" step="0.5" type="number" value={weight} onChange={(event) => setWeight(event.target.value)} /></div>
              </div>
              {type === "plan" ? (
                <div className="space-y-1"><Label htmlFor="quick-time">時間</Label><Input id="quick-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} /></div>
              ) : (
                <div className="space-y-1"><Label htmlFor="quick-memo">メモ</Label><Textarea id="quick-memo" value={memo} onChange={(event) => setMemo(event.target.value)} /></div>
              )}
              <Button className="px-0" type="button" variant="link" onClick={() => setShowDetails(false)}>
                - 詳細を閉じる
              </Button>
            </div>
          )}
        </div>
        <DrawerFooter>
          <Button disabled={isSubmitting} onClick={submit}>{isSubmitting ? "追加中..." : type === "log" ? "記録を追加" : "予定を追加"}</Button>
          <Button disabled={isSubmitting} onClick={() => onOpenChange(false)} variant="ghost">キャンセル</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
