import { Header } from "@/components/header"
import { TemplateList } from "@/components/template-list"

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-6 py-6 sm:px-8">
        <TemplateList />
      </div>
    </main>
  )
}
