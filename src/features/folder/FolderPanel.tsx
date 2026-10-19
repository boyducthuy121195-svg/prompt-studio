import { FolderDown, FolderOpen } from 'lucide-react'
import { useState } from 'react'
import { Dialog } from '@/components/Dialog'
import { Button, Panel, PanelHeader } from '@/components/Primitives'
import { useToast } from '@/components/toast-context'
import { backupSummary, type BackupFile } from '@/lib/backup'
import { formatRelativeTime } from '@/lib/format'
import { folderSupported, hasPermission, pickFolder } from '@/lib/folder/fs'
import { DATA_FOLDER } from '@/lib/folder/store'
import {
  describeFolderError,
  inspectDataFolder,
  loadFromFolder,
  setDataFolder,
  stopFolder,
} from '@/lib/folder/sync'
import { vi } from '@/lib/i18n/vi'
import { FolderStatusLine } from './FolderStatusLine'
import { useFolder } from './use-folders'

const t = vi.folder

/** Khối "Lưu ra thư mục trên máy" trong Cài đặt (task 15). */
export function FolderPanel() {
  const folder = useFolder(DATA_FOLDER)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<{
    dir: FileSystemDirectoryHandle
    backup: BackupFile
  } | null>(null)
  const toast = useToast()
  const supported = folderSupported()

  /** `mode = 'choose'`: dùng thư mục trống; `'load'`: chỉ nhận thư mục đã có dữ liệu. Có dữ liệu thì luôn hỏi trước. */
  const pick = async (mode: 'choose' | 'load') => {
    setError(null)
    try {
      const dir = await pickFolder('prompt-studio-data')
      if (!dir) return
      if (!(await hasPermission(dir, true))) return setError(t.errDenied)
      const found = await inspectDataFolder(dir)
      if (found.kind === 'data') return setPending({ dir, backup: found.backup })
      if (found.kind === 'bad') return setError(t.errBadData)
      if (mode === 'load') return setError(t.errNoData)
      if (found.kind === 'other') return setError(t.errNotEmpty)
      await setDataFolder(dir)
      toast(t.chosen(dir.name))
    } catch (err) {
      setError(describeFolderError(err))
    }
  }

  const counts = pending ? backupSummary(pending.backup) : null

  return (
    <Panel id="folder">
      <PanelHeader>
        <h2 className="flex-1 text-sm font-semibold">{t.title}</h2>
      </PanelHeader>
      <div className="flex flex-col gap-3 p-3.5">
        <p className="text-xs leading-normal text-muted">{t.note}</p>
        {!supported ? (
          <p className="rounded-md border border-warn-line bg-warn-bg px-2.5 py-1.5 text-xs text-warn-ink">
            {t.unsupported}
          </p>
        ) : (
          <>
            {folder && (
              <div className="flex flex-col gap-1">
                <p className="font-semibold">{t.folderName(folder.handle.name)}</p>
                <FolderStatusLine folderKey={DATA_FOLDER} handle={folder.handle} />
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              <Button variant={folder ? 'default' : 'primary'} onClick={() => void pick('choose')}>
                <FolderOpen className="size-3.5" aria-hidden="true" />
                {folder ? t.change : t.choose}
              </Button>
              <Button onClick={() => void pick('load')}>
                <FolderDown className="size-3.5" aria-hidden="true" />
                {t.load}
              </Button>
              {folder && (
                <Button
                  variant="danger"
                  onClick={async () => {
                    await stopFolder(DATA_FOLDER)
                    toast(t.stopped)
                  }}
                >
                  {t.stop}
                </Button>
              )}
            </div>
          </>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-md border border-red-ink/30 bg-red-bg px-3 py-2 text-red-ink"
          >
            {error}
          </p>
        )}
      </div>

      <Dialog
        open={pending !== null}
        onOpenChange={(o) => !o && setPending(null)}
        title={t.loadTitle}
        description={
          pending
            ? t.loadDesc(pending.dir.name, formatRelativeTime(pending.backup.exportedAt))
            : undefined
        }
        footer={
          <>
            <Button onClick={() => setPending(null)}>{t.cancel}</Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (!pending) return
                try {
                  await loadFromFolder(pending.dir, pending.backup)
                  toast(t.loaded)
                } catch (err) {
                  setError(describeFolderError(err))
                }
                setPending(null)
              }}
            >
              {t.loadConfirm}
            </Button>
          </>
        }
      >
        {counts && (
          <div className="flex flex-col gap-2 px-[18px] py-3">
            <p className="font-semibold">
              {vi.backup.previewCounts(counts.projects, counts.prompts, counts.agentsDocs)}
            </p>
            <p className="text-muted">{t.loadKeys}</p>
            <p className="text-red-ink">{t.loadWarning}</p>
          </div>
        )}
      </Dialog>
    </Panel>
  )
}
