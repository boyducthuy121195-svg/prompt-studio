import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setProviderFactory } from '@/lib/ai'
import { AIError } from '@/lib/ai/errors'
import { createMockProvider } from '@/lib/ai/mock'
import { getSettings, updateSettings } from '@/lib/db/settings'
import { clearDb, renderApp } from '@/test/render-app'

beforeEach(clearDb)
afterEach(() => setProviderFactory(null))

describe('Cài đặt', () => {
  it('nhập key Claude, bấm Kiểm tra thấy hợp lệ; header hiện AI đang dùng', async () => {
    const user = userEvent.setup()
    setProviderFactory((_s, id) =>
      createMockProvider({ models: ['claude-opus-5-5', 'claude-haiku-5-5'] }, id),
    )
    renderApp('/settings')
    expect(await screen.findByText('AI: chưa cài đặt')).toBeInTheDocument()

    await user.type(await screen.findByLabelText('API key Claude (Anthropic)'), 'sk-ant-abc')
    await waitFor(async () => expect((await getSettings()).claudeKey).toBe('sk-ant-abc'))
    const claudeBlock = screen
      .getByLabelText('API key Claude (Anthropic)')
      .closest('div')!.parentElement!
    await user.click(within(claudeBlock).getByRole('button', { name: 'Kiểm tra' }))
    expect(
      await within(claudeBlock).findByText('Key hợp lệ. Tìm thấy 2 model.'),
    ).toBeInTheDocument()
    expect(await screen.findByText('AI: Claude · opus-5-5')).toBeInTheDocument()
  })

  it('key sai thì báo lỗi tiếng Việt', async () => {
    const user = userEvent.setup()
    setProviderFactory((_s, id) =>
      createMockProvider({ error: new AIError('invalid_key', id) }, id),
    )
    await updateSettings({ claudeKey: 'sai' })
    renderApp('/settings')
    const input = await screen.findByLabelText('API key Claude (Anthropic)')
    await user.click(
      within(input.closest('div')!.parentElement!).getByRole('button', { name: 'Kiểm tra' }),
    )
    expect(
      await screen.findByText('API key Claude không hợp lệ. Vào Cài đặt để kiểm tra lại.'),
    ).toBeInTheDocument()
  })

  it('kiểm tra key Gemini thì lấy danh sách model, tự chọn 3.8 Flash nếu có', async () => {
    const user = userEvent.setup()
    setProviderFactory((_s, id) =>
      createMockProvider(
        { models: ['gemini-2.5-pro', 'gemini-3.8-flash', 'gemini-3.8-flash-lite'] },
        id,
      ),
    )
    await updateSettings({ geminiKey: 'AIza-x' })
    renderApp('/settings')
    expect(await screen.findByText(/Bấm "Kiểm tra" ở ô key Gemini/)).toBeInTheDocument()
    const input = screen.getByLabelText('API key Gemini (Google)')
    await user.click(
      within(input.closest('div')!.parentElement!).getByRole('button', { name: 'Kiểm tra' }),
    )
    expect(await screen.findByText('Đã chọn Gemini 3.8 Flash.')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByLabelText('Model Gemini')).toHaveValue('gemini-3.8-flash'),
    )
    expect((await getSettings()).geminiModels).toHaveLength(3)
  })

  it('ngôn ngữ mặc định được dùng khi mở bảng nhập', async () => {
    await updateSettings({ language: 'en' })
    renderApp('/prompt/TU_DO')
    expect(await screen.findByLabelText('Ngôn ngữ của prompt')).toHaveValue('en')
    expect(screen.getByLabelText('Xem trước prompt')).toHaveTextContent('Respond in English.')
  })

  it('có bảng phím tắt và chuyển sáng/tối', async () => {
    const user = userEvent.setup()
    renderApp('/settings')
    expect(await screen.findByRole('table', { name: 'Phím tắt' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tối' }))
    expect(document.documentElement).toHaveClass('dark')
  })
})
