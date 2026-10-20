import { FolderOpen } from 'lucide-react'
import { useState } from 'react'
import { Button, Panel, PanelHeader } from '@/components/Primitives'
import { useToast } from '@/components/toast-context'
import { folderSupported, hasPermission, pickFolder } from '@/lib/folder/fs'
import { codeFolderKey, saveFolder } from '@/lib/folder/store'
import { describeFolderError, requestSync, stopFolder } from '@/lib/folder/sync'
import { vi } from '@/lib/i18n/vi'
import { FolderStatusLine } from './FolderStatusLine'
import { useFolder } from './use-folders'

const t = vi.folder

/** M2 – "Thư mục code": ghi thẳng AGENTS.md / CLAUDE.md vào thư mục code của dự án (task 15). */
export function CodeFolderPanel({ projectId }: { projectId: string }) {
  const key = codeFolderKey(projectId)
  const folder = useFolder(key)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const choose = async () => {
    setError(null)
    try {
      const dir = await pickFolder('prompt-studio-code')
      if (!dir) return
      if (!(await hasPermission(dir, true))) return setError(t.errDenied)
      await saveFolder({ key, handle: dir, written: {} })
      await requestSync()
      toast(t.codeChosen(dir.name))
    } catch (err) {
      setError(describeFolderError(err))
    }
  }

  return (
    <Panel className="min-w-0 flex-[1_1_260px]">
      <PanelHeader>
        <h2 className="text-sm font-semibold">{t.codeTitle}</h2>
      </PanelHeader>
      <div className="flex flex-col gap-2.5 p-3.5">
        <p className="text-xs leading-normal text-muted">{t.codeNote}</p>
        {!folderSupported() ? (
          <p className="text-xs text-warn-ink">{t.unsupported}</p>
        ) : (
          <>
            {folder && (
              <div className="flex flex-col gap-1">
                <p className="font-semibold">{t.folderName(folder.handle.name)}</p>
                <FolderStatusLine folderKey={key} handle={folder.handle} />
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" onClick={() => void choose()}>
                <FolderOpen className="size-3.5" aria-hidden="true" />
                {folder ? t.change : t.codeChoose}
              </Button>
              {folder && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={async () => {
                    await stopFolder(key)
                    toast(t.codeUnlinked)
                  }}
                >
                  {t.codeUnlink}
                </Button>
              )}
            </div>
          </>
        )}
        {error && (
          <p role="alert" className="text-xs text-red-ink">
            {error}
          </p>
        )}
      </div>
    </Panel>
  )
}
