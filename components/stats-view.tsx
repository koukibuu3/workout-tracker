"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WeeklyProgress } from "@/components/weekly-progress"
import { MonthlyHeatmap } from "@/components/monthly-heatmap"
import { ExerciseProgress } from "@/components/exercise-progress"

export function StatsView() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">トレーニング統計</h1>

      <Tabs defaultValue="weekly">
        <TabsList>
          <TabsTrigger value="weekly">週間</TabsTrigger>
          <TabsTrigger value="monthly">月間</TabsTrigger>
          <TabsTrigger value="progress">進捗</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>週間トレーニング</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyProgress />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>月間トレーニング</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyHeatmap />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>種目別進捗</CardTitle>
            </CardHeader>
            <CardContent>
              <ExerciseProgress />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
