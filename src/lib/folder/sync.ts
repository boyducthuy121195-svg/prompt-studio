import { createBackup, parseBackup, restoreBackup, type BackupFile } from '@/lib/backup'
import { vi } from '@/lib/i18n/vi'
import { agentsFiles, buildDataFolderFiles, DATA_FILE, isEmptyData } from './files'
import { hasEntries, hasPermission, readTextFile, syncCodeFolder, syncFolder } from './fs'
import {
  DATA_FOLDER,
  listFolders,
  projectIdOf,
  removeFolder,
  saveFolder,
  updateWritten,
} from './store'

const t = vi.folder

/** Trạng thái lần ghi gần nhất của một thư mục. */
export type FolderStatus =
  | { kind: 'ok'; at: number; backups: string[] }
  /** Mở lại trình duyệt: cần người dùng bấm nút để cho phép ghi tiếp. */
  | { kind: 'permission' }
  /** Thư mục dữ liệu: app đang trống nên không ghi. */
  | { kind: 'empty' }
  /** Thư mục code: dự án chưa có AGENTS.md. */
  | { kind: 'noDoc' }
  | { kind: 'error'; message: string }

const statuses = new Map<string, FolderStatus>()
const statusListeners = new Set<() => void>()
let statusVersion = 0

export const getFolderStatus = (key: string): FolderStatus | undefined => statuses.get(key)
/** Tăng mỗi lần có trạng thái mới – dùng với `useSyncExternalStore`. */
export const getStatusVersion = () => statusVersion
export function onFolderStatus(fn: () => void): () => void {
  statusListeners.add(fn)
  return () => void statusListeners.delete(fn)
}
function setStatus(key: string, s: FolderStatus | null) {
  if (s) statuses.set(key, s)
  else statuses.delete(key)
  statusVersion++
  statusListeners.forEach((fn) => fn())
}
/** Chỉ dùng trong test. */
export function resetFolderStatuses() {
  statuses.clear()
  statusVersion++
}

export function describeFolderError(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotFoundError') return t.errNotFound
    if (err.name === 'NotAllowedError' || err.name === 'SecurityError') return t.errNotAllowed
    if (err.name === 'QuotaExceededError') return t.errFull
  }
  return t.errWrite(err instanceof Error ? err.message : String(err))
}

async function syncOnce(): Promise<void> {
  const records = await listFolders()
  if (!records.length) return
  const backup = await createBackup()
  for (const rec of records) {
    try {
      const projectId = projectIdOf(rec.key)
      const project = projectId ? backup.data.projects.find((p) => p.id === projectId) : undefined
      if (projectId && !project) {
        // Dự án đã bị xóa: bỏ luôn liên kết thư mục code của nó
        await removeFolder(rec.key)
        setStatus(rec.key, null)
        continue
      }
      if (!(await hasPermission(rec.handle))) {
        setStatus(rec.key, { kind: 'permission' })
        continue
      }
      if (rec.key === DATA_FOLDER) {
        if (isEmptyData(backup)) {
          setStatus(rec.key, { kind: 'empty' })
          continue
        }
        await syncFolder(rec.handle, buildDataFolderFiles(backup))
        setStatus(rec.key, { kind: 'ok', at: Date.now(), backups: [] })
      } else if (project) {
        const doc = backup.data.agentsDocs.find((d) => d.projectId === project.id)
        if (!doc) {
          setStatus(rec.key, { kind: 'noDoc' })
          continue
        }
        const r = await syncCodeFolder(
          rec.handle,
          agentsFiles(project.name, doc.sections),
          rec.written ?? {},
        )
        await updateWritten(rec.key, r.written)
        const prev = statuses.get(rec.key)
        const kept = prev?.kind === 'ok' ? prev.backups : []
        setStatus(rec.key, { kind: 'ok', at: Date.now(), backups: [...kept, ...r.backups] })
      }
    } catch (err) {
      setStatus(rec.key, { kind: 'error', message: describeFolderError(err) })
    }
  }
}

let running: Promise<void> | null = null
let again = false

/**
 * Ghi dữ liệu hiện tại ra mọi thư mục đã chọn (một chiều: app → thư mục).
 * Gọi dồn dập thì chỉ chạy lần lượt, lần cuối luôn dùng dữ liệu mới nhất.
 */
export function requestSync(): Promise<void> {
  if (running) {
    again = true
    return running
  }
  running = (async () => {
    do {
      again = false
      await syncOnce()
    } while (again)
  })().finally(() => {
    running = null
  })
  return running
}

/** Trong thư mục vừa chọn có gì. */
export type FolderContents =
  | { kind: 'empty' }
  | { kind: 'data'; backup: BackupFile }
  /** Có file dữ liệu nhưng hỏng / không đúng định dạng. */
  | { kind: 'bad' }
  /** Có file khác, không phải thư mục dữ liệu của Prompt Studio. */
  | { kind: 'other' }

export async function inspectDataFolder(dir: FileSystemDirectoryHandle): Promise<FolderContents> {
  const text = await readTextFile(dir, DATA_FILE)
  if (text !== null) {
    const r = parseBackup(text)
    return r.ok ? { kind: 'data', backup: r.backup } : { kind: 'bad' }
  }
  return (await hasEntries(dir)) ? { kind: 'other' } : { kind: 'empty' }
}

/** Dùng thư mục trống làm thư mục dữ liệu và ghi ngay. */
export async function setDataFolder(dir: FileSystemDirectoryHandle): Promise<void> {
  await saveFolder({ key: DATA_FOLDER, handle: dir })
  await requestSync()
}

/** Thay dữ liệu trong app bằng dữ liệu trong thư mục (giữ API key trên máy này), rồi tiếp tục ghi vào thư mục đó. */
export async function loadFromFolder(dir: FileSystemDirectoryHandle, backup: BackupFile) {
  await restoreBackup(backup)
  await setDataFolder(dir)
}

export async function stopFolder(key: string): Promise<void> {
  await removeFolder(key)
  setStatus(key, null)
}
