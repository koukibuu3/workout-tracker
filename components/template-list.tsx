'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TemplateItem } from '@/components/template-item'
import { AddTemplateDialog } from '@/components/add-template-dialog'
import { getWorkoutTemplates } from '@/app/actions'
import type { WorkoutTemplate } from '@/lib/db'

export function TemplateList() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [showAddTemplate, setShowAddTemplate] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // テンプレート一覧を取得
  const fetchTemplates = async () => {
    setIsLoading(true)
    try {
      const templatesData = await getWorkoutTemplates()
      setTemplates(templatesData)
    } catch (error) {
      console.error('テンプレートの取得に失敗しました:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">テンプレート</h1>
        <Button onClick={() => setShowAddTemplate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          テンプレートを追加
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center py-8 text-muted-foreground">読み込み中...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateItem
              key={template.id}
              template={template}
              onUpdate={fetchTemplates}
            />
          ))}

          {templates.length === 0 && (
            <p className="col-span-full text-center py-8 text-muted-foreground">
              テンプレートがありません。新しいテンプレートを追加してください。
            </p>
          )}
        </div>
      )}

      <AddTemplateDialog
        open={showAddTemplate}
        onOpenChange={setShowAddTemplate}
        onSuccess={fetchTemplates}
      />
    </div>
  )
}
