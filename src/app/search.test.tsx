import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createProject } from '@/lib/db/projects'
import { savePrompt } from '@/lib/db/prompts'
import { clearDb, renderApp } from '@/test/render-app'

beforeEach(clearDb)

function setupUser() {
  const user = userEvent.setup()
  vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
  return user
}

describe('Tìm nhanh (Ctrl+K)', () => {
  it('Ctrl+K mở hộp, gõ không dấu tìm loại prompt, Enter để mở bảng nhập', async () => {
    const user = setupUser()
    const router = renderApp('/projects')
    await screen.findByRole('heading', { name: 'Dự án', level: 1 })
    await user.keyboard('{Control>}k{/Control}')
    const input = await screen.findByRole('combobox', { name: 'Từ khóa tìm kiếm' })
    expect(input).toHaveFocus()
    await user.type(input, 'sua loi')
    const first = within(screen.getByRole('listbox')).getAllByRole('option')[0]
    expect(first).toHaveTextContent('Sửa lỗi')
    expect(first).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{Enter}')
    await waitFor(() => expect(router.state.location.pathname).toBe('/prompt/SUA_LOI'))
    expect(screen.queryByRole('combobox', { name: 'Từ khóa tìm kiếm' })).not.toBeInTheDocument()
  })

  it('bấm ô tìm trên header cũng mở; mũi tên chọn dự án rồi Enter', async () => {
    const user = setupUser()
    const p = await createProject({ name: 'Web bán hàng', description: 'Cửa hàng gia đình' })
    const router = renderApp('/settings')
    await user.click(await screen.findByRole('button', { name: 'Mở hộp Tìm nhanh (Ctrl+K)' }))
    await user.type(await screen.findByRole('combobox', { name: 'Từ khóa tìm kiếm' }), 'gia dinh')
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('Web bán hàng')
    await user.keyboard('{Enter}')
    await waitFor(() => expect(router.state.location.pathname).toBe(`/projects/${p.id}`))
  })

  it('tìm prompt đã lưu có biến → Enter mở Điền nhanh; prompt không biến thì copy ngay', async () => {
    const user = setupUser()
    await savePrompt({
      projectId: null,
      title: 'Báo lỗi nhanh',
      typeCode: 'SUA_LOI',
      body: 'Khi {{thao_tac}} thì lỗi.',
    })
    renderApp('/projects')
    await user.keyboard('{Control>}k{/Control}')
    await user.type(
      await screen.findByRole('combobox', { name: 'Từ khóa tìm kiếm' }),
      'bao loi nhanh',
    )
    await user.keyboard('{Enter}')
    expect(
      await screen.findByRole('dialog', { name: 'Điền nhanh: Báo lỗi nhanh' }),
    ).toBeInTheDocument()
    await user.keyboard('{Escape}')

    await user.keyboard('{Control>}k{/Control}')
    await user.type(
      await screen.findByRole('combobox', { name: 'Từ khóa tìm kiếm' }),
      'ket thuc phien',
    )
    await user.keyboard('{Enter}')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('cập nhật PLAN.md và commit'),
    )
  })

  it('không có kết quả thì báo rõ', async () => {
    const user = setupUser()
    renderApp('/projects')
    await user.keyboard('{Control>}k{/Control}')
    await user.type(await screen.findByRole('combobox', { name: 'Từ khóa tìm kiếm' }), 'zzzqqq')
    expect(
      screen.getByText('Không tìm thấy gì cho "zzzqqq". Thử từ khóa ngắn hơn.'),
    ).toBeInTheDocument()
  })
})
