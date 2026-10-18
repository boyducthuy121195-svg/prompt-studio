import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { routes } from '@/app/routes'
import { UiPrefsProvider } from '@/app/UiPrefsProvider'
import { ToastProvider } from '@/components/Toast'
import { createProject, getProject, listProjects } from '@/lib/db/projects'
import { db } from '@/lib/db/schema'

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

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

describe('Quản lý dự án', () => {
  it('chưa có dự án thì hiện hướng dẫn tạo dự án đầu tiên', async () => {
    renderAt('/projects')
    expect(await screen.findByText(/Chưa có dự án nào/)).toBeInTheDocument()
  })

  it('tạo dự án mới rồi chuyển sang trang chi tiết', async () => {
    const user = userEvent.setup()
    const router = renderAt('/projects')
    await user.click((await screen.findAllByRole('button', { name: 'Dự án mới' }))[0])
    const dialog = await screen.findByRole('dialog', { name: 'Tạo dự án mới' })

    await user.click(within(dialog).getByRole('button', { name: 'Tạo dự án' }))
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Hãy nhập tên dự án.')

    await user.type(within(dialog).getByLabelText('Tên dự án'), 'Web bán hàng')
    await user.click(within(dialog).getByRole('button', { name: 'Tạo dự án' }))

    expect(
      await screen.findByRole('heading', { name: 'Web bán hàng', level: 1 }),
    ).toBeInTheDocument()
    const [project] = await listProjects()
    expect(router.state.location.pathname).toBe(`/projects/${project.id}`)
    expect((await db.settings.get('app'))?.currentProjectId).toBe(project.id)
  })

  it('sửa hồ sơ, lưu bằng Ctrl+S và đặt giai đoạn hiện tại', async () => {
    const user = userEvent.setup()
    const p = await createProject({ name: 'Prompt Studio' })
    renderAt(`/projects/${p.id}`)

    const stack = await screen.findByLabelText('Công nghệ (tech stack)')
    await user.type(stack, 'React + Vite')
    expect(screen.getByText('Chưa lưu')).toBeInTheDocument()
    await user.keyboard('{Control>}s{/Control}')
    await waitFor(async () =>
      expect((await getProject(p.id))?.profile.techStack).toBe('React + Vite'),
    )
    expect(await screen.findByRole('status')).toHaveTextContent('Đã lưu hồ sơ dự án')

    await user.click(screen.getByRole('button', { name: /Thiết kế/ }))
    await waitFor(async () => expect((await getProject(p.id))?.currentPhase).toBe(3))
  })

  it('nhân bản và xóa dự án (có hộp xác nhận)', async () => {
    const user = userEvent.setup()
    const p = await createProject({ name: 'Gốc' })
    const router = renderAt(`/projects/${p.id}`)

    await user.click(await screen.findByRole('button', { name: 'Nhân bản' }))
    expect(
      await screen.findByRole('heading', { name: 'Gốc (bản sao)', level: 1 }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Xóa' }))
    const dialog = await screen.findByRole('dialog', { name: 'Xóa dự án "Gốc (bản sao)"?' })
    await user.click(within(dialog).getByRole('button', { name: 'Xóa vĩnh viễn' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/projects'))
    expect((await listProjects()).map((x) => x.name)).toEqual(['Gốc'])
  })

  it('địa chỉ dự án không tồn tại thì báo rõ ràng', async () => {
    renderAt('/projects/khong-co')
    expect(await screen.findByText(/Không tìm thấy dự án này/)).toBeInTheDocument()
  })
})
