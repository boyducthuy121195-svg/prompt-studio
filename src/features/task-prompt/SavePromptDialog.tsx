import { useState, type FormEvent } from 'react'
import { Dialog } from '@/components/Dialog'
import { TextField } from '@/components/Field'
import { Button } from '@/components/Primitives'
import { useToast } from '@/components/toast-context'
import { savePrompt } from '@/lib/db/prompts'
import { vi } from '@/lib/i18n/vi'
import type { Project } from '@/types/models'
import { inputClass } from './FieldInput'

const t = vi.save

/** Hộp "Lưu vào thư viện" – lưu nội dung prompt kèm trạng thái bảng nhập để mở lại được. */
export function SavePromptDialog({
  open,
  onOpenChange,
  defaultTitle,
  typeCode,
  body,
  formState,
  project,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  defaultTitle: string
  typeCode: string
  body: string
  formState?: unknown
  project: Project | null
}) {
  const [title, setTitle] = useState(defaultTitle)
  const [scope, setScope] = useState<'project' | 'shared'>(project ? 'project' : 'shared')
  const [tags, setTags] = useState('')
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const saved = await savePrompt({
        projectId: scope === 'project' && project ? project.id : null,
        title,
        typeCode,
        body,
        formState,
        tags: tags.split(','),
      })
      toast(t.saved(saved.title))
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t.title} description={t.desc}>
      <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
        <TextField
          id="save-title"
          label={t.name}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <div>
          <label htmlFor="save-scope" className="mb-1 block text-xs font-semibold">
            {t.scope}
          </label>
          <select
            id="save-scope"
            className={`${inputClass} h-9`}
            value={scope}
            onChange={(e) => setScope(e.target.value as 'project' | 'shared')}
          >
            {project && <option value="project">{t.scopeProject(project.name)}</option>}
            <option value="shared">{t.scopeShared}</option>
          </select>
        </div>
        <TextField
          id="save-tags"
          label={t.tags}
          placeholder={t.tagsPlaceholder}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-red-ink">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-1.5">
          <Button onClick={() => onOpenChange(false)}>{vi.projects.cancel}</Button>
          <Button type="submit" variant="primary">
            {t.submit}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
