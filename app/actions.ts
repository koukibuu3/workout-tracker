"use server"

import { sql, type WorkoutLog, type WorkoutPlan, type WorkoutItem } from "@/lib/db"
import { revalidatePath } from "next/cache"

// デフォルトユーザーID（実際のアプリでは認証システムと連携）
const DEFAULT_USER_ID = 1

// 種目一覧を取得
export async function getWorkoutItems(): Promise<WorkoutItem[]> {
  const items = await sql<WorkoutItem[]>`
    SELECT id, name, category, video_url FROM workout_items
    ORDER BY category, name
  `
  return items
}

// 特定の日付のトレーニング記録を取得
export async function getWorkoutLogsByDate(date: string): Promise<WorkoutLog[]> {
  const logs = await sql<WorkoutLog[]>`
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
  `
  return logs
}

// 特定の日付のトレーニング予定を取得
export async function getWorkoutPlansByDate(date: string): Promise<WorkoutPlan[]> {
  const plans = await sql<WorkoutPlan[]>`
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
  `
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
  const [detailResult] = await sql<[{ id: number }]>`
    INSERT INTO workout_details (item_id, sets, reps, weight, created_by)
    VALUES (${itemId}, ${sets}, ${reps}, ${weight}, ${DEFAULT_USER_ID})
    RETURNING id
  `

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
  time: string = null,
  repeatPattern: string = null,
) {
  // 1. workout_detailsに追加
  const [detailResult] = await sql<[{ id: number }]>`
    INSERT INTO workout_details (item_id, sets, reps, weight, created_by)
    VALUES (${itemId}, ${sets}, ${reps}, ${weight}, ${DEFAULT_USER_ID})
    RETURNING id
  `

  // 2. workout_plansに追加
  await sql`
    INSERT INTO workout_plans (user_id, date, time, detail_id, repeat_pattern)
    VALUES (${DEFAULT_USER_ID}, ${date}, ${time}, ${detailResult.id}, ${repeatPattern})
  `

  revalidatePath("/")
}

// トレーニングテンプレートを取得
export async function getWorkoutTemplates() {
  const templates = await sql`
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
  `

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
        name: template.category,
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
  }, [])

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

  const result = await sql`
    SELECT 
      wl.date, 
      COUNT(*) as count
    FROM workout_logs wl
    WHERE wl.user_id = ${DEFAULT_USER_ID}
    AND wl.date BETWEEN ${startDate} AND ${endDate}
    GROUP BY wl.date
    ORDER BY wl.date
  `

  // 日付をキー、カウントを値とするオブジェクトに変換
  const monthData = {}
  result.forEach((row) => {
    monthData[row.date] = Number.parseInt(row.count)
  })

  return monthData
}

// 週間のトレーニング記録を取得
export async function getWeeklyWorkoutData() {
  const result = await sql`
    SELECT 
      EXTRACT(DOW FROM wl.date) as day_of_week,
      COUNT(*) as count
    FROM workout_logs wl
    WHERE wl.user_id = ${DEFAULT_USER_ID}
    AND wl.date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY day_of_week
    ORDER BY day_of_week
  `

  // 曜日ごとのデータを整形
  const weekDays = ["日", "月", "火", "水", "木", "金", "土"]
  const weekData = weekDays.map((day, index) => {
    const dayData = result.find((r) => Number.parseInt(r.day_of_week) === index)
    return {
      day,
      count: dayData ? Number.parseInt(dayData.count) : 0,
    }
  })

  return weekData
}

// 種目ごとの進捗データを取得
export async function getExerciseProgressData(itemName: string) {
  const result = await sql`
    SELECT 
      wl.date,
      wd.weight
    FROM workout_logs wl
    JOIN workout_details wd ON wl.detail_id = wd.id
    JOIN workout_items wi ON wd.item_id = wi.id
    WHERE wl.user_id = ${DEFAULT_USER_ID}
    AND wi.name = ${itemName}
    ORDER BY wl.date
  `

  return result.map((row) => ({
    date: new Date(row.date).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }),
    weight: Number.parseFloat(row.weight),
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
  const [log] = await sql<[{ detail_id: number }]>`
    SELECT detail_id FROM workout_logs
    WHERE id = ${logId}
  `

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
  const [plan] = await sql<[{ detail_id: number }]>`
    SELECT detail_id FROM workout_plans
    WHERE id = ${planId}
  `

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
  const [log] = await sql<[{ detail_id: number }]>`
    SELECT detail_id FROM workout_logs
    WHERE id = ${logId}
  `

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
  time: string = null,
  repeatPattern: string = null,
) {
  // まず関連するdetail_idを取得
  const [plan] = await sql<[{ detail_id: number }]>`
    SELECT detail_id FROM workout_plans
    WHERE id = ${planId}
  `

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
export async function addExercise(name: string, category: string, videoUrl: string = null) {
  await sql`
    INSERT INTO workout_items (name, category, video_url)
    VALUES (${name}, ${category}, ${videoUrl})
  `

  revalidatePath("/exercises")
}

// 種目を更新
export async function updateExercise(id: number, name: string, category: string, videoUrl: string = null) {
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
  const [usageCount] = await sql<[{ count: number }]>`
    SELECT COUNT(*) as count
    FROM workout_details
    WHERE item_id = ${id}
  `

  if (Number.parseInt(usageCount.count) > 0) {
    throw new Error("この種目は既にトレーニングで使用されているため削除できません")
  }

  await sql`
    DELETE FROM workout_items
    WHERE id = ${id}
  `

  revalidatePath("/exercises")
}
