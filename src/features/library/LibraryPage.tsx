import { Pin, PinOff } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Dialog } from '@/components/Dialog'
import { Button, PageHeader, Panel, Tag } from '@/components/Primitives'
import { useToast } from '@/components/toast-context'
import { useUsePrompt } from '@/components/use-prompt-context'
import type { BuilderLocationState } from '@/features/task-prompt/PromptBuilderPage'
import { useCurrentProject, usePrompts, useSettings } from '@/lib/db/hooks'
import { deletePrompt, togglePin } from '@/lib/db/prompts'
import { vi } from '@/lib/i18n/vi'
import { savedItem, stdItems, type LibraryItem } from '@/lib/library'
import type { PromptForm } from '@/lib/prompts/build-prompt'
import { getPromptType } from '@/lib/prompts/prompt-types'
import { EXTENSION_PATHS } from '@/lib/prompts/standard-process'
import { PROMPT_TYPE_CODES, type PromptTypeCode } from '@/lib/prompts/types'
import { parseVariables } from '@/lib/prompts/variables'
import { PHASES } from '@/lib/phases'
import { cn } from '@/lib/utils'
import type { SavedPrompt } from '@/types/models'
import { EditPromptDialog } from './EditPromptDialog'

const t = vi.library
type Tab = 'std' | 'proj' | 'shared'
const TABS: Tab[] = ['std', 'proj', 'shared']
const th =
  'whitespace-nowrap border-b border-border bg-soft px-3 py-2 text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted'
const td = 'border-b border-border px-3 py-2 align-middle'

const typeName = (code: string) =>
  (PROMPT_TYPE_CODES as readonly string[]).includes(code)
    ? getPromptType(code as PromptTypeCode).name
    : code

const stepName = (s: number | 'spike') => (s === 'spike' ? t.spike : `${s} ${PHASES[s]}`)

/** M8 – Thư viện: Quy trình chuẩn (chỉ đọc), Của dự án, Dùng chung. */
export function LibraryPage() {
  const [params, setParams] = useSearchParams()
  const tab: Tab = TABS.includes(params.get('tab') as Tab) ? (params.get('tab') as Tab) : 'std'
  const [tagFilter, setTagFilter] = useState('')
  const [editing, setEditing] = useState<SavedPrompt | null>(null)
  const [deleting, setDeleting] = useState<SavedPrompt | null>(null)
  const current = useCurrentProject()
  const project = current.status === 'ready' ? current.data : null
  const prompts = usePrompts(tab === 'proj' ? (project?.id ?? '__none__') : null)
  const settings = useSettings()
  const pins = settings.status === 'ready' ? settings.data.pins : []
  const use = useUsePrompt()
  const toast = useToast()
  const navigate = useNavigate()

  const items: LibraryItem[] =
    tab === 'std' ? stdItems() : prompts.status === 'ready' ? prompts.data.map(savedItem) : []
  const allTags = [...new Set(items.flatMap((i) => i.tags))].sort()
  const shown = tagFilter ? items.filter((i) => i.tags.includes(tagFilter)) : items

  const openForm = (item: LibraryItem) => {
    const code = (PROMPT_TYPE_CODES as readonly string[]).includes(item.typeCode)
      ? item.typeCode
      : 'TU_DO'
    const form = item.saved?.formState as PromptForm | undefined
    const state: BuilderLocationState = form?.typeCode === code ? { form } : {}
    navigate(`/prompt/${code}`, { state })
  }

  const pin = async (item: LibraryItem) =>
    toast((await togglePin(item.pinId)) ? t.pinned : t.unpinned)

  return (
    <>
      <PageHeader title={vi.pages.library.title} desc={vi.pages.library.desc} />
      <Panel>
        <div role="tablist" className="flex flex-wrap gap-0.5 border-b border-border px-2">
          {TABS.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              onClick={() => {
                setParams({ tab: k })
                setTagFilter('')
              }}
              className={cn(
                'h-9 cursor-pointer border-b-2 px-3',
                tab === k
                  ? 'border-accent font-semibold text-ink'
                  : 'border-transparent text-muted',
              )}
            >
              {t.tabs[k]}
            </button>
          ))}
          {allTags.length > 0 && (
            <select
              aria-label={t.filterTag}
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="my-1 ml-auto h-7 rounded-md border border-border bg-surface px-2 text-xs"
            >
              <option value="">{t.allTags}</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          )}
        </div>

        {tab === 'std' && (
          <div className="flex flex-col gap-2 border-b border-border px-3.5 py-3">
            <h2 className="text-[13px] font-semibold">{t.extTitle}</h2>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {t.extCols.map((c) => (
                      <th key={c} className={th}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EXTENSION_PATHS.map((p) => (
                    <tr key={p.size} className="last:[&>td]:border-b-0">
                      <td className={`${td} font-semibold`}>{p.name}</td>
                      <td className={`${td} text-muted`}>{p.example}</td>
                      <td className={td}>{p.steps.map(stepName).join(' → ')}</td>
                      <td className={`${td} whitespace-nowrap text-muted`}>
                        GĐ {p.skip.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'proj' && !project ? (
          <p className="p-6 text-center text-muted">{t.noProject}</p>
        ) : tab !== 'std' && prompts.status === 'loading' ? (
          <p className="p-6 text-center text-muted">{vi.common.loading}</p>
        ) : tab !== 'std' && prompts.status === 'error' ? (
          <p role="alert" className="p-6 text-center text-red-ink">
            {vi.common.dbError}
          </p>
        ) : shown.length === 0 ? (
          <p className="p-6 text-center text-muted">{t.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>{t.cols.title}</th>
                  <th className={th}>{t.cols.type}</th>
                  <th className={th}>{t.cols.vars}</th>
                  <th className={`${th} text-right`}>{t.cols.actions}</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((item) => {
                  const isPinned = pins.includes(item.pinId)
                  return (
                    <tr key={item.pinId} className="last:[&>td]:border-b-0 hover:[&>td]:bg-hover">
                      <td className={`${td} min-w-[260px]`}>
                        <span className="font-semibold">{item.title}</span>
                        {item.desc && <div className="mt-0.5 text-xs text-muted">{item.desc}</div>}
                        {item.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.tags.map((tag) => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className={`${td} whitespace-nowrap`}>
                        <Tag tone="accent">{typeName(item.typeCode)}</Tag>
                      </td>
                      <td className={`${td} whitespace-nowrap text-muted`}>
                        {t.varsCount(parseVariables(item.body).length)}
                      </td>
                      <td className={`${td} whitespace-nowrap text-right`}>
                        <div className="inline-flex flex-wrap justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void pin(item)}
                            aria-label={`${isPinned ? t.unpin : t.pin} ${item.title}`}
                            title={isPinned ? t.unpin : t.pin}
                          >
                            {isPinned ? (
                              <PinOff className="size-3.5" aria-hidden="true" />
                            ) : (
                              <Pin className="size-3.5" aria-hidden="true" />
                            )}
                            {isPinned ? t.unpin : t.pin}
                          </Button>
                          {item.saved && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditing(item.saved!)}
                              >
                                {t.edit}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-ink"
                                onClick={() => setDeleting(item.saved!)}
                              >
                                {t.delete}
                              </Button>
                            </>
                          )}
                          <Button size="sm" onClick={() => openForm(item)}>
                            {t.openForm}
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => use(item)}
                            aria-label={`${t.use} ${item.title}`}
                          >
                            {t.use}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {editing && <EditPromptDialog prompt={editing} onClose={() => setEditing(null)} />}
      <Dialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={deleting ? t.deleteTitle(deleting.title) : ''}
        description={t.deleteDesc}
        footer={
          <>
            <Button onClick={() => setDeleting(null)}>{vi.projects.cancel}</Button>
            <Button
              variant="dangerSolid"
              onClick={async () => {
                if (deleting) await deletePrompt(deleting.id)
                setDeleting(null)
                toast(t.deleted)
              }}
            >
              {t.deleteConfirm}
            </Button>
          </>
        }
      />
    </>
  )
}
