"use server"

import { sql, type WorkoutLog, type WorkoutPlan, type WorkoutItem } from "@/lib/db"
import { revalidatePath } from "next/cache"

// デフォルトユーザーID（実際のアプリでは認証システムと連携）
const DEFAULT_USER_ID = 1

export type SimpleWorkoutInput = {
  date: string
  type: "log" | "plan"
  name: string
  sets?: number | null
  reps?: number | null
  weight?: number | null
  memo?: string
  time?: string | null
  repeatPattern?: "daily" | "weekly" | "monthly" | null
}

type TemplateRow = {
  id: number
  name: string
  sets: number
  reps: number
  weight: number
  category: string | null
  video_url: string | null
}

type MonthlyWorkoutRow = { date: string; count: string | number }
type CalendarDayStatusRow = { date: string; log_count: string | number; plan_count: string | number }
type WeeklyWorkoutRow = { day_of_week: string | number; count: string | number }
type ExerciseProgressRow = { date: string; weight: string | number }

async function findOrCreateWorkoutItem(name: string) {
  const [existingItem] = (await sql`
    SELECT id FROM workout_items
    WHERE name = ${name}
    ORDER BY id
    LIMIT 1
  `) as { id: number }[]

  if (existingItem) {
    return existingItem.id
  }

  const [createdItem] = (await sql`
    INSERT INTO workout_items (name, category)
    VALUES (${name}, NULL)
    RETURNING id
  `) as { id: number }[]

  return createdItem.id
}

/**
 * 自由入力の予定または記録を追加する。
 * sets/reps は既存スキーマの必須列のため、未入力時は 0 として保存する。
 */
export async function addSimpleWorkout(input: SimpleWorkoutInput) {
  const name = input.name.trim()
  if (!name) {
    throw new Error("内容を入力してください")
  }

  const itemId = await findOrCreateWorkoutItem(name)
  const [detail] = (await sql`
    INSERT INTO workout_details (item_id, sets, reps, weight, created_by)
    VALUES (
      ${itemId},
      ${input.sets && input.sets > 0 ? input.sets : 0},
      ${input.reps && input.reps > 0 ? input.reps : 0},
      ${input.weight && input.weight > 0 ? input.weight : null},
      ${DEFAULT_USER_ID}
    )
    RETURNING id
  `) as { id: number }[]

  if (input.type === "log") {
    await sql`
      INSERT INTO workout_logs (user_id, date, detail_id, memo)
      VALUES (${DEFAULT_USER_ID}, ${input.date}, ${detail.id}, ${input.memo?.trim() || null})
    `
  } else {
    await sql`
      INSERT INTO workout_plans (user_id, date, time, detail_id, repeat_pattern)
      VALUES (
        ${DEFAULT_USER_ID},
        ${input.date},
        ${input.time || null},
        ${detail.id},
        ${input.repeatPattern || null}
      )
    `
  }

  revalidatePath("/")
}

// 種目一覧を取得
export async function getWorkoutItems(): Promise<WorkoutItem[]> {
  const items = (await sql`
    SELECT id, name, category, video_url FROM workout_items
    ORDER BY category, name
  `) as WorkoutItem[]
  return items
}

// 特定の日付のトレーニング記録を取得
export async function getWorkoutLogsByDate(date: string): Promise<WorkoutLog[]> {
  const logs = (await sql`
    SELECT 
      wl.id, wl.user_id, wl.date, wl.detail_id, wl.memo, wl.created_at,
      wi.name as item_name, wi.video_url,
      wd.sets, wd.reps, wd.weight
    FROM workout_logs wl
    JOIN workout_details wd ON wl.detail_id = wd.id
    JOIN workout_items wi ON wd.item_id = wi.id
    WHERE wl.user_id = ${DEFAULT_USER_ID}
    AND wl.date = ${date}
    ORDER BY wl.created_at DESC
  `) as WorkoutLog[]
  return logs
}

// 特定の日付のトレーニング予定を取得
export async function getWorkoutPlansByDate(date: string): Promise<WorkoutPlan[]> {
  const plans = (await sql`
    SELECT 
      wp.id, wp.user_id, wp.date, wp.time, wp.detail_id, wp.repeat_pattern, wp.created_at,
      wi.name as item_name, wi.video_url,
      wd.sets, wd.reps, wd.weight
    FROM workout_plans wp
    JOIN workout_details wd ON wp.detail_id = wd.id
    JOIN workout_items wi ON wd.item_id = wi.id
    WHERE wp.user_id = ${DEFAULT_USER_ID}
    AND wp.date = ${date}
    ORDER BY wp.time
  `) as WorkoutPlan[]
  return plans
}

// トレーニング記録を追加
export async function addWorkoutLog(
  date: string,
  itemId: number,
  sets: number,
  reps: number,
  weight: number,
  memo = "",
) {
  // 1. workout_detailsに追加
  const [detailResult] = (await sql`
    INSERT INTO workout_details (item_id, sets, reps, weight, created_by)
    VALUES (${itemId}, ${sets}, ${reps}, ${weight}, ${DEFAULT_USER_ID})
    RETURNING id
  `) as { id: number }[]

  // 2. workout_logsに追加
  await sql`
    INSERT INTO workout_logs (user_id, date, detail_id, memo)
    VALUES (${DEFAULT_USER_ID}, ${date}, ${detailResult.id}, ${memo})
  `

  revalidatePath("/")
}

// トレーニング予定を追加
export async function addWorkoutPlan(
  date: string,
  itemId: number,
  sets: number,
  reps: number,
  weight: number,
  time: string | null = null,
  repeatPattern: string | null = null,
) {
  // 1. workout_detailsに追加
  const [detailResult] = (await sql`
    INSERT INTO workout_details (item_id, sets, reps, weight, created_by)
    VALUES (${itemId}, ${sets}, ${reps}, ${weight}, ${DEFAULT_USER_ID})
    RETURNING id
  `) as { id: number }[]

  // 2. workout_plansに追加
  await sql`
    INSERT INTO workout_plans (user_id, date, time, detail_id, repeat_pattern)
    VALUES (${DEFAULT_USER_ID}, ${date}, ${time}, ${detailResult.id}, ${repeatPattern})
  `

  revalidatePath("/")
}

// トレーニングテンプレートを取得
export async function getWorkoutTemplates(): Promise<import("@/lib/db").WorkoutTemplate[]> {
  const templates = (await sql`
    SELECT 
      wd.id, 
      wi.name as name,
      wd.sets,
      wd.reps,
      wd.weight,
      wi.category,
      wi.video_url
    FROM workout_details wd
    JOIN workout_items wi ON wd.item_id = wi.id
    WHERE wd.is_template = true
    AND wd.created_by = ${DEFAULT_USER_ID}
    ORDER BY wd.created_at DESC
  `) as TemplateRow[]

  // テンプレートをグループ化
  const groupedTemplates = templates.reduce((acc, template) => {
    const existingGroup = acc.find((g) => g.name === template.category)
    if (existingGroup) {
      existingGroup.exercises.push({
        id: template.id,
        name: template.name,
        sets: template.sets,
        reps: template.reps,
        weight: template.weight,
        video_url: template.video_url,
      })
    } else {
      acc.push({
        id: acc.length + 1,
        name: template.category ?? "未分類",
        exercises: [
          {
            id: template.id,
            name: template.name,
            sets: template.sets,
            reps: template.reps,
            weight: template.weight,
            video_url: template.video_url,
          },
        ],
      })
    }
    return acc
  }, [] as import("@/lib/db").WorkoutTemplate[])

  return groupedTemplates
}

// テンプレートとして保存
export async function saveAsTemplate(itemId: number, sets: number, reps: number, weight: number) {
  await sql`
    INSERT INTO workout_details (item_id, sets, reps, weight, is_template, created_by)
    VALUES (${itemId}, ${sets}, ${reps}, ${weight}, true, ${DEFAULT_USER_ID})
  `

  revalidatePath("/templates")
}

// 月間のトレーニング記録を取得（ヒートマップ用）
export async function getMonthlyWorkoutData(year: number, month: number) {
  const startDate = `${year}-${month.toString().padStart(2, "0")}-01`
  const endDate = `${year}-${month.toString().padStart(2, "0")}-31`

  const result = (await sql`
    SELECT 
      wl.date, 
      COUNT(*) as count
    FROM workout_logs wl
    WHERE wl.user_id = ${DEFAULT_USER_ID}
    AND wl.date BETWEEN ${startDate} AND ${endDate}
    GROUP BY wl.date
    ORDER BY wl.date
  `) as MonthlyWorkoutRow[]

  // 日付をキー、カウントを値とするオブジェクトに変換
  const monthData: Record<string, number> = {}
  result.forEach((row) => {
    monthData[row.date] = Number(row.count)
  })

  return monthData
}

/** カレンダーに表示する、日ごとの記録数と予定の有無を取得する。 */
export async function getCalendarDayStatuses(year: number, month: number) {
  const startDate = `${year}-${month.toString().padStart(2, "0")}-01`
  const nextMonth = new Date(year, month, 1)
  const endDate = `${nextMonth.getFullYear()}-${(nextMonth.getMonth() + 1).toString().padStart(2, "0")}-01`

  const result = (await sql`
    SELECT
      TO_CHAR(dates.date, 'YYYY-MM-DD') as date,
      COUNT(DISTINCT wl.id) as log_count,
      COUNT(DISTINCT wp.id) as plan_count
    FROM (
      SELECT date FROM workout_logs
      WHERE user_id = ${DEFAULT_USER_ID}
      AND date >= ${startDate}
      AND date < ${endDate}
      UNION
      SELECT date FROM workout_plans
      WHERE user_id = ${DEFAULT_USER_ID}
      AND date >= ${startDate}
      AND date < ${endDate}
    ) dates
    LEFT JOIN workout_logs wl
      ON wl.date = dates.date
      AND wl.user_id = ${DEFAULT_USER_ID}
    LEFT JOIN workout_plans wp
      ON wp.date = dates.date
      AND wp.user_id = ${DEFAULT_USER_ID}
    GROUP BY dates.date
    ORDER BY dates.date
  `) as CalendarDayStatusRow[]

  return result.reduce<Record<string, { logCount: number; hasPlan: boolean }>>((statuses, row) => {
    statuses[row.date] = {
      logCount: Number(row.log_count),
      hasPlan: Number(row.plan_count) > 0,
    }
    return statuses
  }, {})
}

// 週間のトレーニング記録を取得
export async function getWeeklyWorkoutData() {
  const result = (await sql`
    SELECT 
      EXTRACT(DOW FROM wl.date) as day_of_week,
      COUNT(*) as count
    FROM workout_logs wl
    WHERE wl.user_id = ${DEFAULT_USER_ID}
    AND wl.date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY day_of_week
    ORDER BY day_of_week
  `) as WeeklyWorkoutRow[]

  // 曜日ごとのデータを整形
  const weekDays = ["日", "月", "火", "水", "木", "金", "土"]
  const weekData = weekDays.map((day, index) => {
    const dayData = result.find((r) => Number(r.day_of_week) === index)
    return {
      day,
      count: dayData ? Number(dayData.count) : 0,
    }
  })

  return weekData
}

// 種目ごとの進捗データを取得
export async function getExerciseProgressData(itemName: string) {
  const result = (await sql`
    SELECT 
      wl.date,
      wd.weight
    FROM workout_logs wl
    JOIN workout_details wd ON wl.detail_id = wd.id
    JOIN workout_items wi ON wd.item_id = wi.id
    WHERE wl.user_id = ${DEFAULT_USER_ID}
    AND wi.name = ${itemName}
    ORDER BY wl.date
  `) as ExerciseProgressRow[]

  return result.map((row) => ({
    date: new Date(row.date).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }),
    weight: Number(row.weight),
  }))
}

// ユーザー設定を取得
export async function getUserSettings() {
  const [user] = await sql`
    SELECT id, name, goal_per_week, notify_time
    FROM users
    WHERE id = ${DEFAULT_USER_ID}
  `

  return user
}

// ユーザー設定を更新
export async function updateUserSettings(name: string, goalPerWeek: number, notifyTime: string) {
  await sql`
    UPDATE users
    SET name = ${name}, goal_per_week = ${goalPerWeek}, notify_time = ${notifyTime}
    WHERE id = ${DEFAULT_USER_ID}
  `

  revalidatePath("/settings")
}

// トレーニング記録を削除
export async function deleteWorkoutLog(logId: number) {
  // まず関連するdetail_idを取得
  const [log] = (await sql`
    SELECT detail_id FROM workout_logs
    WHERE id = ${logId}
  `) as { detail_id: number }[]

  if (log) {
    // 個別のクエリとして実行（トランザクションなし）
    // まずworkout_logsから削除
    await sql`DELETE FROM workout_logs WHERE id = ${logId}`
    // 次にworkout_detailsから削除
    await sql`DELETE FROM workout_details WHERE id = ${log.detail_id}`
  }

  revalidatePath("/")
}

// トレーニング予定を削除
export async function deleteWorkoutPlan(planId: number) {
  // まず関連するdetail_idを取得
  const [plan] = (await sql`
    SELECT detail_id FROM workout_plans
    WHERE id = ${planId}
  `) as { detail_id: number }[]

  if (plan) {
    // 個別のクエリとして実行（トランザクションなし）
    // まずworkout_plansから削除
    await sql`DELETE FROM workout_plans WHERE id = ${planId}`
    // 次にworkout_detailsから削除
    await sql`DELETE FROM workout_details WHERE id = ${plan.detail_id}`
  }

  revalidatePath("/")
}

// トレーニング記録の詳細を取得
export async function getWorkoutLogDetail(logId: number) {
  const [log] = await sql`
    SELECT 
      wl.id, wl.user_id, wl.date, wl.detail_id, wl.memo, wl.created_at,
      wd.item_id, wd.sets, wd.reps, wd.weight,
      wi.name as item_name, wi.category, wi.video_url
    FROM workout_logs wl
    JOIN workout_details wd ON wl.detail_id = wd.id
    JOIN workout_items wi ON wd.item_id = wi.id
    WHERE wl.id = ${logId}
  `
  return log
}

// トレーニング予定の詳細を取得
export async function getWorkoutPlanDetail(planId: number) {
  const [plan] = await sql`
    SELECT 
      wp.id, wp.user_id, wp.date, wp.time, wp.detail_id, wp.repeat_pattern, wp.created_at,
      wd.item_id, wd.sets, wd.reps, wd.weight,
      wi.name as item_name, wi.category, wi.video_url
    FROM workout_plans wp
    JOIN workout_details wd ON wp.detail_id = wd.id
    JOIN workout_items wi ON wd.item_id = wi.id
    WHERE wp.id = ${planId}
  `
  return plan
}

// トレーニング記録を更新
export async function updateWorkoutLog(
  logId: number,
  itemId: number,
  sets: number,
  reps: number,
  weight: number,
  memo = "",
) {
  // まず関連するdetail_idを取得
  const [log] = (await sql`
    SELECT detail_id FROM workout_logs
    WHERE id = ${logId}
  `) as { detail_id: number }[]

  if (log) {
    // workout_detailsを更新
    await sql`
      UPDATE workout_details
      SET item_id = ${itemId}, sets = ${sets}, reps = ${reps}, weight = ${weight}
      WHERE id = ${log.detail_id}
    `
    // workout_logsを更新
    await sql`
      UPDATE workout_logs
      SET memo = ${memo}
      WHERE id = ${logId}
    `
  }

  revalidatePath("/")
}

// トレーニング予定を更新
export async function updateWorkoutPlan(
  planId: number,
  itemId: number,
  sets: number,
  reps: number,
  weight: number,
  time: string | null = null,
  repeatPattern: string | null = null,
) {
  // まず関連するdetail_idを取得
  const [plan] = (await sql`
    SELECT detail_id FROM workout_plans
    WHERE id = ${planId}
  `) as { detail_id: number }[]

  if (plan) {
    // workout_detailsを更新
    await sql`
      UPDATE workout_details
      SET item_id = ${itemId}, sets = ${sets}, reps = ${reps}, weight = ${weight}
      WHERE id = ${plan.detail_id}
    `
    // workout_plansを更新
    await sql`
      UPDATE workout_plans
      SET time = ${time}, repeat_pattern = ${repeatPattern}
      WHERE id = ${planId}
    `
  }

  revalidatePath("/")
}

// 予定を記録として保存
export async function savePlanAsLog(planId: number, date: string, memo = "") {
  // まず予定の詳細を取得
  const plan = await getWorkoutPlanDetail(planId)

  if (plan) {
    // 新しい記録として保存
    await addWorkoutLog(date, plan.item_id, plan.sets, plan.reps, plan.weight, memo)
  }

  revalidatePath("/")
}

// 記録をテンプレートとして保存
export async function saveLogAsTemplate(logId: number) {
  // まず記録の詳細を取得
  const log = await getWorkoutLogDetail(logId)

  if (log) {
    // テンプレートとして保存
    await saveAsTemplate(log.item_id, log.sets, log.reps, log.weight)
  }

  revalidatePath("/templates")
}

// テンプレートを削除
export async function deleteTemplate(templateId: number) {
  await sql`
    DELETE FROM workout_details
    WHERE id = ${templateId}
    AND is_template = true
  `

  revalidatePath("/templates")
}

// 種目を追加
export async function addExercise(name: string, category: string, videoUrl: string | null = null) {
  await sql`
    INSERT INTO workout_items (name, category, video_url)
    VALUES (${name}, ${category}, ${videoUrl})
  `

  revalidatePath("/exercises")
}

// 種目を更新
export async function updateExercise(id: number, name: string, category: string, videoUrl: string | null = null) {
  await sql`
    UPDATE workout_items
    SET name = ${name}, category = ${category}, video_url = ${videoUrl}
    WHERE id = ${id}
  `

  revalidatePath("/exercises")
}

// 種目を削除
export async function deleteExercise(id: number) {
  // 種目を使用しているワークアウト詳細があるか確認
  const [usageCount] = (await sql`
    SELECT COUNT(*) as count
    FROM workout_details
    WHERE item_id = ${id}
  `) as { count: string | number }[]

  if (Number(usageCount.count) > 0) {
    throw new Error("この種目は既にトレーニングで使用されているため削除できません")
  }

  await sql`
    DELETE FROM workout_items
    WHERE id = ${id}
  `

  revalidatePath("/exercises")
}
