import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Dialog } from '@/components/Dialog'
import { TextAreaField, TextField } from '@/components/Field'
import { Button } from '@/components/Primitives'
import { useToast } from '@/components/toast-context'
import { createProject } from '@/lib/db/projects'
import { updateSettings } from '@/lib/db/settings'
import { vi } from '@/lib/i18n/vi'

const t = vi.projects

export function NewProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const toast = useToast()

  const close = (o: boolean) => {
    onOpenChange(o)
    if (!o) {
      setName('')
      setDescription('')
      setError(null)
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError(t.nameRequired)
      return
    }
    try {
      const project = await createProject({ name, description })
      await updateSettings({ currentProjectId: project.id })
      toast(t.created(project.name))
      close(false)
      navigate(`/projects/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={close} title={t.createTitle} description={t.createDesc}>
      <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
        <TextField
          id="new-project-name"
          label={t.nameLabel}
          placeholder={t.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'new-project-error' : undefined}
        />
        <TextAreaField
          id="new-project-desc"
          label={t.descLabel}
          placeholder={t.descPlaceholder}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && (
          <p id="new-project-error" role="alert" className="text-red-ink">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-1.5">
          <Button onClick={() => close(false)}>{t.cancel}</Button>
          <Button type="submit" variant="primary">
            {t.create}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
