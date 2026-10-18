import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createBackup } from '@/lib/backup'
import { createProject, listProjects } from '@/lib/db/projects'
import { getSettings, updateSettings } from '@/lib/db/settings'
import * as download from '@/lib/download'
import { clearDb, renderApp } from '@/test/render-app'

beforeEach(clearDb)
afterEach(() => vi.restoreAllMocks())

const DAY = 24 * 60 * 60 * 1000

describe('Sao lưu và khôi phục', () => {
  it('tải file không kèm key, ghi lại thời điểm sao lưu; tích ô thì hiện cảnh báo', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(download, 'downloadFile').mockImplementation(() => {})
    await createProject({ name: 'Prompt Studio' })
    await updateSettings({ claudeKey: 'sk-ant-secret' })
    renderApp('/settings')
    await user.click(await screen.findByRole('button', { name: /Tải file sao lưu/ }))
    await waitFor(() => expect(spy).toHaveBeenCalledOnce())
    const [name, data] = spy.mock.calls[0]
    expect(name).toMatch(/^prompt-studio-backup-\d{4}-\d{2}-\d{2}\.json$/)
    expect(data).not.toContain('sk-ant-secret')
    await waitFor(async () => expect((await getSettings()).lastBackupAt).not.toBeNull())

    await user.click(screen.getByRole('checkbox', { name: 'Kèm API key trong file sao lưu' }))
    expect(screen.getByRole('note')).toHaveTextContent('file sẽ chứa API key')
  })

  it('khôi phục: xem trước số lượng, xác nhận rồi ghi đè', async () => {
    const user = userEvent.setup()
    await createProject({ name: 'Dự án A' })
    await createProject({ name: 'Dự án B' })
    const text = JSON.stringify(await createBackup())
    await clearDb()
    await createProject({ name: 'Dự án tạm' })
    renderApp('/settings')
    await user.upload(
      await screen.findByLabelText('Chọn file sao lưu'),
      new File([text], 'backup.json', { type: 'application/json' }),
    )
    const dialog = await screen.findByRole('dialog', { name: 'Khôi phục dữ liệu từ file?' })
    expect(dialog).toHaveTextContent('2 dự án · 0 prompt · 0 AGENTS.md')
    await user.click(within(dialog).getByRole('button', { name: 'Khôi phục' }))
    await waitFor(async () =>
      expect((await listProjects()).map((p) => p.name).sort()).toEqual(['Dự án A', 'Dự án B']),
    )
  })

  it('file hỏng thì báo lỗi dễ hiểu, không đổi dữ liệu', async () => {
    const user = userEvent.setup()
    await createProject({ name: 'Dự án A' })
    renderApp('/settings')
    await user.upload(
      await screen.findByLabelText('Chọn file sao lưu'),
      new File(['{"app":"khac"}'], 'x.json', { type: 'application/json' }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent('không đúng định dạng')
    expect(await listProjects()).toHaveLength(1)
  })

  it('xóa toàn bộ phải xác nhận 2 lần', async () => {
    const user = userEvent.setup()
    await createProject({ name: 'Dự án A' })
    renderApp('/settings')
    await user.click(await screen.findByRole('button', { name: 'Xóa toàn bộ dữ liệu' }))
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Xóa toàn bộ dữ liệu?' })).getByRole(
        'button',
        { name: 'Tiếp tục' },
      ),
    )
    expect(await listProjects()).toHaveLength(1)
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Xác nhận lần cuối' })).getByRole('button', {
        name: 'Xóa vĩnh viễn',
      }),
    )
    await waitFor(async () => expect(await listProjects()).toHaveLength(0))
  })

  it('trang Dự án nhắc sao lưu khi quá 7 ngày', async () => {
    await createProject({ name: 'Dự án A' })
    await updateSettings({ lastBackupAt: Date.now() - 9 * DAY })
    renderApp('/projects')
    expect(await screen.findByRole('note')).toHaveTextContent('Đã 9 ngày chưa sao lưu')
    expect(screen.getByRole('link', { name: 'Sao lưu ngay' })).toHaveAttribute(
      'href',
      '/settings#backup',
    )
  })

  it('mới sao lưu thì không nhắc', async () => {
    await createProject({ name: 'Dự án A' })
    await updateSettings({ lastBackupAt: Date.now() })
    renderApp('/projects')
    expect(await screen.findByRole('link', { name: 'Dự án A' })).toBeInTheDocument()
    expect(screen.queryByRole('note')).not.toBeInTheDocument()
  })
})
