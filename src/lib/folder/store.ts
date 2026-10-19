import Dexie, { type EntityTable } from 'dexie'
import type { Manifest } from './files'

/** Thư mục lưu dữ liệu chung (Cài đặt). */
export const DATA_FOLDER = 'data'
/** Thư mục code của một dự án (M2). */
export const codeFolderKey = (projectId: string) => `code:${projectId}`
export const projectIdOf = (key: string) => (key.startsWith('code:') ? key.slice(5) : null)

export interface FolderRecord {
  key: string
  /** Trình duyệt cho phép cất "tay cầm" thư mục vào IndexedDB, mở lại app vẫn dùng được (cần cho phép lại quyền). */
  handle: FileSystemDirectoryHandle
  /** Thư mục code: mã băm của bản app ghi lần trước, để biết file ở đó có bị sửa ngoài app không. */
  written?: Manifest
}

export interface FolderBackend {
  get(key: string): Promise<FolderRecord | undefined>
  list(): Promise<FolderRecord[]>
  put(rec: FolderRecord): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}

/**
 * Cơ sở dữ liệu RIÊNG cho thư mục đã chọn, tách khỏi `prompt-studio` (không đổi schema cũ, không vào file sao lưu,
 * vì tay cầm thư mục chỉ dùng được trên đúng máy này).
 */
class FolderDB extends Dexie {
  folders!: EntityTable<FolderRecord, 'key'>
  constructor(name: string) {
    super(name)
    this.version(1).stores({ folders: 'key' })
  }
}

export function dexieFolderBackend(name = 'prompt-studio-folders'): FolderBackend {
  const fdb = new FolderDB(name)
  return {
    get: (key) => fdb.folders.get(key),
    list: () => fdb.folders.toArray(),
    put: async (rec) => void (await fdb.folders.put(rec)),
    delete: (key) => fdb.folders.delete(key),
    clear: () => fdb.folders.clear(),
  }
}

/** Bản lưu trong bộ nhớ – dùng cho test (tay cầm giả không cất được vào IndexedDB). */
export function memoryFolderBackend(): FolderBackend {
  const map = new Map<string, FolderRecord>()
  return {
    get: async (key) => map.get(key),
    list: async () => [...map.values()],
    put: async (rec) => void map.set(rec.key, rec),
    delete: async (key) => void map.delete(key),
    clear: async () => map.clear(),
  }
}

let backend: FolderBackend | null = null
const store = () => (backend ??= dexieFolderBackend())
export function setFolderBackend(b: FolderBackend) {
  backend = b
}

const listeners = new Set<() => void>()
/** Báo khi người dùng chọn / bỏ thư mục. Trả về hàm hủy đăng ký. */
export function onFoldersChanged(fn: () => void): () => void {
  listeners.add(fn)
  return () => void listeners.delete(fn)
}
const emit = () => listeners.forEach((fn) => fn())

export const getFolder = (key: string) => store().get(key)
export const listFolders = () => store().list()

export async function saveFolder(rec: FolderRecord): Promise<void> {
  await store().put(rec)
  emit()
}

export async function removeFolder(key: string): Promise<void> {
  await store().delete(key)
  emit()
}

/** Quên mọi thư mục đã chọn (khi "Xóa toàn bộ dữ liệu") – app ngừng ghi ra thư mục. */
export async function clearFolders(): Promise<void> {
  await store().clear()
  emit()
}

/** Ghi nhớ bản vừa ghi vào thư mục code (không báo thay đổi, tránh vòng lặp ghi). */
export async function updateWritten(key: string, written: Manifest): Promise<void> {
  const rec = await store().get(key)
  if (rec) await store().put({ ...rec, written })
}
