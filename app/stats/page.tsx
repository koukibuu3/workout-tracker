import { Header } from "@/components/header"
import { StatsView } from "@/components/stats-view"

export default function StatsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <StatsView />
      </div>
    </main>
  )
}
