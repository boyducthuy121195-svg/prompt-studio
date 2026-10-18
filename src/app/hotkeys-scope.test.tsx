import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { savePrompt, togglePin } from '@/lib/db/prompts'
import { clearDb, renderApp } from '@/test/render-app'

beforeEach(clearDb)

describe('phím tắt khi đang mở hộp thoại', () => {
  it('Ctrl+Enter trong Điền nhanh chỉ copy nội dung đã điền, không copy cả prompt của trang bên dưới', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    const p = await savePrompt({
      projectId: null,
      title: 'Báo lỗi',
      typeCode: 'SUA_LOI',
      body: 'Khi {{thao_tac}} thì lỗi.',
    })
    await togglePin(p.id)
    renderApp('/prompt/TU_DO')
    const aside = screen.getByRole('complementary')
    await user.click(
      await within(aside).findByRole('button', { name: 'Điền nhanh rồi copy: Báo lỗi' }),
    )
    const dialog = await screen.findByRole('dialog', { name: 'Điền nhanh: Báo lỗi' })
    await user.type(within(dialog).getByLabelText('Thao tac'), 'bấm Lưu')
    await user.keyboard('{Control>}{Enter}{/Control}')
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('Khi bấm Lưu thì lỗi.')
  })

  it('Ctrl+S khi đang mở hộp Tìm nhanh không mở hộp Lưu của bảng nhập', async () => {
    const user = userEvent.setup()
    renderApp('/prompt/TU_DO')
    await screen.findByRole('textbox', { name: /^Nhiệm vụ/ })
    await user.keyboard('{Control>}k{/Control}')
    await screen.findByRole('combobox', { name: 'Từ khóa tìm kiếm' })
    await user.keyboard('{Control>}s{/Control}')
    expect(screen.queryByRole('dialog', { name: 'Lưu vào thư viện' })).not.toBeInTheDocument()
  })
})
