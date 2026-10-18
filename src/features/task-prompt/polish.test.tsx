import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setProviderFactory } from '@/lib/ai'
import { createMockProvider, type MockScript } from '@/lib/ai/mock'
import { createProject, updateProject } from '@/lib/db/projects'
import { updateSettings } from '@/lib/db/settings'
import { clearDb, renderApp } from '@/test/render-app'

beforeEach(clearDb)
afterEach(() => setProviderFactory(null))

async function withAI(script: MockScript) {
  const mock = createMockProvider(script)
  setProviderFactory(() => mock)
  await updateSettings({ claudeKey: 'sk-ant-test' })
  return mock
}

const preview = () => screen.getByLabelText('Xem trước prompt')

describe('✨ Trau chuốt', () => {
  it('trau chuốt ô Nhiệm vụ theo ngữ cảnh dự án; tích gợi ý bổ sung thì thêm vào cuối ô', async () => {
    const user = userEvent.setup()
    const mock = await withAI({
      json: {
        rewritten: 'Lỗi runtime: blank screen khi submit form Lưu.',
        suggestions: ['Chỉ xảy ra trên Chrome bản mới nhất', 'Có thông báo lỗi trong console'],
      },
    })
    const p = await createProject({ name: 'Web bán hàng' })
    await updateProject(p.id, {
      currentPhase: 7,
      profile: { ...p.profile, techStack: 'React + Vite' },
    })
    await updateSettings({ currentProjectId: p.id })
    renderApp('/prompt/SUA_LOI')
    const task = await screen.findByRole('textbox', { name: /^Nhiệm vụ/ })
    await user.type(task, 'bấm lưu thì màn hình trắng')
    await user.type(screen.getByRole('textbox', { name: /^Thao tác gây lỗi/ }), 'Mở giỏ hàng')
    await user.click(screen.getByRole('button', { name: 'Trau chuốt ô Nhiệm vụ bằng AI' }))

    const dialog = await screen.findByRole('dialog', { name: '✨ Trau chuốt: Nhiệm vụ' })
    expect(await within(dialog).findByText('blank screen', { exact: false })).toBeInTheDocument()
    expect(dialog).toHaveTextContent('theo loại "Sửa lỗi", hồ sơ dự án')
    expect(mock.calls[0].effort).toBe('low')
    expect(mock.calls[0].prompt).toContain('<noi_dung>\nbấm lưu thì màn hình trắng')
    expect(mock.calls[0].prompt).toContain('Tech stack: React + Vite')
    expect(mock.calls[0].prompt).toContain('Giai đoạn hiện tại: 7 · Xây tính năng')
    expect(mock.calls[0].prompt).toContain('- Thao tác gây lỗi: Mở giỏ hàng')

    const picks = within(dialog).getByRole('region', { name: 'Gợi ý bổ sung cho ô này' })
    await user.click(
      within(picks).getByRole('checkbox', { name: 'Có thông báo lỗi trong console' }),
    )
    await user.click(within(dialog).getByRole('button', { name: 'Chấp nhận thay đổi' }))
    expect(task).toHaveValue(
      'Lỗi runtime: blank screen khi submit form Lưu.\n- Có thông báo lỗi trong console',
    )
    expect(preview()).toHaveTextContent('Sửa lỗi: Lỗi runtime: blank screen khi submit form Lưu.')
  })

  it('ô trống thì nhắc gõ nội dung trước, không gọi AI', async () => {
    const user = userEvent.setup()
    const mock = await withAI({ text: 'x' })
    renderApp('/prompt/SUA_LOI')
    await user.click(await screen.findByRole('button', { name: 'Trau chuốt ô Nhiệm vụ bằng AI' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Hãy gõ nội dung vào ô trước khi trau chuốt.',
    )
    expect(mock.calls).toHaveLength(0)
  })

  it('trau chuốt toàn bộ: hiện thay đổi và câu hỏi; câu trả lời được gắn vào prompt', async () => {
    const user = userEvent.setup()
    const mock = await withAI({
      json: {
        improved: '# Vai trò\nBạn là Senior Dev.\n\n# Nhiệm vụ\nSửa lỗi blank screen.',
        changes: ['Chuẩn hóa thuật ngữ'],
        questions: ['Trình duyệt nào?'],
        additions: [
          {
            block: 'Tiêu chí hoàn thành',
            text: 'Lưu được trên cả điện thoại',
            reason: 'Dự án có người dùng di động',
          },
          { block: 'Ràng buộc', text: 'Không đổi API', reason: 'Tránh ảnh hưởng app khác' },
        ],
      },
    })
    renderApp('/prompt/SUA_LOI')
    await user.click(await screen.findByRole('button', { name: '✨ Trau chuốt toàn bộ' }))
    const dialog = await screen.findByRole('dialog', { name: '✨ Trau chuốt toàn bộ prompt' })
    expect(await within(dialog).findByText('Chuẩn hóa thuật ngữ')).toBeInTheDocument()
    expect(mock.calls[0].effort).toBe('medium')
    expect(mock.calls[0].prompt).toContain('<loai_prompt>\nLoại: Sửa lỗi')
    expect(mock.calls[0].prompt).toContain('<goi_y_co_san_chua_chon>')
    const picks = within(dialog).getByRole('region', {
      name: 'Gợi ý thêm cho loại prompt và dự án này',
    })
    expect(picks).toHaveTextContent('Dự án có người dùng di động')
    await user.click(
      within(picks).getByRole('checkbox', {
        name: /Tiêu chí hoàn thành: Lưu được trên cả điện thoại/,
      }),
    )
    await user.type(within(dialog).getByLabelText('Trình duyệt nào?'), 'Chrome')
    await user.click(within(dialog).getByRole('button', { name: 'Chấp nhận thay đổi' }))

    expect(preview()).toHaveTextContent('Sửa lỗi blank screen.')
    expect(preview()).toHaveTextContent('Trình duyệt nào? → Chrome')
    expect(preview()).toHaveTextContent('# Tiêu chí hoàn thành - [ ] Lưu được trên cả điện thoại')
    expect(preview()).not.toHaveTextContent('Không đổi API')
    expect(screen.getByText(/Đang dùng bản đã trau chuốt bằng AI/)).toBeInTheDocument()

    // Sửa bảng nhập thì bỏ bản trau chuốt
    await user.type(screen.getByRole('textbox', { name: /^Nhiệm vụ/ }), 'a')
    expect(screen.queryByText(/Đang dùng bản đã trau chuốt/)).not.toBeInTheDocument()
    expect(preview()).toHaveTextContent('# Ràng buộc')
  })

  it('chưa có API key thì báo lỗi tiếng Việt kèm đường tới Cài đặt', async () => {
    const user = userEvent.setup()
    renderApp('/prompt/TU_DO')
    await user.click(await screen.findByRole('button', { name: '✨ Trau chuốt toàn bộ' }))
    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Bạn chưa nhập API key Claude. Vào Cài đặt để nhập.',
    )
    expect(within(dialog).getByRole('link', { name: 'Đi tới Cài đặt' })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Chấp nhận thay đổi' })).toBeDisabled()
  })
})
