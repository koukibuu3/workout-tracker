import { Header } from "@/components/header"
import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <SettingsForm />
      </div>
    </main>
  )
}
