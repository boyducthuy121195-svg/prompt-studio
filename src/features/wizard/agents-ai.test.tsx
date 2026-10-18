import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setProviderFactory } from '@/lib/ai'
import { createMockProvider, type MockScript } from '@/lib/ai/mock'
import { createProject } from '@/lib/db/projects'
import { updateSettings } from '@/lib/db/settings'
import { clearDb, renderApp } from '@/test/render-app'

vi.mock('@/components/MarkdownEditor', () => ({
  MarkdownEditor: ({
    value,
    onChange,
    label,
  }: {
    value: string
    onChange: (v: string) => void
    label: string
  }) => <textarea aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} />,
}))

beforeEach(clearDb)
afterEach(() => setProviderFactory(null))

async function setup(script: MockScript) {
  const mock = createMockProvider(script)
  setProviderFactory(() => mock)
  const p = await createProject({ name: 'Prompt Studio' })
  await updateSettings({ currentProjectId: p.id, claudeKey: 'sk-ant-test' })
  renderApp('/agents')
  await screen.findByText('10/10 đang bật')
  return mock
}

describe('AGENTS.md – dùng AI', () => {
  it('Hỏi đáp 10 câu rồi AI viết AGENTS.md, chuyển sang chế độ chỉnh sửa', async () => {
    const user = userEvent.setup()
    const mock = await setup({
      json: {
        sections: [
          { key: 'overview', content: 'App tạo prompt cá nhân.' },
          { key: 'commands', content: '- Chạy: `npm run dev`' },
        ],
      },
    })
    await user.click(screen.getByRole('button', { name: 'Hỏi đáp' }))
    expect(screen.getByText('Mục 1/10')).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'MVP' }))
    for (let i = 0; i < 9; i++) await user.click(screen.getByRole('button', { name: 'Tiếp' }))
    expect(screen.getByText('Mục 10/10')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '✨ Tạo AGENTS.md bằng AI' }))

    expect(await screen.findByRole('status')).toHaveTextContent('AI đã viết xong AGENTS.md')
    expect(screen.getByLabelText('Nội dung mục')).toHaveValue('App tạo prompt cá nhân.')
    expect(mock.calls[0].effort).toBe('high')
    expect(mock.calls[0].prompt).toContain(
      '[overview] App làm gì, cho ai? Đang ở giai đoạn nào?\n- Chọn: MVP',
    )
  })

  it('Nhập tự do: AI xếp vào các mục và báo mục còn thiếu', async () => {
    const user = userEvent.setup()
    await setup({
      json: { sections: [{ key: 'testing', content: '- Vitest' }], missing: ['boundaries'] },
    })
    await user.click(screen.getByRole('button', { name: 'Nhập tự do' }))
    await user.type(screen.getByLabelText(/Dán ghi chú/), 'test bằng vitest')
    await user.click(screen.getByRole('button', { name: '✨ Phân loại vào 10 mục' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Còn thiếu: Ranh giới.')
    await user.click(screen.getByRole('button', { name: /^5\s*Kiểm thử/ }))
    expect(screen.getByLabelText('Nội dung mục')).toHaveValue('- Vitest')
  })

  it('✨ Ngắn gọn hơn cho một mục: xem so sánh rồi chấp nhận', async () => {
    const user = userEvent.setup()
    const mock = await setup({ text: '- `npm run dev`' })
    await user.click(screen.getByRole('button', { name: '✨ Ngắn gọn hơn' }))
    const dialog = await screen.findByRole('dialog', { name: '✨ Ngắn gọn hơn: Tổng quan dự án' })
    expect(await within(dialog).findByText('npm run dev', { exact: false })).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Chấp nhận thay đổi' }))
    expect(screen.getByLabelText('Nội dung mục')).toHaveValue('- `npm run dev`')
    expect(mock.calls[0].system).toContain('Rút gọn tối đa')
  })

  it('✨ Kiểm tra lại bằng AI hiện nhận xét', async () => {
    const user = userEvent.setup()
    await setup({ json: { checks: [{ level: 'warn', text: 'Thiếu lệnh test', section: 'Lệnh' }] } })
    await user.click(screen.getByRole('button', { name: '✨ Kiểm tra lại bằng AI' }))
    const list = await screen.findByRole('list', { name: 'Nhận xét của AI' })
    expect(list).toHaveTextContent('Lệnh: Thiếu lệnh test')
  })
})
