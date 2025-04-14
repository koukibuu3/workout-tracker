import { CalendarView } from "@/components/calendar-view"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <CalendarView />
      </div>
    </main>
  )
}
