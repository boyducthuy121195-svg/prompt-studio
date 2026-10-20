/**
 * Thư mục giả trong bộ nhớ, đủ dùng cho `src/lib/folder/fs.ts` (jsdom không có File System Access API).
 */
type Node = FakeDir | FakeFile

class FakeFile {
  readonly kind = 'file'
  readonly name: string
  content: string
  constructor(name: string, content = '') {
    this.name = name
    this.content = content
  }
  async getFile() {
    const text = this.content
    return { text: async () => text }
  }
  async createWritable() {
    let buffer = ''
    return {
      write: async (s: string) => void (buffer += s),
      close: async () => void (this.content = buffer),
    }
  }
}

const notFound = (name: string) => new DOMException(`Không có: ${name}`, 'NotFoundError')
const mismatch = (name: string) => new DOMException(`Sai loại: ${name}`, 'TypeMismatchError')

export class FakeDir {
  readonly kind = 'directory'
  readonly entries = new Map<string, Node>()
  /** Đổi thành 'prompt' để giả lập lúc mở lại trình duyệt; `grantOnRequest` = người dùng bấm Cho phép. */
  permission: PermissionState = 'granted'
  grantOnRequest = true
  readonly name: string
  constructor(name: string) {
    this.name = name
  }

  async queryPermission() {
    return this.permission
  }
  async requestPermission() {
    if (this.grantOnRequest) this.permission = 'granted'
    return this.permission
  }
  async getDirectoryHandle(name: string, opts?: { create?: boolean }) {
    const node = this.entries.get(name)
    if (node instanceof FakeDir) return node
    if (node) throw mismatch(name)
    if (!opts?.create) throw notFound(name)
    const dir = new FakeDir(name)
    this.entries.set(name, dir)
    return dir
  }
  async getFileHandle(name: string, opts?: { create?: boolean }) {
    const node = this.entries.get(name)
    if (node instanceof FakeFile) return node
    if (node) throw mismatch(name)
    if (!opts?.create) throw notFound(name)
    const file = new FakeFile(name)
    this.entries.set(name, file)
    return file
  }
  async removeEntry(name: string) {
    if (!this.entries.delete(name)) throw notFound(name)
  }
  async *keys() {
    yield* this.entries.keys()
  }

  /** Ghi sẵn một file (đường dẫn dùng "/"). */
  put(path: string, content: string): this {
    const parts = path.split('/')
    const name = parts.pop()!
    const dir = parts.reduce<FakeDir>((d, p) => {
      const next = d.entries.get(p)
      if (next instanceof FakeDir) return next
      const created = new FakeDir(p)
      d.entries.set(p, created)
      return created
    }, this)
    dir.entries.set(name, new FakeFile(name, content))
    return this
  }

  /** Toàn bộ file bên trong: { "du-an/x/ho-so.md": "…" }. */
  files(prefix = ''): Record<string, string> {
    const out: Record<string, string> = {}
    for (const [name, node] of this.entries) {
      if (node instanceof FakeFile) out[prefix + name] = node.content
      else Object.assign(out, node.files(`${prefix}${name}/`))
    }
    return out
  }

  get handle(): FileSystemDirectoryHandle {
    return this as unknown as FileSystemDirectoryHandle
  }
}
