import { MANIFEST_FILE, planSync, type FolderFile, type Manifest } from './files'

/** Trình duyệt có hỗ trợ chọn thư mục trên máy không (Chrome / Edge: có; Firefox / Safari: chưa). */
export function folderSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function'
}

/** Mở hộp chọn thư mục của Windows / macOS. Người dùng bấm Hủy thì trả về null. */
export async function pickFolder(id: string): Promise<FileSystemDirectoryHandle | null> {
  try {
    return (await window.showDirectoryPicker?.({ id, mode: 'readwrite' })) ?? null
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return null
    throw err
  }
}

/**
 * Kiểm tra (và nếu `ask` thì xin) quyền ghi vào thư mục.
 * Trình duyệt chỉ cho xin quyền khi người dùng vừa bấm nút, nên lúc tự lưu thì `ask = false`.
 */
export async function hasPermission(dir: FileSystemDirectoryHandle, ask = false): Promise<boolean> {
  const opts = { mode: 'readwrite' } as const
  if (!dir.queryPermission) return true
  if ((await dir.queryPermission(opts)) === 'granted') return true
  if (!ask || !dir.requestPermission) return false
  return (await dir.requestPermission(opts)) === 'granted'
}

async function parentDir(
  root: FileSystemDirectoryHandle,
  path: string,
  create: boolean,
): Promise<[FileSystemDirectoryHandle, string]> {
  const parts = path.split('/').filter(Boolean)
  const name = parts.pop()
  if (!name) throw new Error(`Đường dẫn không hợp lệ: ${path}`)
  let dir = root
  for (const part of parts) dir = await dir.getDirectoryHandle(part, { create })
  return [dir, name]
}

const notFound = (err: unknown) =>
  err instanceof DOMException && (err.name === 'NotFoundError' || err.name === 'TypeMismatchError')

export async function writeTextFile(
  root: FileSystemDirectoryHandle,
  path: string,
  content: string,
): Promise<void> {
  const [dir, name] = await parentDir(root, path, true)
  const file = await dir.getFileHandle(name, { create: true })
  const w = await file.createWritable()
  await w.write(content)
  await w.close()
}

/** Đọc file chữ; không có file thì trả về null. */
export async function readTextFile(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<string | null> {
  try {
    const [dir, name] = await parentDir(root, path, false)
    return await (await (await dir.getFileHandle(name)).getFile()).text()
  } catch (err) {
    if (notFound(err)) return null
    throw err
  }
}

/** Xóa file; file không còn thì bỏ qua. */
export async function removeFile(root: FileSystemDirectoryHandle, path: string): Promise<void> {
  try {
    const [dir, name] = await parentDir(root, path, false)
    await dir.removeEntry(name)
  } catch (err) {
    if (!notFound(err)) throw err
  }
}

async function readManifest(root: FileSystemDirectoryHandle): Promise<Manifest> {
  const text = await readTextFile(root, MANIFEST_FILE)
  if (!text) return {}
  try {
    const raw: unknown = JSON.parse(text)
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
    return Object.fromEntries(
      Object.entries(raw).filter((e): e is [string, string] => typeof e[1] === 'string'),
    )
  } catch {
    return {}
  }
}

/**
 * Ghi các file đã đổi, xóa các file app từng ghi mà nay không còn (theo sổ ghi `.prompt-studio-manifest.json`).
 * Không bao giờ đụng tới file mà app không tự ghi ra.
 */
export async function syncFolder(
  root: FileSystemDirectoryHandle,
  files: readonly FolderFile[],
): Promise<{ written: number; removed: number }> {
  const { write, remove, next } = planSync(await readManifest(root), files)
  for (const f of write) await writeTextFile(root, f.path, f.content)
  for (const p of remove) await removeFile(root, p)
  if (write.length || remove.length)
    await writeTextFile(root, MANIFEST_FILE, JSON.stringify(next, null, 2) + '\n')
  return { written: write.length, removed: remove.length }
}
