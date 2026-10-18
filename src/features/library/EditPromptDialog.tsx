import { useState, type FormEvent } from 'react'
import { Dialog } from '@/components/Dialog'
import { TextField } from '@/components/Field'
import { Button } from '@/components/Primitives'
import { useToast } from '@/components/toast-context'
import { inputClass } from '@/features/task-prompt/FieldInput'
import { updatePrompt } from '@/lib/db/prompts'
import { vi } from '@/lib/i18n/vi'
import type { SavedPrompt } from '@/types/models'

const t = vi.library

export function EditPromptDialog({
  prompt,
  onClose,
}: {
  prompt: SavedPrompt
  onClose: () => void
}) {
  const [title, setTitle] = useState(prompt.title)
  const [body, setBody] = useState(prompt.body)
  const [tags, setTags] = useState(prompt.tags.join(', '))
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await updatePrompt(prompt.id, { title, body, tags: tags.split(',') })
      toast(t.updated)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()} title={t.editTitle} wide>
      <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
        <TextField
          id="edit-title"
          label={vi.save.name}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div>
          <label htmlFor="edit-body" className="mb-1 block text-xs font-semibold">
            {t.bodyLabel}
          </label>
          <textarea
            id="edit-body"
            className={`${inputClass} min-h-[280px] resize-y font-mono text-xs`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted">{t.bodyHint}</p>
        </div>
        <TextField
          id="edit-tags"
          label={vi.save.tags}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-red-ink">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-1.5">
          <Button onClick={onClose}>{vi.projects.cancel}</Button>
          <Button type="submit" variant="primary">
            {t.saveChanges}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
