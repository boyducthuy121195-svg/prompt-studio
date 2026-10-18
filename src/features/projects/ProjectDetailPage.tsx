import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useHotkey } from '@/app/use-hotkey'
import { Dialog } from '@/components/Dialog'
import { TextAreaField, TextField } from '@/components/Field'
import { Button, Kbd, PageHeader, Panel, PanelHeader, Tag } from '@/components/Primitives'
import { useToast } from '@/components/toast-context'
import { useProject, useProjectStats } from '@/lib/db/hooks'
import { deleteProject, duplicateProject, updateProject } from '@/lib/db/projects'
import { updateSettings } from '@/lib/db/settings'
import { vi } from '@/lib/i18n/vi'
import { phaseLabel } from '@/lib/phases'
import type { Project, ProjectProfile } from '@/types/models'
import { PhaseBar } from './PhaseBar'

const t = vi.projects

type FormState = Pick<Project, 'name' | 'description'> & ProjectProfile
const PROFILE_KEYS = [
  'goal',
  'techStack',
  'commands',
  'structure',
  'conventions',
  'donts',
  'notes',
] as const

const toForm = (p: Project): FormState => ({
  name: p.name,
  description: p.description,
  ...p.profile,
})

/** M2 – chi tiết dự án: thanh tiến độ, hồ sơ dự án, tài liệu, nhân bản, xóa. */
export function ProjectDetailPage() {
  const { id = '' } = useParams()
  const project = useProject(id)

  const exists = project.status === 'ready' && project.data !== undefined
  // Mở chi tiết dự án nào thì dự án đó trở thành "dự án đang chọn" trên header
  useEffect(() => {
    if (exists) void updateSettings({ currentProjectId: id })
  }, [id, exists])

  if (project.status === 'loading') return <p className="text-muted">{vi.common.loading}</p>
  if (project.status === 'error' || !project.data) {
    return (
      <>
        <PageHeader title={vi.pages.notFound.title} desc={t.notFound} />
        <Link to="/projects" className="text-accent hover:underline">
          {t.backToList}
        </Link>
      </>
    )
  }
  // key: mở dự án khác thì form khởi tạo lại từ dữ liệu của dự án đó
  return <ProjectDetail key={project.data.id} project={project.data} />
}

function ProjectDetail({ project }: { project: Project }) {
  const [form, setForm] = useState<FormState>(() => toForm(project))
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const stats = useProjectStats()
  const navigate = useNavigate()
  const toast = useToast()

  const saved = toForm(project)
  const dirty = (Object.keys(form) as (keyof FormState)[]).some((k) => form[k] !== saved[k])
  const s = stats.status === 'ready' ? stats.data[project.id] : undefined

  const save = async () => {
    try {
      const { name, description, ...profile } = form
      await updateProject(project.id, { name, description, profile })
      setError(null)
      toast(t.saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }
  useHotkey('mod+s', () => void save())

  const setField = (key: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const selectPhase = async (i: number) => {
    await updateProject(project.id, { currentPhase: i })
    toast(t.phaseSet(phaseLabel(i)))
  }

  const duplicate = async () => {
    const copy = await duplicateProject(project.id)
    toast(t.duplicated(copy.name))
    navigate(`/projects/${copy.id}`)
  }

  const remove = async () => {
    await deleteProject(project.id)
    setConfirmDelete(false)
    toast(t.deleted(project.name))
    navigate('/projects')
  }

  return (
    <>
      <div>
        <div className="text-xs text-muted">
          <Link to="/projects" className="hover:underline">
            {t.breadcrumb}
          </Link>{' '}
          / {project.name}
        </div>
        <PageHeader
          title={project.name}
          aside={
            <div className="flex gap-1.5">
              <Button size="sm" onClick={() => void duplicate()}>
                {t.duplicate}
              </Button>
              <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>
                {t.delete}
              </Button>
            </div>
          }
        />
      </div>

      <Panel>
        <PanelHeader>
          <h2 className="flex-1 text-sm font-semibold">{t.progressTitle}</h2>
          <span className="text-xs text-muted">{t.progressHint}</span>
        </PanelHeader>
        <div className="p-3.5">
          <PhaseBar current={project.currentPhase} onSelect={(i) => void selectPhase(i)} />
        </div>
      </Panel>

      <div className="flex flex-wrap items-start gap-3.5">
        <Panel className="min-w-0 flex-[2_1_420px]">
          <PanelHeader>
            <h2 className="flex-1 text-sm font-semibold">{t.profileTitle}</h2>
            {dirty && <Tag tone="warn">{t.unsaved}</Tag>}
            <span className="text-xs text-muted">{t.profileHint}</span>
          </PanelHeader>
          <form
            className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3 p-3.5"
            onSubmit={(e) => {
              e.preventDefault()
              void save()
            }}
          >
            <TextField
              id="pf-name"
              label={t.fields.name.label}
              value={form.name}
              onChange={setField('name')}
            />
            <TextField
              id="pf-description"
              label={t.fields.description.label}
              placeholder={t.fields.description.placeholder}
              value={form.description}
              onChange={setField('description')}
            />
            {PROFILE_KEYS.map((key) => (
              <TextAreaField
                key={key}
                id={`pf-${key}`}
                label={t.fields[key].label}
                placeholder={t.fields[key].placeholder}
                value={form[key]}
                onChange={setField(key)}
              />
            ))}
            {error && (
              <p role="alert" className="col-span-full text-red-ink">
                {error}
              </p>
            )}
            <div className="col-span-full">
              <Button type="submit" variant="primary" size="sm" disabled={!dirty}>
                {t.save}
                <Kbd className="border-current bg-transparent text-current">Ctrl+S</Kbd>
              </Button>
            </div>
          </form>
        </Panel>

        <Panel className="flex-[1_1_260px]">
          <PanelHeader>
            <h2 className="text-sm font-semibold">{t.docsTitle}</h2>
          </PanelHeader>
          <ul>
            <li className="flex items-center gap-2 border-b border-border px-3.5 py-2">
              <Link to="/agents" className="flex-1 font-semibold text-accent hover:underline">
                {t.docAgents}
              </Link>
              <span className="text-muted">
                {s?.agentsSections != null ? t.agentsCount(s.agentsSections) : t.agentsNone}
              </span>
            </li>
            <li className="flex items-center gap-2 border-b border-border px-3.5 py-2">
              <Link to="/library" className="flex-1 font-semibold text-accent hover:underline">
                {t.docPrompts}
              </Link>
              <span className="text-muted">{t.promptsCount(s?.prompts ?? 0)}</span>
            </li>
          </ul>
          <div className="p-3.5">
            <Link
              to="/prompt"
              className="inline-flex h-9 items-center rounded-md border border-border bg-surface px-3 font-medium hover:bg-hover"
            >
              {t.newPrompt}
            </Link>
          </div>
        </Panel>
      </div>

      <Dialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t.deleteTitle(project.name)}
        description={t.deleteDesc}
        footer={
          <>
            <Button onClick={() => setConfirmDelete(false)}>{t.cancel}</Button>
            <Button variant="dangerSolid" onClick={() => void remove()}>
              {t.deleteConfirm}
            </Button>
          </>
        }
      />
    </>
  )
}
