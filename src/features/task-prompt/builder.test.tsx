import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createProject, updateProject } from '@/lib/db/projects'
import { updateSettings } from '@/lib/db/settings'
import { clearDb, renderApp } from '@/test/render-app'

beforeEach(clearDb)

const preview = () => screen.getByLabelText('Xem trước prompt')

describe('Trình tạo prompt', () => {
  it('trang chọn loại có 5 nhóm, 18 loại và gợi ý theo giai đoạn của dự án', async () => {
    const p = await createProject({ name: 'Prompt Studio' })
    await updateProject(p.id, { currentPhase: 3 })
    await updateSettings({ currentProjectId: p.id })
    renderApp('/prompt')
    expect(
      await screen.findByText(/đang ở giai đoạn 3 · Thiết kế. Nên dùng loại: Thiết kế giao diện/),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(5)
    expect(
      screen
        .getAllByRole('link', { name: /./ })
        .filter((a) => a.getAttribute('href')?.startsWith('/prompt/')),
    ).toHaveLength(18)
  })

  it('"Sửa lỗi" tích sẵn đúng gợi ý; tích/bỏ tích thì xem trước đổi theo', async () => {
    const user = userEvent.setup()
    renderApp('/prompt/SUA_LOI')
    expect(await screen.findByRole('heading', { name: 'Sửa lỗi', level: 1 })).toBeInTheDocument()

    const rb01 = screen.getByRole('checkbox', { name: /Chỉ làm đúng yêu cầu/ })
    expect(rb01).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /Tìm hiểu trước khi kết luận/ })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /Không thêm thư viện/ })).not.toBeChecked()
    expect(preview()).toHaveTextContent('Chỉ thay đổi những gì được yêu cầu')

    await user.click(rb01)
    expect(preview()).not.toHaveTextContent('Chỉ thay đổi những gì được yêu cầu')

    await user.type(
      screen.getByRole('textbox', { name: /^Nhiệm vụ/ }),
      'Màn hình trắng khi bấm Lưu',
    )
    expect(preview()).toHaveTextContent('Sửa lỗi: Màn hình trắng khi bấm Lưu')
  })

  it('chỉ chọn được 1 trong 3 mức tự chủ', async () => {
    const user = userEvent.setup()
    renderApp('/prompt/TU_DO')
    const ask = await screen.findByRole('checkbox', { name: /Hỏi trước khi làm/ })
    const auto = screen.getByRole('checkbox', { name: /Tự làm đến cùng/ })
    expect(ask).toBeChecked()
    await user.click(auto)
    expect(auto).toBeChecked()
    expect(ask).not.toBeChecked()
  })

  it('lấy bối cảnh từ Hồ sơ dự án đang chọn', async () => {
    const p = await createProject({ name: 'Web bán hàng', description: 'Cửa hàng gia đình' })
    await updateProject(p.id, { profile: { ...p.profile, techStack: 'Next.js' } })
    await updateSettings({ currentProjectId: p.id })
    renderApp('/prompt/TINH_NANG')
    expect(await screen.findByText(/Dự án: Web bán hàng – Cửa hàng gia đình/)).toBeInTheDocument()
    expect(preview()).toHaveTextContent('Tech stack: Next.js')
  })

  it('chọn "Khác…" trong danh sách thì gõ được lựa chọn riêng', async () => {
    const user = userEvent.setup()
    renderApp('/prompt/SUA_LOI')
    const freq = await screen.findByLabelText('Tần suất')
    await user.selectOptions(freq, 'Khác…')
    await user.type(screen.getByLabelText('Tần suất – Khác…'), 'Mỗi sáng thứ Hai')
    expect(preview()).toHaveTextContent('Tần suất: Mỗi sáng thứ Hai')
  })

  it('Copy bằng nút và Ctrl+Enter', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    renderApp('/prompt/TU_DO')
    await user.click(await screen.findByRole('button', { name: /Copy/ }))
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('# Vai trò'))
    expect(await screen.findByRole('status')).toHaveTextContent('Đã copy')
    await user.keyboard('{Control>}{Enter}{/Control}')
    expect(writeText).toHaveBeenCalledTimes(2)
  })

  it('loại không tồn tại thì báo lỗi', async () => {
    renderApp('/prompt/KHONG_CO')
    expect(await screen.findByText('Không có loại prompt này.')).toBeInTheDocument()
    expect(
      within(screen.getByRole('main')).getByRole('link', { name: 'Tạo prompt' }),
    ).toBeInTheDocument()
  })
})
