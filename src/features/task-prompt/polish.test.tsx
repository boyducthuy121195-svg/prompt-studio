import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setProviderFactory } from '@/lib/ai'
import { createMockProvider, type MockScript } from '@/lib/ai/mock'
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
  it('trau chuốt ô Nhiệm vụ: chữ hiện dần, so sánh, Chấp nhận thì thay nội dung ô', async () => {
    const user = userEvent.setup()
    const mock = await withAI({ text: 'Lỗi runtime: blank screen khi submit form Lưu.' })
    renderApp('/prompt/SUA_LOI')
    const task = await screen.findByRole('textbox', { name: /^Nhiệm vụ/ })
    await user.type(task, 'bấm lưu thì màn hình trắng')
    await user.click(screen.getByRole('button', { name: 'Trau chuốt ô Nhiệm vụ bằng AI' }))

    const dialog = await screen.findByRole('dialog', { name: '✨ Trau chuốt: Nhiệm vụ' })
    expect(await within(dialog).findByText('blank screen', { exact: false })).toBeInTheDocument()
    expect(mock.calls[0].effort).toBe('low')
    expect(mock.calls[0].prompt).toContain('bấm lưu thì màn hình trắng')

    await user.click(within(dialog).getByRole('button', { name: 'Chấp nhận thay đổi' }))
    expect(task).toHaveValue('Lỗi runtime: blank screen khi submit form Lưu.')
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
      },
    })
    renderApp('/prompt/SUA_LOI')
    await user.click(await screen.findByRole('button', { name: '✨ Trau chuốt toàn bộ' }))
    const dialog = await screen.findByRole('dialog', { name: '✨ Trau chuốt toàn bộ prompt' })
    expect(await within(dialog).findByText('Chuẩn hóa thuật ngữ')).toBeInTheDocument()
    expect(mock.calls[0].effort).toBe('medium')
    await user.type(within(dialog).getByLabelText('Trình duyệt nào?'), 'Chrome')
    await user.click(within(dialog).getByRole('button', { name: 'Chấp nhận thay đổi' }))

    expect(preview()).toHaveTextContent('Sửa lỗi blank screen.')
    expect(preview()).toHaveTextContent('Trình duyệt nào? → Chrome')
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
