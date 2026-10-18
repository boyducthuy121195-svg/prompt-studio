import {
  ArrowDown,
  ArrowUp,
  Copy,
  Download,
  GripVertical,
  Package,
  Save,
  Trash2,
} from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { useHotkey } from '@/app/use-hotkey'
import { Button, Kbd, PageHeader, Panel, PanelHeader, Tag } from '@/components/Primitives'
import { useToast } from '@/components/toast-context'
import { inputClass } from '@/features/task-prompt/FieldInput'
import { localChecks } from '@/lib/agents/checks'
import {
  addCustomSection,
  isRequired,
  moveSection,
  removeSection,
  renderAgentsMd,
  sortSections,
  toggleSection,
  updateSection,
} from '@/lib/agents/doc'
import { buildAgentsZip } from '@/lib/agents/export'
import { copyText } from '@/lib/clipboard'
import { ensureAgentsDoc, getAgentsDoc, saveAgentsDoc } from '@/lib/db/agents'
import { useCurrentProject } from '@/lib/db/hooks'
import { useLiveQuery } from '@/lib/db/use-live-query'
import { downloadFile } from '@/lib/download'
import { vi } from '@/lib/i18n/vi'
import { getAgentsSection } from '@/lib/prompts/agents-skeleton'
import { cn } from '@/lib/utils'
import type { AgentsDoc, AgentsSection, Project } from '@/types/models'

// Trình soạn thảo (CodeMirror) và xem trước Markdown khá nặng nên tải riêng khi cần
const MarkdownEditor = lazy(async () => ({
  default: (await import('@/components/MarkdownEditor')).MarkdownEditor,
}))
const MarkdownPreview = lazy(async () => ({
  default: (await import('@/components/MarkdownPreview')).MarkdownPreview,
}))

const t = vi.agents
export type AgentsMode = 'wizard' | 'free' | 'edit'

/** Chỗ cắm cho task 10: chế độ Hỏi đáp / Nhập tự do và các nút ✨ theo mục. */
export interface AgentsAiSlots {
  wizard?: (ctx: AgentsSlotContext) => ReactNode
  free?: (ctx: AgentsSlotContext) => ReactNode
  sectionActions?: (ctx: AgentsSlotContext & { section: AgentsSection }) => ReactNode
  checkActions?: (ctx: AgentsSlotContext) => ReactNode
}

export interface AgentsSlotContext {
  project: Project
  sections: AgentsSection[]
  /** Thay toàn bộ các mục (ví dụ sau khi AI viết xong) rồi chuyển sang chế độ chỉnh sửa */
  replaceSections: (s: AgentsSection[]) => void
  setSectionContent: (key: string, content: string) => void
  setMode: (m: AgentsMode) => void
}

/** M6 – AGENTS.md của dự án đang chọn. */
export function AgentsPage({ slots = {} }: { slots?: AgentsAiSlots }) {
  const current = useCurrentProject()
  if (current.status === 'loading') return <p className="text-muted">{vi.common.loading}</p>
  const project = current.status === 'ready' ? current.data : null
  if (!project) {
    return (
      <>
        <PageHeader title={vi.pages.agents.title} desc={vi.pages.agents.desc} />
        <Panel className="flex flex-col items-center gap-3 px-4 py-10 text-center text-muted">
          <p>{t.noProject}</p>
          <Link to="/projects" className="font-semibold text-accent hover:underline">
            {t.goProjects}
          </Link>
        </Panel>
      </>
    )
  }
  return <AgentsLoader key={project.id} project={project} slots={slots} />
}

function AgentsLoader({ project, slots }: { project: Project; slots: AgentsAiSlots }) {
  const doc = useLiveQuery(() => getAgentsDoc(project.id), [project.id])
  useEffect(() => {
    if (doc.status === 'ready' && !doc.data) void ensureAgentsDoc(project.id)
  }, [doc, project.id])
  if (doc.status !== 'ready' || !doc.data) return <p className="text-muted">{vi.common.loading}</p>
  return <AgentsEditor key={doc.data.id} project={project} doc={doc.data} slots={slots} />
}

function AgentsEditor({
  project,
  doc,
  slots,
}: {
  project: Project
  doc: AgentsDoc
  slots: AgentsAiSlots
}) {
  const [sections, setSections] = useState<AgentsSection[]>(() => sortSections(doc.sections))
  const [selected, setSelected] = useState(sections[0]?.key ?? '')
  const [mode, setMode] = useState<AgentsMode>('edit')
  const [view, setView] = useState<'edit' | 'preview' | 'file'>('edit')
  const [newTitle, setNewTitle] = useState('')
  const [dragKey, setDragKey] = useState<string | null>(null)
  const toast = useToast()

  const sorted = sortSections(sections)
  const md = useMemo(() => renderAgentsMd(project.name, sections), [project.name, sections])
  const checks = useMemo(() => localChecks(project.name, sections), [project.name, sections])
  const dirty = JSON.stringify(sortSections(doc.sections)) !== JSON.stringify(sorted)
  const current = sorted.find((s) => s.key === selected) ?? sorted[0]
  const def = current ? getAgentsSection(current.key) : undefined

  const save = async () => {
    await saveAgentsDoc(doc, sorted, project.name)
    toast(t.saved)
  }
  useHotkey('mod+s', () => void save())

  const ctx: AgentsSlotContext = {
    project,
    sections: sorted,
    replaceSections: (s) => {
      setSections(sortSections(s))
      setMode('edit')
    },
    setSectionContent: (key, content) => setSections((s) => updateSection(s, key, { content })),
    setMode,
  }

  const modeButton = (m: AgentsMode, i: number) => (
    <button
      key={m}
      type="button"
      aria-pressed={mode === m}
      onClick={() => setMode(m)}
      className={cn(
        'h-8 cursor-pointer border px-3 text-[12.5px]',
        i === 0 ? 'rounded-l-md' : i === 2 ? 'rounded-r-md' : 'border-x-0',
        mode === m ? 'border-accent bg-accent text-on-accent' : 'border-border bg-surface',
      )}
    >
      {t.modes[m]}
    </button>
  )

  return (
    <>
      <PageHeader
        title={`${vi.pages.agents.title} – ${project.name}`}
        desc={vi.pages.agents.desc}
        aside={
          <div role="group" aria-label={t.modeLabel} className="flex">
            {(['wizard', 'free', 'edit'] as const).map(modeButton)}
          </div>
        }
      />

      {mode === 'wizard' && (slots.wizard?.(ctx) ?? <Soon />)}
      {mode === 'free' && (slots.free?.(ctx) ?? <Soon />)}

      {mode === 'edit' && current && (
        <div className="flex flex-wrap items-start gap-3.5">
          <Panel className="min-w-0 flex-[1_1_240px]">
            <PanelHeader>
              <h2 className="flex-1 text-sm font-semibold">{t.sectionsTitle}</h2>
              <span className="text-xs text-muted">
                {t.enabledCount(sorted.filter((s) => s.enabled).length, sorted.length)}
              </span>
            </PanelHeader>
            <ol className="flex flex-col gap-px p-1.5">
              {sorted.map((s, i) => (
                <li
                  key={s.key}
                  draggable
                  onDragStart={() => setDragKey(s.key)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragKey) setSections((list) => moveSection(list, dragKey, i))
                    setDragKey(null)
                  }}
                  className={cn(
                    'group flex items-center gap-0.5 rounded-md',
                    dragKey === s.key && 'opacity-50',
                  )}
                >
                  <GripVertical
                    className="size-3.5 shrink-0 cursor-grab text-muted"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => setSelected(s.key)}
                    aria-current={s.key === current.key ? 'true' : undefined}
                    className={cn(
                      'flex h-8 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md border px-2 text-left',
                      s.key === current.key
                        ? 'border-accent-line bg-accent-weak'
                        : 'border-transparent hover:bg-hover',
                      !s.enabled && 'text-muted line-through',
                    )}
                  >
                    <span className="w-4 text-[11px] text-muted">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate">{s.title}</span>
                    {isRequired(s.key) && <Tag tone="accent">{t.required}</Tag>}
                  </button>
                  <IconBtn
                    label={t.moveUp(s.title)}
                    disabled={i === 0}
                    onClick={() => setSections((l) => moveSection(l, s.key, i - 1))}
                  >
                    <ArrowUp className="size-3.5" aria-hidden="true" />
                  </IconBtn>
                  <IconBtn
                    label={t.moveDown(s.title)}
                    disabled={i === sorted.length - 1}
                    onClick={() => setSections((l) => moveSection(l, s.key, i + 1))}
                  >
                    <ArrowDown className="size-3.5" aria-hidden="true" />
                  </IconBtn>
                  {!isRequired(s.key) && (
                    <input
                      type="checkbox"
                      checked={s.enabled}
                      onChange={() => setSections((l) => toggleSection(l, s.key))}
                      aria-label={s.enabled ? t.disable(s.title) : t.enable(s.title)}
                      className="mx-1 size-[15px] accent-accent"
                    />
                  )}
                  {s.custom && (
                    <IconBtn
                      label={t.removeCustom(s.title)}
                      onClick={() => setSections((l) => removeSection(l, s.key))}
                    >
                      <Trash2 className="size-3.5 text-red-ink" aria-hidden="true" />
                    </IconBtn>
                  )}
                </li>
              ))}
            </ol>
            <form
              className="flex gap-1.5 border-t border-border p-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (!newTitle.trim()) return
                const next = addCustomSection(sections, newTitle)
                setSections(next)
                setSelected(sortSections(next).at(-1)!.key)
                setNewTitle('')
              }}
            >
              <input
                aria-label={t.customPlaceholder}
                placeholder={t.addCustom}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className={`${inputClass} h-8`}
              />
              <Button type="submit" size="sm" disabled={!newTitle.trim()}>
                {t.add}
              </Button>
            </form>
          </Panel>

          <Panel className="min-w-0 flex-[3_1_440px]">
            <PanelHeader>
              <h2 className="min-w-0 flex-[1_1_160px] truncate text-sm font-semibold">
                {sorted.indexOf(current) + 1}. {current.title}
              </h2>
              {slots.sectionActions?.({ ...ctx, section: current })}
              <div role="group" className="flex">
                {(['edit', 'preview', 'file'] as const).map((v, i) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={view === v}
                    onClick={() => setView(v)}
                    className={cn(
                      'h-7 cursor-pointer border px-2.5 text-xs',
                      i === 0 ? 'rounded-l-md' : i === 2 ? 'rounded-r-md' : 'border-x-0',
                      view === v ? 'border-ink bg-ink text-surface' : 'border-border bg-surface',
                    )}
                  >
                    {v === 'edit' ? t.edit : v === 'preview' ? t.preview : t.previewFile}
                  </button>
                ))}
              </div>
            </PanelHeader>
            <div className="flex flex-col gap-2.5 p-3.5">
              {current.custom && view === 'edit' && (
                <input
                  aria-label={t.sectionTitle}
                  value={current.title}
                  onChange={(e) =>
                    setSections((l) => updateSection(l, current.key, { title: e.target.value }))
                  }
                  className={`${inputClass} h-9 font-semibold`}
                />
              )}
              <Suspense fallback={<p className="text-muted">{vi.common.loading}</p>}>
                {view === 'edit' && (
                  <MarkdownEditor
                    key={current.key}
                    label={t.content}
                    value={current.content}
                    onChange={(v) =>
                      setSections((l) => updateSection(l, current.key, { content: v }))
                    }
                  />
                )}
                {view === 'preview' && <MarkdownPreview source={current.content} />}
                {view === 'file' && <MarkdownPreview source={md} />}
              </Suspense>
              {def && <p className="text-xs text-muted">{def.hint}</p>}
            </div>
          </Panel>

          <Panel className="min-w-0 flex-[1_1_260px]">
            <PanelHeader>
              <h2 className="flex-1 text-sm font-semibold">{t.checksTitle}</h2>
              <span className="text-xs text-muted">{t.checksHint}</span>
            </PanelHeader>
            <div className="flex flex-col gap-2.5 p-3.5">
              <ul aria-label={t.checksTitle} className="flex flex-col gap-1.5">
                {checks.map((c) => (
                  <li key={c.text} className="flex gap-2 text-[12.5px] leading-snug">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'w-3.5 shrink-0 font-bold',
                        c.level === 'ok'
                          ? 'text-green-ink'
                          : c.level === 'warn'
                            ? 'text-warn-ink'
                            : 'text-red-ink',
                      )}
                    >
                      {c.level === 'ok' ? '✓' : '!'}
                    </span>
                    {c.sectionKey ? (
                      <button
                        type="button"
                        className="cursor-pointer text-left hover:underline"
                        onClick={() => setSelected(c.sectionKey!)}
                      >
                        {c.text}
                      </button>
                    ) : (
                      <span>{c.text}</span>
                    )}
                  </li>
                ))}
              </ul>
              {slots.checkActions?.(ctx)}
              <div className="h-px bg-border" />
              <Button variant="primary" onClick={() => void save()} disabled={!dirty}>
                <Save className="size-3.5" aria-hidden="true" />
                {t.save}
                <Kbd className="border-current bg-transparent text-current">Ctrl+S</Kbd>
                {dirty && <span className="sr-only">({t.unsaved})</span>}
              </Button>
              {dirty && (
                <Tag tone="warn" className="self-start">
                  {t.unsaved}
                </Tag>
              )}
              <Button
                onClick={() => {
                  downloadFile('AGENTS.md', md, 'text/markdown;charset=utf-8')
                  toast(t.downloaded('AGENTS.md'))
                }}
              >
                <Download className="size-3.5" aria-hidden="true" />
                {t.downloadMd}
              </Button>
              <Button
                onClick={() => {
                  downloadFile('agents-md.zip', buildAgentsZip(md), 'application/zip')
                  toast(t.downloaded('agents-md.zip'))
                }}
              >
                <Package className="size-3.5" aria-hidden="true" />
                {t.downloadZip}
              </Button>
              <Button
                onClick={async () => toast((await copyText(md)) ? t.copied : vi.builder.copyFailed)}
              >
                <Copy className="size-3.5" aria-hidden="true" />
                {t.copy}
              </Button>
            </div>
          </Panel>
        </div>
      )}
    </>
  )
}

function Soon() {
  return <Panel className="px-4 py-10 text-center text-muted">{t.soon}</Panel>
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-hover hover:text-ink disabled:cursor-default disabled:opacity-30"
    >
      {children}
    </button>
  )
}
