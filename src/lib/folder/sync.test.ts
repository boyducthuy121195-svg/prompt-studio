import { createBackup, wipeAllData } from '@/lib/backup'
import { saveAgentsDoc, ensureAgentsDoc } from '@/lib/db/agents'
import { createProject, deleteProject, listProjects, updateProject } from '@/lib/db/projects'
import { savePrompt } from '@/lib/db/prompts'
import { getSettings, updateSettings } from '@/lib/db/settings'
import { FakeDir } from '@/test/fake-fs'
import { clearDb } from '@/test/render-app'
import { buildDataFolderFiles, DATA_FILE } from './files'
import { codeFolderKey, DATA_FOLDER, getFolder, listFolders, saveFolder } from './store'
import {
  describeFolderError,
  getFolderStatus,
  inspectDataFolder,
  loadFromFolder,
  requestSync,
  setDataFolder,
  stopFolder,
} from './sync'

beforeEach(clearDb)

describe('tự ghi ra thư mục dữ liệu', () => {
  it('ghi đủ file, không kèm API key; sửa thì ghi lại', async () => {
    const p = await createProject({ name: 'Web bán hàng' })
    await updateSettings({ claudeKey: 'sk-ant-bi-mat' })
    const dir = new FakeDir('Du lieu')
    await setDataFolder(dir.handle)

    let files = dir.files()
    expect(files['du-an/web-ban-hang/ho-so.md']).toContain('# Web bán hàng')
    expect(JSON.stringify(files)).not.toContain('sk-ant-bi-mat')
    expect(getFolderStatus(DATA_FOLDER)?.kind).toBe('ok')

    await updateProject(p.id, { name: 'Web bán sách' })
    await savePrompt({ projectId: null, title: 'Mẫu chung', typeCode: 'SUA_LOI', body: 'x' })
    await requestSync()
    files = dir.files()
    expect(files['du-an/web-ban-hang/ho-so.md']).toBeUndefined()
    expect(files['du-an/web-ban-sach/ho-so.md']).toContain('# Web bán sách')
    expect(files['dung-chung/prompts/mau-chung.md']).toContain('x')
  })

  it('app trống thì không ghi gì (không xóa dữ liệu cũ trong thư mục)', async () => {
    const dir = new FakeDir('Du lieu').put(DATA_FILE, '{"cu":true}')
    await saveFolder({ key: DATA_FOLDER, handle: dir.handle })
    await requestSync()
    expect(dir.files()).toEqual({ [DATA_FILE]: '{"cu":true}' })
    expect(getFolderStatus(DATA_FOLDER)?.kind).toBe('empty')
  })

  it('mở lại trình duyệt chưa cho phép: không ghi, báo cần cho phép', async () => {
    await createProject({ name: 'A' })
    const dir = new FakeDir('Du lieu')
    dir.permission = 'prompt'
    await setDataFolder(dir.handle)
    expect(dir.files()).toEqual({})
    expect(getFolderStatus(DATA_FOLDER)?.kind).toBe('permission')
  })

  it('thư mục bị xóa: báo lỗi dễ hiểu', async () => {
    await createProject({ name: 'A' })
    const dir = new FakeDir('Du lieu')
    const gone = async (): Promise<never> => {
      throw new DOMException('mất', 'NotFoundError')
    }
    dir.getFileHandle = gone
    dir.getDirectoryHandle = gone
    await setDataFolder(dir.handle)
    const s = getFolderStatus(DATA_FOLDER)
    expect(s?.kind === 'error' && s.message).toMatch(/Không tìm thấy thư mục/)
  })

  it('"Xóa toàn bộ dữ liệu" thì quên thư mục và ngừng ghi', async () => {
    await createProject({ name: 'A' })
    const dir = new FakeDir('Du lieu')
    await setDataFolder(dir.handle)
    const before = dir.files()
    await wipeAllData()
    expect(await listFolders()).toEqual([])
    await createProject({ name: 'B' })
    await requestSync()
    expect(dir.files()).toEqual(before)
  })

  it('ngừng ghi thì bỏ thư mục, file đã ghi vẫn còn', async () => {
    await createProject({ name: 'A' })
    const dir = new FakeDir('Du lieu')
    await setDataFolder(dir.handle)
    await stopFolder(DATA_FOLDER)
    expect(await getFolder(DATA_FOLDER)).toBeUndefined()
    expect(getFolderStatus(DATA_FOLDER)).toBeUndefined()
    expect(dir.files()['du-an/a/ho-so.md']).toBeDefined()
  })
})

describe('nhận diện thư mục và nạp lại khi đổi máy', () => {
  it('trống / có dữ liệu / dữ liệu hỏng / thư mục khác', async () => {
    expect((await inspectDataFolder(new FakeDir('a').handle)).kind).toBe('empty')
    await createProject({ name: 'A' })
    const json = buildDataFolderFiles(await createBackup())[1].content
    const found = await inspectDataFolder(new FakeDir('b').put(DATA_FILE, json).handle)
    expect(found.kind === 'data' && found.backup.data.projects[0].name).toBe('A')
    expect((await inspectDataFolder(new FakeDir('c').put(DATA_FILE, '{x').handle)).kind).toBe('bad')
    expect((await inspectDataFolder(new FakeDir('d').put('anh.png', '…').handle)).kind).toBe(
      'other',
    )
  })

  it('nạp: thay dữ liệu trong app, giữ API key trên máy này, rồi tiếp tục ghi vào thư mục đó', async () => {
    await createProject({ name: 'Từ máy cũ' })
    const dir = new FakeDir('Du lieu')
    await setDataFolder(dir.handle)
    const found = await inspectDataFolder(dir.handle)
    if (found.kind !== 'data') throw new Error('phải có dữ liệu')

    await clearDb()
    await createProject({ name: 'Máy mới' })
    await updateSettings({ claudeKey: 'sk-ant-may-moi' })
    await loadFromFolder(dir.handle, found.backup)

    expect((await listProjects()).map((p) => p.name)).toEqual(['Từ máy cũ'])
    expect((await getSettings()).claudeKey).toBe('sk-ant-may-moi')
    expect((await getFolder(DATA_FOLDER))?.handle).toBe(dir.handle)
    expect(dir.files()['du-an/tu-may-cu/ho-so.md']).toBeDefined()
  })
})

describe('thư mục code của dự án', () => {
  it('chưa có AGENTS.md thì chờ; có rồi thì ghi, giữ bản cũ của người khác', async () => {
    const p = await createProject({ name: 'Web' })
    const code = new FakeDir('web').put('AGENTS.md', '# Viết tay\n')
    await saveFolder({ key: codeFolderKey(p.id), handle: code.handle, written: {} })
    await requestSync()
    expect(getFolderStatus(codeFolderKey(p.id))?.kind).toBe('noDoc')
    expect(code.files()).toEqual({ 'AGENTS.md': '# Viết tay\n' })

    const doc = await ensureAgentsDoc(p.id)
    await requestSync()
    let files = code.files()
    expect(files['AGENTS.md']).toMatch(/^# AGENTS.md – Web/)
    expect(files['CLAUDE.md']).toBe('@AGENTS.md\n')
    const backup = Object.keys(files).find((f) => f.startsWith('AGENTS.backup-'))
    expect(backup && files[backup]).toBe('# Viết tay\n')
    const s = getFolderStatus(codeFolderKey(p.id))
    expect(s?.kind === 'ok' && s.backups).toEqual([backup])

    // Sửa AGENTS.md trong app: ghi đè bản app ghi lần trước, không tạo thêm bản cũ
    await saveAgentsDoc(
      doc,
      doc.sections.map((x, i) => (i === 0 ? { ...x, content: 'Nội dung mới' } : x)),
      'Web',
    )
    await requestSync()
    files = code.files()
    expect(files['AGENTS.md']).toContain('Nội dung mới')
    expect(Object.keys(files).filter((f) => f.includes('backup'))).toHaveLength(1)
  })

  it('xóa dự án thì bỏ liên kết thư mục code', async () => {
    const p = await createProject({ name: 'Web' })
    await saveFolder({ key: codeFolderKey(p.id), handle: new FakeDir('w').handle })
    await deleteProject(p.id)
    await requestSync()
    expect(await getFolder(codeFolderKey(p.id))).toBeUndefined()
  })
})

describe('thông báo lỗi', () => {
  it('nói rõ chuyện gì xảy ra và cần làm gì', () => {
    expect(describeFolderError(new DOMException('', 'NotAllowedError'))).toMatch(/không cho ghi/)
    expect(describeFolderError(new DOMException('', 'QuotaExceededError'))).toMatch(/đầy/)
    expect(describeFolderError(new Error('lạ'))).toMatch(/Không ghi được vào thư mục \(lạ\)/)
  })
})
