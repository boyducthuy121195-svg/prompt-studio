import { FakeDir } from '@/test/fake-fs'
import { hashText, MANIFEST_FILE } from './files'
import {
  folderSupported,
  hasEntries,
  hasPermission,
  pickFolder,
  readTextFile,
  removeFile,
  syncCodeFolder,
  syncFolder,
  writeTextFile,
} from './fs'

afterEach(() => {
  delete window.showDirectoryPicker
})

describe('chọn thư mục', () => {
  it('jsdom (giống Firefox) không hỗ trợ; có showDirectoryPicker thì hỗ trợ', async () => {
    expect(folderSupported()).toBe(false)
    const dir = new FakeDir('du-lieu')
    window.showDirectoryPicker = async () => dir.handle
    expect(folderSupported()).toBe(true)
    expect(await pickFolder('x')).toBe(dir.handle)
  })

  it('bấm Hủy thì trả về null, lỗi khác thì báo lên', async () => {
    window.showDirectoryPicker = async () => {
      throw new DOMException('hủy', 'AbortError')
    }
    expect(await pickFolder('x')).toBeNull()
    window.showDirectoryPicker = async () => {
      throw new DOMException('cấm', 'SecurityError')
    }
    await expect(pickFolder('x')).rejects.toThrow('cấm')
  })

  it('quyền ghi: chỉ hỏi người dùng khi được phép hỏi', async () => {
    const dir = new FakeDir('d')
    dir.permission = 'prompt'
    expect(await hasPermission(dir.handle)).toBe(false)
    expect(dir.permission).toBe('prompt')
    expect(await hasPermission(dir.handle, true)).toBe(true)
    dir.permission = 'prompt'
    dir.grantOnRequest = false
    expect(await hasPermission(dir.handle, true)).toBe(false)
  })
})

describe('đọc / ghi file', () => {
  it('ghi tạo thư mục con, đọc file không có thì null, xóa file không có thì bỏ qua', async () => {
    const root = new FakeDir('r')
    expect(await hasEntries(root.handle)).toBe(false)
    await writeTextFile(root.handle, 'a/b/c.md', 'xin chào')
    expect(await readTextFile(root.handle, 'a/b/c.md')).toBe('xin chào')
    expect(await readTextFile(root.handle, 'a/khong-co.md')).toBeNull()
    expect(await readTextFile(root.handle, 'x/y.md')).toBeNull()
    await removeFile(root.handle, 'a/b/c.md')
    await removeFile(root.handle, 'a/b/c.md')
    expect(await readTextFile(root.handle, 'a/b/c.md')).toBeNull()
    expect(await hasEntries(root.handle)).toBe(true)
  })
})

describe('syncFolder', () => {
  it('ghi theo sổ ghi; lần sau chỉ ghi file đổi và xóa file app từng ghi', async () => {
    const root = new FakeDir('r').put('cua-toi.txt', 'đừng đụng')
    expect(
      await syncFolder(root.handle, [
        { path: 'a.md', content: 'A' },
        { path: 'x/b.md', content: 'B' },
      ]),
    ).toEqual({ written: 2, removed: 0 })
    expect(JSON.parse(root.files()[MANIFEST_FILE])).toEqual({
      'a.md': hashText('A'),
      'x/b.md': hashText('B'),
    })

    expect(await syncFolder(root.handle, [{ path: 'a.md', content: 'A2' }])).toEqual({
      written: 1,
      removed: 1,
    })
    const files = root.files()
    expect(files['a.md']).toBe('A2')
    expect(files['x/b.md']).toBeUndefined()
    expect(files['cua-toi.txt']).toBe('đừng đụng')

    expect(await syncFolder(root.handle, [{ path: 'a.md', content: 'A2' }])).toEqual({
      written: 0,
      removed: 0,
    })
  })
})

describe('syncCodeFolder', () => {
  const day = new Date(2026, 9, 19).getTime()
  const files = [
    { path: 'AGENTS.md', content: '# AGENTS mới\n' },
    { path: 'CLAUDE.md', content: '@AGENTS.md\n' },
  ]

  it('thư mục trống: ghi luôn, không tạo bản cũ', async () => {
    const root = new FakeDir('code')
    const r = await syncCodeFolder(root.handle, files, {}, day)
    expect(r.backups).toEqual([])
    expect(root.files()).toEqual({ 'AGENTS.md': '# AGENTS mới\n', 'CLAUDE.md': '@AGENTS.md\n' })
    expect(r.written).toEqual({
      'AGENTS.md': hashText('# AGENTS mới\n'),
      'CLAUDE.md': hashText('@AGENTS.md\n'),
    })
  })

  it('đã có AGENTS.md khác nội dung: giữ bản cũ thành AGENTS.backup-<ngày>.md rồi mới ghi', async () => {
    const root = new FakeDir('code')
      .put('AGENTS.md', '# Bản viết tay\n')
      .put('CLAUDE.md', '@AGENTS.md\n')
    const r = await syncCodeFolder(root.handle, files, {}, day)
    expect(r.backups).toEqual(['AGENTS.backup-2026-10-19.md'])
    expect(root.files()).toEqual({
      'AGENTS.md': '# AGENTS mới\n',
      'AGENTS.backup-2026-10-19.md': '# Bản viết tay\n',
      'CLAUDE.md': '@AGENTS.md\n',
    })
  })

  it('file là bản app ghi lần trước: ghi đè không cần bản cũ', async () => {
    const root = new FakeDir('code')
    const first = await syncCodeFolder(root.handle, files, {}, day)
    const next = [{ path: 'AGENTS.md', content: '# Sửa lần 2\n' }, files[1]]
    const r = await syncCodeFolder(root.handle, next, first.written, day)
    expect(r.backups).toEqual([])
    expect(Object.keys(root.files()).sort()).toEqual(['AGENTS.md', 'CLAUDE.md'])
  })

  it('bị sửa tay sau lần ghi trước: giữ bản cũ; cùng ngày thì đánh số, bản cũ trùng thì không nhân đôi', async () => {
    const root = new FakeDir('code').put('AGENTS.backup-2026-10-19.md', 'bản cũ khác')
    const first = await syncCodeFolder(root.handle, files, {}, day)
    root.put('AGENTS.md', 'sửa tay')
    const r = await syncCodeFolder(root.handle, files, first.written, day)
    expect(r.backups).toEqual(['AGENTS.backup-2026-10-19-2.md'])
    expect(root.files()['AGENTS.backup-2026-10-19-2.md']).toBe('sửa tay')

    root.put('AGENTS.md', 'sửa tay')
    const again = await syncCodeFolder(root.handle, files, r.written, day)
    expect(again.backups).toEqual([])
    expect(root.files()['AGENTS.md']).toBe('# AGENTS mới\n')
  })
})
