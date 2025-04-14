"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { getUserSettings, updateUserSettings } from "@/app/actions"

export function SettingsForm() {
  const [name, setName] = useState("ユーザー")
  const [goalPerWeek, setGoalPerWeek] = useState("3")
  const [notifyTime, setNotifyTime] = useState("18:00")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // ユーザー設定を取得
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      try {
        const settings = await getUserSettings()
        if (settings) {
          setName(settings.name || "ユーザー")
          setGoalPerWeek(settings.goal_per_week?.toString() || "3")
          setNotifyTime(settings.notify_time || "18:00")
        }
      } catch (error) {
        console.error("設定の取得に失敗しました:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateUserSettings(name, Number.parseInt(goalPerWeek), notifyTime)
      alert("設定を保存しました")
    } catch (error) {
      console.error("設定の保存に失敗しました:", error)
      alert("設定の保存に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">設定</h1>

      {isLoading ? (
        <p className="text-center py-4 text-muted-foreground">読み込み中...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>ユーザー設定</CardTitle>
              <CardDescription>アプリの基本設定を変更できます</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">名前</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-per-week">週間目標（トレーニング回数）</Label>
                <Select value={goalPerWeek} onValueChange={setGoalPerWeek}>
                  <SelectTrigger id="goal-per-week">
                    <SelectValue placeholder="週間目標を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        週{num}回
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notify-time">通知時間</Label>
                <Input
                  id="notify-time"
                  type="time"
                  value={notifyTime}
                  onChange={(e) => setNotifyTime(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">通知</Label>
                  <p className="text-sm text-muted-foreground">トレーニング予定の通知を受け取る</p>
                </div>
                <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? "保存中..." : "設定を保存"}
              </Button>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}
