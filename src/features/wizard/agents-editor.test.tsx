import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getAgentsDoc } from '@/lib/db/agents'
import { createProject } from '@/lib/db/projects'
import { updateSettings } from '@/lib/db/settings'
import { db } from '@/lib/db/schema'
import { clearDb, renderApp } from '@/test/render-app'

// CodeMirror cần trình duyệt thật; trong test đơn vị thay bằng ô nhập thường
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
const downloads = vi.hoisted(() => [] as { name: string; type: string }[])
vi.mock('@/lib/download', () => ({
  downloadFile: (name: string, _data: unknown, type: string) => downloads.push({ name, type }),
}))

beforeEach(async () => {
  await clearDb()
  downloads.length = 0
})

async function withProject() {
  const p = await createProject({ name: 'Prompt Studio' })
  await updateSettings({ currentProjectId: p.id })
  return p
}

describe('AGENTS.md – chỉnh sửa theo mục', () => {
  it('chưa chọn dự án thì hướng dẫn chọn dự án', async () => {
    renderApp('/agents')
    expect(await screen.findByText(/Chọn hoặc tạo một dự án trước/)).toBeInTheDocument()
  })

  it('tạo khung 10 mục; mục bắt buộc không có ô tắt; tắt được mục tùy chọn', async () => {
    const user = userEvent.setup()
    const p = await withProject()
    renderApp('/agents')
    expect(await screen.findByText('10/10 đang bật')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Tắt mục Lệnh' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Tắt mục Bẫy thường gặp' }))
    expect(screen.getByText('9/10 đang bật')).toBeInTheDocument()
    expect(await getAgentsDoc(p.id)).toBeDefined()
  })

  it('sửa nội dung thì khung kiểm tra cập nhật; lưu bằng Ctrl+S ghi lịch sử', async () => {
    const user = userEvent.setup()
    const p = await withProject()
    renderApp('/agents')
    const editor = await screen.findByLabelText('Nội dung mục')
    const checks = screen.getByRole('list', { name: 'Kiểm tra chất lượng' })
    expect(within(checks).getByText(/Mục "Tổng quan dự án" còn chỗ trống/)).toBeInTheDocument()

    await user.clear(editor)
    await user.type(editor, 'App tạo prompt cá nhân. Viết code sạch.')
    expect(
      within(checks).queryByText(/Mục "Tổng quan dự án" còn chỗ trống/),
    ).not.toBeInTheDocument()
    expect(within(checks).getByText(/"code sạch" là cách nói mơ hồ/)).toBeInTheDocument()
    expect(screen.getAllByText('Chưa lưu').length).toBeGreaterThan(0)

    await user.keyboard('{Control>}s{/Control}')
    await waitFor(async () =>
      expect((await getAgentsDoc(p.id))?.sections.find((s) => s.key === 'overview')?.content).toBe(
        'App tạo prompt cá nhân. Viết code sạch.',
      ),
    )
    expect(await db.revisions.count()).toBe(1)
  })

  it('thêm mục tùy chỉnh, đổi thứ tự, xem cả file', async () => {
    const user = userEvent.setup()
    await withProject()
    renderApp('/agents')
    await user.type(await screen.findByLabelText('Tên mục mới'), 'Quy tắc đặt tên')
    await user.click(screen.getByRole('button', { name: 'Thêm' }))
    expect(screen.getByText('11/11 đang bật')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Đưa mục Quy tắc đặt tên lên' }))
    await user.click(screen.getByRole('button', { name: 'Xem cả file' }))
    // Tiêu đề khung soạn + tiêu đề trong file xem trước
    await waitFor(() =>
      expect(screen.getAllByRole('heading', { name: '10. Quy tắc đặt tên' })).toHaveLength(2),
    )
    expect(screen.getByRole('heading', { name: '11. Cách làm việc với tôi' })).toBeInTheDocument()
  })

  it('tải AGENTS.md và gói .zip', async () => {
    const user = userEvent.setup()
    await withProject()
    renderApp('/agents')
    await user.click(await screen.findByRole('button', { name: 'Tải AGENTS.md' }))
    await user.click(screen.getByRole('button', { name: /Tải gói .zip/ }))
    expect(downloads).toEqual([
      { name: 'AGENTS.md', type: 'text/markdown;charset=utf-8' },
      { name: 'agents-md.zip', type: 'application/zip' },
    ])
  })
})
