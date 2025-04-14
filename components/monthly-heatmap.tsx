"use client"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getMonthlyWorkoutData } from "@/app/actions"

export function MonthlyHeatmap() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [monthData, setMonthData] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // 月間データを取得
  useEffect(() => {
    const fetchMonthData = async () => {
      setIsLoading(true)
      try {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1
        const data = await getMonthlyWorkoutData(year, month)
        setMonthData(data)
      } catch (error) {
        console.error("月間データの取得に失敗しました:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMonthData()
  }, [currentDate])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 日本の週は月曜始まりだが、getDay()は日曜が0なので調整
  const getAdjustedDay = (date: Date) => {
    const day = getDay(date)
    return day === 0 ? 6 : day - 1 // 日曜は6、月曜は0、火曜は1...
  }

  const startDay = getAdjustedDay(monthStart)

  const getIntensityClass = (count: number) => {
    if (!count) return "bg-gray-100"
    if (count === 1) return "bg-blue-200"
    if (count === 2) return "bg-blue-300"
    return "bg-blue-500"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{format(currentDate, "yyyy年MM月", { locale: ja })}</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center py-4 text-muted-foreground">読み込み中...</p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-2 text-center">
            <div className="text-sm font-medium">月</div>
            <div className="text-sm font-medium">火</div>
            <div className="text-sm font-medium">水</div>
            <div className="text-sm font-medium">木</div>
            <div className="text-sm font-medium">金</div>
            <div className="text-sm font-medium">土</div>
            <div className="text-sm font-medium">日</div>

            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd")
              const count = monthData[dateStr] || 0
              return (
                <div
                  key={dateStr}
                  className={`aspect-square flex items-center justify-center rounded-md text-sm ${getIntensityClass(count)}`}
                  title={`${format(day, "d日")}: ${count}種目`}
                >
                  {format(day, "d")}
                </div>
              )
            })}
          </div>

          <div className="flex justify-center items-center space-x-4 pt-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-100 rounded-sm mr-2"></div>
              <span className="text-xs">0種目</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-200 rounded-sm mr-2"></div>
              <span className="text-xs">1種目</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-300 rounded-sm mr-2"></div>
              <span className="text-xs">2種目</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
              <span className="text-xs">3種目以上</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
