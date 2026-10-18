import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { routes } from '@/app/routes'
import { UiPrefsProvider } from '@/app/UiPrefsProvider'
import { ToastProvider } from '@/components/Toast'

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <UiPrefsProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </UiPrefsProvider>
  )
}
