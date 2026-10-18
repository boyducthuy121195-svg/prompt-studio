import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setProviderFactory } from '@/lib/ai'
import { createMockProvider } from '@/lib/ai/mock'
import { getAgentsDoc } from '@/lib/db/agents'
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

const PROPOSAL = `# AGENTS.md – Web bán hàng

## 1. Tổng quan dự án
Trang bán hàng nhỏ.

## 9. Ranh giới
- 🚫 Không commit API key.`

async function setup() {
  const mock = createMockProvider({
    json: {
      scores: { clarity: 4, specificity: 3, context: 2, consistency: 9, length: 7 },
      issues: [{ level: 'high', text: 'Thiếu lệnh chạy test → thêm `npm test`.' }],
      proposal: PROPOSAL,
    },
  })
  setProviderFactory(() => mock)
  const p = await createProject({ name: 'Web bán hàng' })
  await updateSettings({ currentProjectId: p.id, claudeKey: 'sk-ant-test' })
  renderApp('/improve')
  return { mock, project: p }
}

describe('Cải thiện', () => {
  it('tải file lên, phân tích hiện điểm và vấn đề, chấp nhận đề xuất rồi dùng làm AGENTS.md', async () => {
    const user = userEvent.setup()
    const { mock, project } = await setup()
    const file = new File(['viết code sạch'], 'CLAUDE.md', { type: 'text/markdown' })
    await user.upload(await screen.findByLabelText('Tải file lên (.md, .txt)'), file)
    expect(await screen.findByLabelText('Nội dung')).toHaveValue('viết code sạch')
    expect(screen.getByLabelText('Loại nội dung')).toHaveValue('agents')

    await user.click(screen.getByRole('button', { name: '✨ Phân tích bằng AI' }))
    expect(await screen.findByText('Thiếu lệnh chạy test → thêm `npm test`.')).toBeInTheDocument()
    expect(screen.getByText('4/10')).toBeInTheDocument()
    expect(mock.calls[0].prompt).toContain('viết code sạch')

    await user.click(screen.getByRole('button', { name: 'Xem bản đề xuất' }))
    const dialog = await screen.findByRole('dialog', { name: 'Bản đề xuất của AI' })
    await user.click(within(dialog).getByRole('button', { name: 'Chấp nhận thay đổi' }))
    expect(screen.getByLabelText('Nội dung')).toHaveValue(PROPOSAL)

    await user.click(screen.getByRole('button', { name: 'Dùng làm AGENTS.md của "Web bán hàng"' }))
    expect(await screen.findByText(/10 đang bật/)).toBeInTheDocument()
    await waitFor(async () => {
      const doc = await getAgentsDoc(project.id)
      const overview = doc?.sections.find((s) => s.key === 'overview')
      expect(overview?.content).toContain('Trang bán hàng nhỏ.')
    })
  })

  it('chưa có key thì báo lỗi kèm link Cài đặt', async () => {
    const user = userEvent.setup()
    renderApp('/improve')
    await user.type(await screen.findByLabelText('Nội dung'), 'prompt cũ')
    await user.click(screen.getByRole('button', { name: '✨ Phân tích bằng AI' }))
    const alert = await screen.findByRole('alert')
    expect(within(alert).getByRole('link', { name: /Cài đặt/ })).toBeInTheDocument()
  })
})
