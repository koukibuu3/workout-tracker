import { CalendarView } from "@/components/calendar-view"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="px-4 py-5 sm:py-7">
        <CalendarView />
      </div>
    </main>
  )
}
