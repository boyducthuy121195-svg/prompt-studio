import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createBackup } from '@/lib/backup'
import { createProject, listProjects } from '@/lib/db/projects'
import { buildDataFolderFiles, DATA_FILE } from '@/lib/folder/files'
import { DATA_FOLDER, getFolder, saveFolder } from '@/lib/folder/store'
import { FakeDir } from '@/test/fake-fs'
import { clearDb, renderApp } from '@/test/render-app'

beforeEach(clearDb)
afterEach(() => {
  delete window.showDirectoryPicker
})

/** Giả lập hộp chọn thư mục của Windows: lần lượt trả về các thư mục này. */
function picker(...dirs: FakeDir[]) {
  window.showDirectoryPicker = async () => dirs.shift()!.handle
}

describe('Cài đặt – Lưu ra thư mục trên máy', () => {
  it('trình duyệt không hỗ trợ thì nói rõ cần Chrome / Edge', async () => {
    renderApp('/settings')
    expect(await screen.findByText(/chưa hỗ trợ ghi ra thư mục/)).toHaveTextContent('Chrome')
    expect(screen.queryByRole('button', { name: 'Chọn thư mục lưu dữ liệu…' })).toBeNull()
  })

  it('chọn thư mục trống: ghi ngay và hiện trạng thái', async () => {
    const user = userEvent.setup()
    await createProject({ name: 'Web bán hàng' })
    const dir = new FakeDir('Prompt Studio')
    picker(dir)
    renderApp('/settings')
    await user.click(await screen.findByRole('button', { name: 'Chọn thư mục lưu dữ liệu…' }))
    expect(await screen.findByText('Thư mục: Prompt Studio')).toBeInTheDocument()
    expect(await screen.findByText(/Đã ghi tự động/)).toBeInTheDocument()
    expect(dir.files()['du-an/web-ban-hang/ho-so.md']).toContain('Web bán hàng')
    expect(screen.getByRole('button', { name: 'Đổi thư mục…' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ngừng ghi ra thư mục' }))
    expect(await screen.findByRole('button', { name: 'Chọn thư mục lưu dữ liệu…' })).toBeVisible()
    expect(await getFolder(DATA_FOLDER)).toBeUndefined()
  })

  it('thư mục có file khác: từ chối, không ghi đè', async () => {
    const user = userEvent.setup()
    await createProject({ name: 'A' })
    const dir = new FakeDir('Documents').put('bao-cao.docx', '…')
    picker(dir)
    renderApp('/settings')
    await user.click(await screen.findByRole('button', { name: 'Chọn thư mục lưu dữ liệu…' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('thư mục trống riêng')
    expect(dir.files()).toEqual({ 'bao-cao.docx': '…' })
    expect(await getFolder(DATA_FOLDER)).toBeUndefined()
  })

  it('thư mục đã có dữ liệu: hỏi trước; Hủy thì không ghi gì, Nạp thì thay dữ liệu', async () => {
    const user = userEvent.setup()
    await createProject({ name: 'Từ máy cũ' })
    await createProject({ name: 'Dự án 2' })
    const content = buildDataFolderFiles(await createBackup())[1].content
    await clearDb()
    await createProject({ name: 'Máy mới' })
    const dir = new FakeDir('OneDrive').put(DATA_FILE, content)
    picker(dir, dir)
    renderApp('/settings')

    await user.click(await screen.findByRole('button', { name: 'Chọn thư mục lưu dữ liệu…' }))
    let dialog = await screen.findByRole('dialog', { name: 'Nạp dữ liệu từ thư mục?' })
    expect(dialog).toHaveTextContent('2 dự án · 0 prompt · 0 AGENTS.md')
    expect(dialog).toHaveTextContent('giữ nguyên key')
    await user.click(within(dialog).getByRole('button', { name: 'Hủy' }))
    expect(dir.files()).toEqual({ [DATA_FILE]: content })
    expect(await getFolder(DATA_FOLDER)).toBeUndefined()

    await user.click(screen.getByRole('button', { name: 'Nạp từ thư mục…' }))
    dialog = await screen.findByRole('dialog', { name: 'Nạp dữ liệu từ thư mục?' })
    await user.click(within(dialog).getByRole('button', { name: 'Nạp dữ liệu' }))
    await waitFor(async () =>
      expect((await listProjects()).map((p) => p.name).sort()).toEqual(['Dự án 2', 'Từ máy cũ']),
    )
    expect(await screen.findByText('Thư mục: OneDrive')).toBeInTheDocument()
  })

  it('"Nạp từ thư mục" mà thư mục không có dữ liệu thì báo rõ', async () => {
    const user = userEvent.setup()
    picker(new FakeDir('Trong'))
    renderApp('/settings')
    await user.click(await screen.findByRole('button', { name: 'Nạp từ thư mục…' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('du-lieu-prompt-studio.json')
  })
})

describe('Thư mục code của dự án (M2)', () => {
  it('liên kết thư mục code, chờ có AGENTS.md; bỏ liên kết được', async () => {
    const user = userEvent.setup()
    const p = await createProject({ name: 'Web' })
    picker(new FakeDir('web-code'))
    renderApp(`/projects/${p.id}`)
    await user.click(await screen.findByRole('button', { name: 'Chọn thư mục code…' }))
    expect(await screen.findByText('Thư mục: web-code')).toBeInTheDocument()
    expect(await screen.findByText(/Dự án chưa có AGENTS.md/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Bỏ liên kết' }))
    expect(await screen.findByRole('button', { name: 'Chọn thư mục code…' })).toBeVisible()
  })
})

describe('Nhắc cho phép ghi lại', () => {
  it('mở lại trình duyệt: hiện nhắc trên mọi trang, bấm Cho phép ghi thì ghi tiếp', async () => {
    const user = userEvent.setup()
    await createProject({ name: 'Web' })
    const dir = new FakeDir('Prompt Studio')
    dir.permission = 'prompt'
    window.showDirectoryPicker = async () => dir.handle
    await saveFolder({ key: DATA_FOLDER, handle: dir.handle })
    renderApp('/projects')
    expect(
      await screen.findByText(/cần bạn cho phép lại/, {}, { timeout: 3000 }),
    ).toHaveTextContent('"Prompt Studio"')
    await user.click(screen.getByRole('button', { name: 'Cho phép ghi' }))
    await waitFor(() => expect(dir.files()['du-an/web/ho-so.md']).toBeDefined())
    await waitFor(() => expect(screen.queryByText(/cần bạn cho phép lại/)).toBeNull())
  })
})
