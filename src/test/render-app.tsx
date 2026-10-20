import { render } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { routes } from '@/app/routes'
import { UiPrefsProvider } from '@/app/UiPrefsProvider'
import { ToastProvider } from '@/components/Toast'
import { db } from '@/lib/db/schema'
import { clearFolders } from '@/lib/folder/store'
import { resetFolderStatuses } from '@/lib/folder/sync'

/** Dựng toàn bộ app tại một địa chỉ, dùng cho test giao diện. */
export function renderApp(path: string) {
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

export async function clearDb() {
  await Promise.all(db.tables.map((t) => t.clear()))
  await clearFolders()
  resetFolderStatuses()
}
