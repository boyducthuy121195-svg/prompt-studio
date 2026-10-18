import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router'
import { backupReminderDays } from '@/lib/backup'
import { useProjects, useSettings } from '@/lib/db/hooks'
import { vi } from '@/lib/i18n/vi'

/** Banner nhắc sao lưu trên trang Dự án khi đã quá 7 ngày. */
export function BackupReminder() {
  const settings = useSettings()
  const projects = useProjects()
  if (settings.status !== 'ready' || projects.status !== 'ready' || !projects.data.length)
    return null
  const first = Math.min(...projects.data.map((p) => p.createdAt))
  const days = backupReminderDays(settings.data.lastBackupAt, first)
  if (days === null) return null
  return (
    <div
      role="note"
      className="mb-3.5 flex flex-wrap items-center gap-2.5 rounded-[10px] border border-warn-line bg-warn-bg px-3.5 py-2 text-warn-ink"
    >
      <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
      <span className="flex-[1_1_300px]">{vi.backup.reminder(days)}</span>
      <Link
        to="/settings#backup"
        className="inline-flex h-7 items-center rounded-md border border-border bg-surface px-2.5 text-xs font-medium text-ink hover:bg-hover"
      >
        {vi.backup.reminderAction}
      </Link>
    </div>
  )
}
