import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setProviderFactory } from '@/lib/ai'
import { createMockProvider } from '@/lib/ai/mock'
import { getAgentsDoc } from '@/lib/db/agents'
import { createProject, updateProject } from '@/lib/db/projects'
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
  // Một kịch bản dùng chung cho cả 2 bước: Zod chỉ lấy các trường mỗi bước cần
  const mock = createMockProvider({
    json: {
      scores: { clarity: 4, specificity: 3, context: 2, consistency: 9, length: 7 },
      issues: [
        { level: 'high', text: 'Thiếu lệnh chạy test', fix: 'Thêm `npm test` vào mục Lệnh.' },
        { level: 'medium', text: 'Câu "viết code sạch" mơ hồ', fix: 'Đổi thành quy tắc cụ thể.' },
        { level: 'low', text: 'Thiếu ví dụ', fix: 'Thêm 1 ví dụ ✅/❌.' },
      ],
      proposal: PROPOSAL,
      changes: ['Thêm mục Tổng quan và Ranh giới'],
    },
  })
  setProviderFactory(() => mock)
  const p = await createProject({ name: 'Web bán hàng' })
  await updateProject(p.id, { profile: { ...p.profile, techStack: 'Next.js' } })
  await updateSettings({ currentProjectId: p.id, claudeKey: 'sk-ant-test' })
  renderApp('/improve')
  return { mock, project: p }
}

describe('Cải thiện', () => {
  it('phân tích theo hồ sơ dự án, chọn vấn đề, AI chỉ viết lại theo vấn đề đã chọn, rồi dùng làm AGENTS.md', async () => {
    const user = userEvent.setup()
    const { mock, project } = await setup()
    const file = new File(['viết code sạch'], 'CLAUDE.md', { type: 'text/markdown' })
    await user.upload(await screen.findByLabelText('Tải file lên (.md, .txt)'), file)
    expect(await screen.findByLabelText('Nội dung')).toHaveValue('viết code sạch')
    expect(screen.getByLabelText('Loại nội dung')).toHaveValue('agents')
    expect(screen.getByText('AI sẽ đánh giá theo hồ sơ dự án "Web bán hàng".')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '✨ Phân tích bằng AI' }))
    expect(await screen.findByText('Thêm `npm test` vào mục Lệnh.')).toBeInTheDocument()
    expect(screen.getByText('4/10')).toBeInTheDocument()
    expect(mock.calls[0].prompt).toContain('Tech stack: Next.js')
    expect(mock.calls[0].system).toContain('Ranh giới có đủ 3 mức')

    // Mặc định tích vấn đề mức Cao và TB; bỏ tích một vấn đề
    const high = screen.getByRole('checkbox', { name: 'Sửa vấn đề: Thiếu lệnh chạy test' })
    const low = screen.getByRole('checkbox', { name: 'Sửa vấn đề: Thiếu ví dụ' })
    expect(high).toBeChecked()
    expect(low).not.toBeChecked()
    await user.click(
      screen.getByRole('checkbox', { name: 'Sửa vấn đề: Câu "viết code sạch" mơ hồ' }),
    )
    await user.click(screen.getByRole('button', { name: '✨ Viết lại theo 1 vấn đề đã chọn' }))

    const dialog = await screen.findByRole('dialog', { name: 'Bản viết lại theo 1 vấn đề đã chọn' })
    expect(await within(dialog).findByText('Thêm mục Tổng quan và Ranh giới')).toBeInTheDocument()
    expect(dialog).toHaveTextContent('Từng vấn đề đã được sửa thế nào')
    expect(mock.calls).toHaveLength(2)
    expect(mock.calls[1].prompt).toContain(
      '<van_de_can_sua>\n1. Thiếu lệnh chạy test → Thêm `npm test` vào mục Lệnh.\n</van_de_can_sua>',
    )
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

  it('bỏ tích hết vấn đề thì không viết lại được', async () => {
    const user = userEvent.setup()
    await setup()
    await user.type(await screen.findByLabelText('Nội dung'), 'prompt cũ')
    await user.click(screen.getByRole('button', { name: '✨ Phân tích bằng AI' }))
    await user.click(
      await screen.findByRole('checkbox', { name: 'Sửa vấn đề: Thiếu lệnh chạy test' }),
    )
    await user.click(
      screen.getByRole('checkbox', { name: 'Sửa vấn đề: Câu "viết code sạch" mơ hồ' }),
    )
    expect(screen.getByRole('button', { name: '✨ Viết lại theo 0 vấn đề đã chọn' })).toBeDisabled()
    expect(screen.getByText('Tích ít nhất một vấn đề để AI viết lại.')).toBeInTheDocument()
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
