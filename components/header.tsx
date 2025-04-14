import Link from "next/link"
import { Dumbbell, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileNav } from "@/components/mobile-nav"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center mr-4 space-x-2">
          <Dumbbell className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">筋トレサポート</span>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              カレンダー
            </Link>
            <Link href="/templates" className="text-sm font-medium transition-colors hover:text-primary">
              テンプレート
            </Link>
            <Link href="/exercises" className="text-sm font-medium transition-colors hover:text-primary">
              種目管理
            </Link>
            <Link href="/stats" className="text-sm font-medium transition-colors hover:text-primary">
              統計
            </Link>
          </nav>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left">
                <MobileNav />
              </SheetContent>
            </Sheet>
          </Button>
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">ユーザー設定</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
