import { Header } from "@/components/header"
import { TemplateList } from "@/components/template-list"

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <TemplateList />
      </div>
    </main>
  )
}
