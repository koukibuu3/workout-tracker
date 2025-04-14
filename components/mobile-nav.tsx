import Link from "next/link"
import { Calendar, Dumbbell, BarChart3, Settings, List } from "lucide-react"

export function MobileNav() {
  return (
    <div className="flex flex-col space-y-3 pt-4">
      <div className="flex items-center mb-4 space-x-2">
        <Dumbbell className="h-6 w-6" />
        <span className="font-bold">筋トレサポート</span>
      </div>
      <Link href="/" className="flex items-center py-2 text-lg">
        <Calendar className="mr-2 h-5 w-5" />
        カレンダー
      </Link>
      <Link href="/templates" className="flex items-center py-2 text-lg">
        <Dumbbell className="mr-2 h-5 w-5" />
        テンプレート
      </Link>
      <Link href="/exercises" className="flex items-center py-2 text-lg">
        <List className="mr-2 h-5 w-5" />
        種目管理
      </Link>
      <Link href="/stats" className="flex items-center py-2 text-lg">
        <BarChart3 className="mr-2 h-5 w-5" />
        統計
      </Link>
      <Link href="/settings" className="flex items-center py-2 text-lg">
        <Settings className="mr-2 h-5 w-5" />
        設定
      </Link>
    </div>
  )
}
