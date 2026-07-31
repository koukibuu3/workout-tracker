import { Header } from "@/components/header"
import { ExerciseList } from "@/components/exercise-list"

export default function ExercisesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-6 py-6 sm:px-8">
        <ExerciseList />
      </div>
    </main>
  )
}
