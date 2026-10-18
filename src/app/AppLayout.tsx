import { Outlet } from 'react-router'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useHotkey } from './use-hotkey'
import { useUiPrefs } from './ui-prefs-context'

export function AppLayout() {
  const { toggleSidebar } = useUiPrefs()
  useHotkey('mod+b', toggleSidebar)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex w-full flex-col gap-3.5 px-5 py-[18px] max-sm:px-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
