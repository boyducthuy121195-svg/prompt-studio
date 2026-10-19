import { Button } from '@/components/Primitives'
import { formatRelativeTime } from '@/lib/format'
import { hasPermission } from '@/lib/folder/fs'
import { requestSync } from '@/lib/folder/sync'
import { vi } from '@/lib/i18n/vi'
import { cn } from '@/lib/utils'
import { useFolderStatus } from './use-folders'

const t = vi.folder

/** Một dòng trạng thái ghi của thư mục, kèm nút "Cho phép ghi" khi trình duyệt cần hỏi lại quyền. */
export function FolderStatusLine({
  folderKey,
  handle,
}: {
  folderKey: string
  handle: FileSystemDirectoryHandle
}) {
  const status = useFolderStatus(folderKey)

  const text = !status
    ? t.statusPending
    : status.kind === 'ok'
      ? t.statusOk(formatRelativeTime(status.at)) +
        (status.backups.length ? ` ${t.codeBackups(status.backups.join(', '))}` : '')
      : status.kind === 'empty'
        ? t.statusEmpty
        : status.kind === 'noDoc'
          ? t.codeNoDoc
          : status.kind === 'permission'
            ? t.statusPermission
            : status.message

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p
        className={cn(
          'text-xs',
          status?.kind === 'ok' && 'text-green-ink',
          status?.kind === 'error' && 'text-red-ink',
          status?.kind === 'permission' && 'text-warn-ink',
          (!status || status.kind === 'empty' || status.kind === 'noDoc') && 'text-muted',
        )}
      >
        {text}
      </p>
      {status?.kind === 'permission' && (
        <Button
          size="sm"
          variant="primary"
          onClick={async () => {
            if (await hasPermission(handle, true)) await requestSync()
          }}
        >
          {t.allow}
        </Button>
      )}
    </div>
  )
}
