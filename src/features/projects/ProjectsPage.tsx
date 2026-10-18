import { FolderPlus, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button, PageHeader, Panel, Tag } from '@/components/Primitives'
import { useProjects, useProjectStats } from '@/lib/db/hooks'
import { formatRelativeTime } from '@/lib/format'
import { vi } from '@/lib/i18n/vi'
import { phaseLabel } from '@/lib/phases'
import { NewProjectDialog } from './NewProjectDialog'

const t = vi.projects
const th =
  'whitespace-nowrap border-b border-border bg-soft px-3 py-2 text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted'
const td = 'border-b border-border px-3 py-2 align-middle'

/** M1 – danh sách dự án dạng bảng. */
export function ProjectsPage() {
  const projects = useProjects()
  const stats = useProjectStats()
  const [creating, setCreating] = useState(false)

  const newButton = (
    <Button variant="primary" onClick={() => setCreating(true)}>
      <Plus className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
      {t.newProject}
    </Button>
  )

  return (
    <>
      <PageHeader title={vi.pages.projects.title} desc={vi.pages.projects.desc} aside={newButton} />

      {projects.status === 'error' && (
        <p role="alert" className="text-red-ink">
          {t.loadError}
        </p>
      )}

      {projects.status === 'ready' && projects.data.length === 0 && (
        <Panel className="flex flex-col items-center gap-3 px-4 py-12 text-center text-muted">
          <FolderPlus className="size-7" aria-hidden="true" />
          <p>{t.empty}</p>
          {newButton}
        </Panel>
      )}

      {projects.status === 'ready' && projects.data.length > 0 && (
        <Panel className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>{t.cols.name}</th>
                <th className={th}>{t.cols.desc}</th>
                <th className={th}>{t.cols.phase}</th>
                <th className={th}>{t.cols.agents}</th>
                <th className={th}>{t.cols.prompts}</th>
                <th className={th}>{t.cols.updated}</th>
                <th className={th}>
                  <span className="sr-only">{t.cols.actions}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.data.map((p) => {
                const s = stats.status === 'ready' ? stats.data[p.id] : undefined
                return (
                  <tr key={p.id} className="last:[&>td]:border-b-0 hover:[&>td]:bg-hover">
                    <td className={`${td} whitespace-nowrap`}>
                      <Link
                        to={`/projects/${p.id}`}
                        className="font-semibold text-accent hover:underline"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className={`${td} min-w-[240px] text-muted`}>{p.description}</td>
                    <td className={`${td} whitespace-nowrap`}>
                      <Tag tone="accent">{phaseLabel(p.currentPhase)}</Tag>
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      {s?.agentsSections != null ? t.agentsCount(s.agentsSections) : t.agentsNone}
                    </td>
                    <td className={td}>{s?.prompts ?? 0}</td>
                    <td className={`${td} whitespace-nowrap text-muted`}>
                      {formatRelativeTime(p.updatedAt)}
                    </td>
                    <td className={`${td} whitespace-nowrap text-right`}>
                      <Link
                        to={`/projects/${p.id}`}
                        className="inline-flex h-7 items-center rounded-md border border-border bg-surface px-2.5 text-xs font-medium hover:bg-hover"
                        aria-label={`${t.open} ${p.name}`}
                      >
                        {t.open}
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Panel>
      )}

      <NewProjectDialog open={creating} onOpenChange={setCreating} />
    </>
  )
}
