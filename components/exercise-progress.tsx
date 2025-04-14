"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getExerciseProgressData, getWorkoutItems } from "@/app/actions"
import type { WorkoutItem } from "@/lib/db"

export function ExerciseProgress() {
  const [selectedExercise, setSelectedExercise] = useState("")
  const [workoutItems, setWorkoutItems] = useState<WorkoutItem[]>([])
  const [progressData, setProgressData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    startWeight: 0,
    currentWeight: 0,
    increase: 0,
    recordCount: 0,
  })

  // 種目一覧を取得
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await getWorkoutItems()
        setWorkoutItems(items)
        if (items.length > 0 && !selectedExercise) {
          setSelectedExercise(items[0].name)
        }
      } catch (error) {
        console.error("種目の取得に失敗しました:", error)
      }
    }

    fetchItems()
  }, [])

  // 選択された種目の進捗データを取得
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!selectedExercise) return

      setIsLoading(true)
      try {
        const data = await getExerciseProgressData(selectedExercise)
        setProgressData(data)

        // 統計情報を計算
        if (data.length > 0) {
          const startWeight = data[0].weight
          const currentWeight = data[data.length - 1].weight
          const increase = currentWeight - startWeight

          setStats({
            startWeight,
            currentWeight,
            increase,
            recordCount: data.length,
          })
        } else {
          setStats({
            startWeight: 0,
            currentWeight: 0,
            increase: 0,
            recordCount: 0,
          })
        }
      } catch (error) {
        console.error("進捗データの取得に失敗しました:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgressData()
  }, [selectedExercise])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="exercise-select">種目</Label>
        <Select value={selectedExercise} onValueChange={setSelectedExercise}>
          <SelectTrigger id="exercise-select">
            <SelectValue placeholder="種目を選択" />
          </SelectTrigger>
          <SelectContent>
            {workoutItems.map((exercise) => (
              <SelectItem key={exercise.id} value={exercise.name}>
                {exercise.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-center py-4 text-muted-foreground">読み込み中...</p>
      ) : progressData.length > 0 ? (
        <>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}kg`, "重量"]} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">{selectedExercise}の進捗</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">開始重量</p>
                <p className="text-lg font-bold">{stats.startWeight}kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">現在重量</p>
                <p className="text-lg font-bold">{stats.currentWeight}kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">増加量</p>
                <p className="text-lg font-bold">{stats.increase.toFixed(1)}kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">記録回数</p>
                <p className="text-lg font-bold">{stats.recordCount}回</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center py-8 text-muted-foreground">
          {selectedExercise}の記録がありません。トレーニングを記録してください。
        </p>
      )}
    </div>
  )
}
