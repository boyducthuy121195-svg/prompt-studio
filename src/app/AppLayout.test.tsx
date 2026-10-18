import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { ToastProvider } from '@/components/Toast'
import { UI_PREFS_KEY } from '@/lib/ui-prefs'
import { NAV_ITEMS } from './nav-items'
import { routes } from './routes'
import { UiPrefsProvider } from './UiPrefsProvider'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <UiPrefsProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </UiPrefsProvider>,
  )
  return router
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('Khung giao diện', () => {
  it('thanh bên có đủ 7 mục, mục "Mẫu Word/Excel" gắn nhãn Sắp có', () => {
    renderAt('/projects')
    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' })
    const links = within(nav).getAllByRole('link')
    expect(links).toHaveLength(NAV_ITEMS.length)
    expect(within(nav).getByRole('link', { name: /Mẫu Word\/Excel/ })).toHaveTextContent('Sắp có')
  })

  it('bấm mục trên thanh bên thì chuyển trang', async () => {
    const user = userEvent.setup()
    const router = renderAt('/projects')
    await user.click(screen.getByRole('link', { name: 'Thư viện' }))
    expect(router.state.location.pathname).toBe('/library')
    expect(screen.getByRole('heading', { name: 'Thư viện', level: 1 })).toBeInTheDocument()
  })

  it('thu gọn thanh bên bằng nút và bằng Ctrl+B, lựa chọn được ghi nhớ', async () => {
    const user = userEvent.setup()
    renderAt('/projects')
    const aside = screen.getByRole('complementary')
    expect(aside).toHaveAttribute('data-collapsed', 'false')

    await user.click(screen.getByRole('button', { name: 'Thu gọn thanh bên' }))
    expect(aside).toHaveAttribute('data-collapsed', 'true')
    expect(JSON.parse(localStorage.getItem(UI_PREFS_KEY) ?? '{}')).toMatchObject({
      sidebarCollapsed: true,
    })

    await user.keyboard('{Control>}b{/Control}')
    expect(aside).toHaveAttribute('data-collapsed', 'false')
  })

  it('chuyển sáng/tối gắn class dark lên trang', async () => {
    const user = userEvent.setup()
    renderAt('/projects')
    await user.click(screen.getByRole('button', { name: 'Chuyển sang giao diện tối' }))
    expect(document.documentElement).toHaveClass('dark')
    await user.click(screen.getByRole('button', { name: 'Chuyển sang giao diện sáng' }))
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('địa chỉ không tồn tại hiện trang báo lỗi tiếng Việt', () => {
    renderAt('/khong-co')
    expect(screen.getByRole('heading', { name: 'Không tìm thấy trang' })).toBeInTheDocument()
  })
})
