import Link from 'next/link'
import { Dumbbell } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-2xl items-center px-6 sm:px-8">
        <div className="flex items-center space-x-2">
          <Dumbbell className="h-6 w-6" />
          <Link href="/" className="font-bold sm:inline-block">
            筋トレサポート
          </Link>
        </div>
      </div>
    </header>
  )
}
