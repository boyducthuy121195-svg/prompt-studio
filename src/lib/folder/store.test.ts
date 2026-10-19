import {
  clearFolders,
  codeFolderKey,
  dexieFolderBackend,
  getFolder,
  listFolders,
  memoryFolderBackend,
  onFoldersChanged,
  projectIdOf,
  removeFolder,
  saveFolder,
  setFolderBackend,
  updateWritten,
  type FolderBackend,
  type FolderRecord,
} from './store'

// Ở đây dùng bản ghi có "tay cầm" là đối tượng thường – cất được vào IndexedDB giả
const rec = (key: string, name: string) =>
  ({ key, handle: { name } as unknown as FileSystemDirectoryHandle }) satisfies FolderRecord

describe.each<[string, () => FolderBackend]>([
  ['IndexedDB riêng', () => dexieFolderBackend(`folders-test-${Math.random()}`)],
  ['bộ nhớ', memoryFolderBackend],
])('nơi cất thư mục (%s)', (_, make) => {
  beforeEach(() => setFolderBackend(make()))

  it('lưu, đọc, ghi nhớ bản đã ghi, xóa', async () => {
    await saveFolder(rec('data', 'Du lieu'))
    await saveFolder(rec(codeFolderKey('p1'), 'web'))
    expect((await getFolder('data'))?.handle.name).toBe('Du lieu')
    expect((await listFolders()).map((r) => r.key).sort()).toEqual(['code:p1', 'data'])

    await updateWritten('code:p1', { 'AGENTS.md': 'abc' })
    expect((await getFolder('code:p1'))?.written).toEqual({ 'AGENTS.md': 'abc' })
    await updateWritten('khong-co', { x: 'y' })
    expect(await getFolder('khong-co')).toBeUndefined()

    await removeFolder('data')
    expect(await getFolder('data')).toBeUndefined()
    await clearFolders()
    expect(await listFolders()).toEqual([])
  })
})

describe('thông báo thay đổi', () => {
  beforeEach(() => setFolderBackend(memoryFolderBackend()))

  it('báo khi chọn / bỏ thư mục, không báo khi chỉ ghi nhớ bản đã ghi', async () => {
    const fn = vi.fn()
    const off = onFoldersChanged(fn)
    await saveFolder(rec('data', 'x'))
    await updateWritten('data', {})
    await removeFolder('data')
    await clearFolders()
    expect(fn).toHaveBeenCalledTimes(3)
    off()
    await saveFolder(rec('data', 'x'))
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('đọc mã dự án từ khóa thư mục code', () => {
    expect(projectIdOf(codeFolderKey('abc'))).toBe('abc')
    expect(projectIdOf('data')).toBeNull()
  })
})
