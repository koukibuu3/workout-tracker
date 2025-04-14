"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { getWeeklyWorkoutData } from "@/app/actions"

export function WeeklyProgress() {
  const [weekData, setWeekData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCount: 0,
    achievementRate: 0,
    workoutDays: 0,
  })

  // 週間データを取得
  useEffect(() => {
    const fetchWeekData = async () => {
      setIsLoading(true)
      try {
        const data = await getWeeklyWorkoutData()
        setWeekData(data)

        // 統計情報を計算
        const totalCount = data.reduce((sum, day) => sum + day.count, 0)
        const workoutDays = data.filter((day) => day.count > 0).length
        const achievementRate = Math.round((workoutDays / 7) * 100)

        setStats({
          totalCount,
          achievementRate,
          workoutDays,
        })
      } catch (error) {
        console.error("週間データの取得に失敗しました:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeekData()
  }, [])

  if (isLoading) {
    return <p className="text-center py-4 text-muted-foreground">読み込み中...</p>
  }

  return (
    <div className="space-y-4">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip
              formatter={(value) => [`${value}種目`, "トレーニング数"]}
              labelFormatter={(label) => `${label}曜日`}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
        <div>
          <p className="text-sm font-medium">今週のトレーニング</p>
          <p className="text-2xl font-bold">{stats.totalCount}種目</p>
        </div>
        <div>
          <p className="text-sm font-medium">目標達成率</p>
          <p className="text-2xl font-bold">{stats.achievementRate}%</p>
        </div>
        <div>
          <p className="text-sm font-medium">トレーニング日数</p>
          <p className="text-2xl font-bold">{stats.workoutDays}日</p>
        </div>
      </div>
    </div>
  )
}
