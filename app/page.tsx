import { CalendarView } from "@/components/calendar-view"
import { Header } from "@/components/header"

export default function Home() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
    year: "numeric",
  }).formatToParts(new Date())
  const getPart = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value
  const initialDate = `${getPart("year")}-${getPart("month")}-${getPart("day")}`

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="px-6 py-5 sm:px-8 sm:py-7">
        <CalendarView initialDate={initialDate} />
      </div>
    </main>
  )
}
