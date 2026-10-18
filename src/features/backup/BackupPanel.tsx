import { AlertTriangle, Download, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { CheckOption } from '@/components/CheckOption'
import { Dialog } from '@/components/Dialog'
import { Button, Panel, PanelHeader } from '@/components/Primitives'
import { useToast } from '@/components/toast-context'
import {
  backupFileName,
  backupSummary,
  createBackup,
  parseBackup,
  restoreBackup,
  wipeAllData,
  type BackupFile,
} from '@/lib/backup'
import { useSettings } from '@/lib/db/hooks'
import { updateSettings } from '@/lib/db/settings'
import { downloadFile } from '@/lib/download'
import { formatRelativeTime } from '@/lib/format'
import { vi } from '@/lib/i18n/vi'

const t = vi.backup

/** Khối "Sao lưu và khôi phục" trong Cài đặt (task 12). */
export function BackupPanel() {
  const settings = useSettings()
  const lastBackupAt = settings.status === 'ready' ? settings.data.lastBackupAt : null
  const [includeKeys, setIncludeKeys] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<BackupFile | null>(null)
  const [wipeStep, setWipeStep] = useState<0 | 1 | 2>(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const { hash } = useLocation()

  useEffect(() => {
    if (hash === '#backup') document.getElementById('backup')?.scrollIntoView?.({ block: 'start' })
  }, [hash])

  const download = async () => {
    const now = Date.now()
    const backup = await createBackup({ includeKeys }, now)
    downloadFile(backupFileName(now), JSON.stringify(backup, null, 2), 'application/json')
    await updateSettings({ lastBackupAt: now })
    toast(t.downloaded)
  }

  const pick = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    let text: string
    try {
      text = await file.text()
    } catch {
      setError(t.readError)
      return
    }
    const result = parseBackup(text)
    if (result.ok) setPending(result.backup)
    else setError(result.reason === 'json' ? t.badJson : t.badFormat)
  }

  const counts = pending ? backupSummary(pending) : null

  return (
    <Panel id="backup">
      <PanelHeader>
        <h2 className="flex-1 text-sm font-semibold">{t.title}</h2>
      </PanelHeader>
      <div className="flex flex-col gap-3 p-3.5">
        <p className="text-xs leading-normal text-muted">
          {lastBackupAt ? t.last(formatRelativeTime(lastBackupAt)) : t.never} {t.note}
        </p>
        <CheckOption
          checked={includeKeys}
          onChange={() => setIncludeKeys((v) => !v)}
          label={t.includeKeys}
        />
        {includeKeys && (
          <p
            role="note"
            className="flex items-start gap-2 rounded-md border border-warn-line bg-warn-bg px-2.5 py-1.5 text-xs text-warn-ink"
          >
            <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            {t.keysWarning}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          <Button variant="primary" onClick={() => void download()}>
            <Download className="size-3.5" aria-hidden="true" />
            {t.download}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            aria-label={t.restoreFile}
            onChange={(e) => {
              void pick(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <Button onClick={() => fileRef.current?.click()}>
            <Upload className="size-3.5" aria-hidden="true" />
            {t.restore}
          </Button>
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-md border border-red-ink/30 bg-red-bg px-3 py-2 text-red-ink"
          >
            {error}
          </p>
        )}
        <div className="h-px bg-border" />
        <Button variant="danger" className="self-start" onClick={() => setWipeStep(1)}>
          {t.wipe}
        </Button>
      </div>

      <Dialog
        open={pending !== null}
        onOpenChange={(o) => !o && setPending(null)}
        title={t.previewTitle}
        description={pending ? t.previewDesc(formatRelativeTime(pending.exportedAt)) : undefined}
        footer={
          <>
            <Button onClick={() => setPending(null)}>{t.cancel}</Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (pending) await restoreBackup(pending)
                setPending(null)
                toast(t.restored)
              }}
            >
              {t.restoreConfirm}
            </Button>
          </>
        }
      >
        {pending && counts && (
          <div className="flex flex-col gap-2 px-[18px] py-3">
            <p className="font-semibold">
              {t.previewCounts(counts.projects, counts.prompts, counts.agentsDocs)}
            </p>
            <p className="text-muted">{t.previewKeys(pending.includesKeys)}</p>
            <p className="text-red-ink">{t.previewWarning}</p>
          </div>
        )}
      </Dialog>

      <Dialog
        open={wipeStep === 1}
        onOpenChange={(o) => !o && setWipeStep(0)}
        title={t.wipe1Title}
        description={t.wipe1Desc}
        footer={
          <>
            <Button onClick={() => setWipeStep(0)}>{t.cancel}</Button>
            <Button variant="danger" onClick={() => setWipeStep(2)}>
              {t.wipe1Next}
            </Button>
          </>
        }
      />
      <Dialog
        open={wipeStep === 2}
        onOpenChange={(o) => !o && setWipeStep(0)}
        title={t.wipe2Title}
        description={t.wipe2Desc}
        footer={
          <>
            <Button onClick={() => setWipeStep(0)}>{t.cancel}</Button>
            <Button
              variant="dangerSolid"
              onClick={async () => {
                await wipeAllData()
                setWipeStep(0)
                toast(t.wiped)
              }}
            >
              {t.wipe2Confirm}
            </Button>
          </>
        }
      />
    </Panel>
  )
}
