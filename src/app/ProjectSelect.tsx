import { useProjects, useSettings } from '@/lib/db/hooks'
import { updateSettings } from '@/lib/db/settings'
import { vi } from '@/lib/i18n/vi'

const SHARED = ''

/** Ô chọn "dự án đang chọn" trên header – mọi chức năng làm việc theo dự án này. */
export function ProjectSelect() {
  const projects = useProjects()
  const settings = useSettings()
  const list = projects.status === 'ready' ? projects.data : []
  const current = settings.status === 'ready' ? (settings.data.currentProjectId ?? SHARED) : SHARED
  // Dự án đang chọn đã bị xóa ở tab khác: coi như dùng chung
  const value = list.some((p) => p.id === current) ? current : SHARED

  return (
    <>
      <label htmlFor="project-select" className="text-xs text-muted">
        {vi.header.project}
      </label>
      <select
        id="project-select"
        className="h-9 min-w-[200px] max-w-full rounded-md border border-border bg-surface px-2.5 text-ink"
        value={value}
        onChange={(e) => void updateSettings({ currentProjectId: e.target.value || null })}
      >
        {list.length === 0 && (
          <option value="none" disabled>
            {vi.header.noProjectYet}
          </option>
        )}
        {list.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
        <option value={SHARED}>{vi.header.sharedScope}</option>
      </select>
    </>
  )
}
