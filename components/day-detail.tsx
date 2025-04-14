"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutLogItem } from "@/components/workout-log-item";
import { WorkoutPlanItem } from "@/components/workout-plan-item";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddWorkoutDialog } from "@/components/add-workout-dialog";
import { getWorkoutLogsByDate, getWorkoutPlansByDate } from "@/app/actions";
import type { WorkoutLog, WorkoutPlan } from "@/lib/db";

interface DayDetailProps {
  date: Date;
}

export function DayDetail({ date }: DayDetailProps) {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [activeTab, setActiveTab] = useState("plans");
  const [isLoading, setIsLoading] = useState(true);

  const formattedDate = format(date, "yyyy年MM月dd日 (eee)", { locale: ja });
  const dateString = format(date, "yyyy-MM-dd");

  // データを取得する関数
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [logsData, plansData] = await Promise.all([
        getWorkoutLogsByDate(dateString),
        getWorkoutPlansByDate(dateString),
      ]);
      setLogs(logsData);
      setPlans(plansData);
    } catch (error) {
      console.error("データの取得に失敗しました:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 日付が変わるたびにデータを取得
  useEffect(() => {
    fetchData();
  }, [dateString]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">{formattedDate}</h2>

      <Tabs defaultValue="logs" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plans">予定</TabsTrigger>
          <TabsTrigger value="logs">記録</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {isLoading ? (
            <p className="text-center py-4 text-muted-foreground">
              読み込み中...
            </p>
          ) : logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((log) => (
                <WorkoutLogItem key={log.id} log={log} onUpdate={fetchData} />
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              記録がありません
            </p>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setActiveTab("logs");
              setShowAddWorkout(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            記録を追加
          </Button>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          {isLoading ? (
            <p className="text-center py-4 text-muted-foreground">
              読み込み中...
            </p>
          ) : plans.length > 0 ? (
            <div className="space-y-2">
              {plans.map((plan) => (
                <WorkoutPlanItem
                  key={plan.id}
                  plan={plan}
                  onUpdate={fetchData}
                />
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              予定がありません
            </p>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setActiveTab("plans");
              setShowAddWorkout(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            予定を追加
          </Button>
        </TabsContent>
      </Tabs>

      <AddWorkoutDialog
        open={showAddWorkout}
        onOpenChange={setShowAddWorkout}
        mode={activeTab === "logs" ? "log" : "plan"}
        date={date}
        onSuccess={fetchData}
      />
    </div>
  );
}
