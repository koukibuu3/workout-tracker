import { neon } from "@neondatabase/serverless"

// データベース接続を初期化
export const sql = neon(process.env.DATABASE_URL!)

// 型定義
export interface User {
  id: number
  name: string
  goal_per_week: number
  notify_time: string
  created_at: string
}

export interface WorkoutItem {
  id: number
  name: string
  category: string
}

export interface WorkoutDetail {
  id: number
  item_id: number
  sets: number
  reps: number
  weight: number
  is_template: boolean
  created_by: number
  created_at: string
  item_name?: string // JOINで取得する場合
  category?: string // JOINで取得する場合
}

export interface WorkoutLog {
  id: number
  user_id: number
  date: string
  detail_id: number
  memo: string
  created_at: string
  sets?: number
  reps?: number
  weight?: number | null
  detail?: WorkoutDetail // JOINで取得する場合
  item_name?: string // JOINで取得する場合
}

export interface WorkoutPlan {
  id: number
  user_id: number
  date: string
  time: string
  detail_id: number
  repeat_pattern: string
  created_at: string
  sets?: number
  reps?: number
  weight?: number | null
  detail?: WorkoutDetail // JOINで取得する場合
  item_name?: string // JOINで取得する場合
}

export interface WorkoutTemplate {
  id: number
  name: string
  exercises: {
    id: number
    name: string
    sets: number
    reps: number
    weight: number
  }[]
}
