import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createProject } from '@/lib/db/projects'
import { listPrompts, savePrompt } from '@/lib/db/prompts'
import { getSettings, updateSettings } from '@/lib/db/settings'
import { clearDb, renderApp } from '@/test/render-app'

beforeEach(clearDb)

/** userEvent.setup() thay navigator.clipboard bằng bản giả, nên phải theo dõi sau khi setup. */
function setupUser() {
  const user = userEvent.setup()
  vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
  return user
}

describe('Thư viện', () => {
  it('lưu prompt từ bảng nhập (Ctrl+S) vào dự án đang chọn', async () => {
    const user = setupUser()
    const p = await createProject({ name: 'Prompt Studio' })
    await updateSettings({ currentProjectId: p.id })
    renderApp('/prompt/SUA_LOI')
    await user.type(await screen.findByRole('textbox', { name: /^Nhiệm vụ/ }), 'màn hình trắng')
    await user.keyboard('{Control>}s{/Control}')
    const dialog = await screen.findByRole('dialog', { name: 'Lưu vào thư viện' })
    expect(within(dialog).getByLabelText('Tên prompt')).toHaveValue('Sửa lỗi: màn hình trắng')
    await user.type(within(dialog).getByLabelText(/Thẻ/), 'bug')
    await user.click(within(dialog).getByRole('button', { name: 'Lưu' }))
    await waitFor(async () => expect(await listPrompts(p.id)).toHaveLength(1))
    const [saved] = await listPrompts(p.id)
    expect(saved.tags).toEqual(['bug'])
    expect(saved.body).toContain('Sửa lỗi: màn hình trắng')
  })

  it('tab Quy trình chuẩn có prompt có sẵn và bảng Phát triển thêm', async () => {
    renderApp('/library')
    expect(await screen.findByText('GĐ 1 – Khám phá ý tưởng')).toBeInTheDocument()
    expect(screen.getByText('Nghiên cứu kỹ thuật (spike)')).toBeInTheDocument()
    expect(
      screen.getByRole('cell', { name: 'Lớn: module mới, có công nghệ hoặc dữ liệu mới' }),
    ).toBeInTheDocument()
  })

  it('ghim prompt có biến, bấm trên thanh bên thì mở Điền nhanh và copy nội dung đã điền', async () => {
    const user = setupUser()
    await savePrompt({
      projectId: null,
      title: 'Sửa lỗi nhanh',
      typeCode: 'SUA_LOI',
      body: 'Khi tôi {{thao_tac}} thì lỗi. Ưu tiên {{muc|cao}}.',
    })
    renderApp('/library?tab=shared')
    await user.click(await screen.findByRole('button', { name: 'Ghim Sửa lỗi nhanh' }))
    await waitFor(async () => expect((await getSettings()).pins).toHaveLength(1))

    const aside = screen.getByRole('complementary')
    await user.click(
      await within(aside).findByRole('button', { name: 'Điền nhanh rồi copy: Sửa lỗi nhanh' }),
    )
    const dialog = await screen.findByRole('dialog', { name: 'Điền nhanh: Sửa lỗi nhanh' })
    await user.type(within(dialog).getByLabelText('Thao tac'), 'bấm Lưu')
    expect(within(dialog).getByLabelText('Nội dung sẽ được copy')).toHaveTextContent(
      'Khi tôi bấm Lưu thì lỗi. Ưu tiên cao.',
    )
    await user.click(within(dialog).getByRole('button', { name: /Copy/ }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'Khi tôi bấm Lưu thì lỗi. Ưu tiên cao.',
    )
  })

  it('prompt không có biến thì bấm ghim là copy ngay toàn bộ', async () => {
    const user = setupUser()
    renderApp('/library')
    await user.click(await screen.findByRole('button', { name: 'Ghim Kết thúc phiên làm việc' }))
    const aside = screen.getByRole('complementary')
    await user.click(
      await within(aside).findByRole('button', { name: 'Copy ngay: Kết thúc phiên làm việc' }),
    )
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('cập nhật PLAN.md và commit'),
    )
    expect(await screen.findByRole('status')).toHaveTextContent('Đã copy "Kết thúc phiên làm việc"')
  })

  it('sửa, mở lại trong bảng nhập và xóa prompt đã lưu', async () => {
    const user = setupUser()
    renderApp('/prompt/TU_DO')
    await user.type(await screen.findByRole('textbox', { name: /^Nhiệm vụ/ }), 'viết README')
    await user.click(screen.getByRole('button', { name: /^Lưu/ }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Lưu' }))
    await waitFor(async () => expect(await listPrompts(null)).toHaveLength(1))

    await user.click(
      within(screen.getByRole('navigation', { name: 'Điều hướng chính' })).getByRole('link', {
        name: 'Thư viện',
      }),
    )
    await user.click(await screen.findByRole('tab', { name: 'Dùng chung' }))
    await user.click(await screen.findByRole('button', { name: 'Mở bảng nhập' }))
    expect(await screen.findByRole('textbox', { name: /^Nhiệm vụ/ })).toHaveValue('viết README')

    await user.click(
      within(screen.getByRole('navigation', { name: 'Điều hướng chính' })).getByRole('link', {
        name: 'Thư viện',
      }),
    )
    await user.click(await screen.findByRole('tab', { name: 'Dùng chung' }))
    await user.click(await screen.findByRole('button', { name: 'Sửa' }))
    const edit = await screen.findByRole('dialog', { name: 'Sửa prompt' })
    const title = within(edit).getByLabelText('Tên prompt')
    await user.clear(title)
    await user.type(title, 'README mới')
    await user.click(within(edit).getByRole('button', { name: 'Lưu thay đổi' }))
    expect(await screen.findByText('README mới')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Xóa' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Xóa' }))
    await waitFor(async () => expect(await listPrompts(null)).toHaveLength(0))
  })
})
