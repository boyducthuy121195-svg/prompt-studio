import { FolderLock } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { Button } from '@/components/Primitives'
import { hasPermission } from '@/lib/folder/fs'
import { getFolderStatus, getStatusVersion, onFolderStatus, requestSync } from '@/lib/folder/sync'
import { vi } from '@/lib/i18n/vi'
import { useFolders } from './use-folders'

const t = vi.folder

/** Mở lại trình duyệt thì quyền ghi thư mục phải xin lại bằng một cú bấm: nhắc ở đầu mọi trang. */
export function FolderPermissionBanner() {
  const folders = useFolders()
  // Vẽ lại mỗi khi trạng thái ghi thay đổi
  useSyncExternalStore(onFolderStatus, getStatusVersion)
  const waiting = (folders ?? []).filter((r) => getFolderStatus(r.key)?.kind === 'permission')
  if (!waiting.length) return null

  return (
    <div
      aria-live="polite"
      className="flex flex-wrap items-center gap-2.5 rounded-md border border-warn-line bg-warn-bg px-3 py-2 text-warn-ink"
    >
      <FolderLock className="size-4 shrink-0" aria-hidden="true" />
      <span className="flex-[1_1_300px]">
        {t.bannerText(waiting.map((r) => `"${r.handle.name}"`).join(', '))}
      </span>
      <Button
        size="sm"
        onClick={async () => {
          for (const r of waiting) await hasPermission(r.handle, true)
          await requestSync()
        }}
      >
        {t.allow}
      </Button>
    </div>
  )
}
