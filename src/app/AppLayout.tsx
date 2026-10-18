import { useState } from 'react'
import { Outlet } from 'react-router'
import { UsePromptProvider } from '@/components/UsePromptProvider'
import { Header } from './Header'
import { SearchDialog } from './SearchDialog'
import { Sidebar } from './Sidebar'
import { useHotkey } from './use-hotkey'
import { useUiPrefs } from './ui-prefs-context'

export function AppLayout() {
  const { toggleSidebar } = useUiPrefs()
  const [searching, setSearching] = useState(false)
  useHotkey('mod+b', toggleSidebar)
  useHotkey('mod+k', () => setSearching((v) => !v), { inDialog: true })

  return (
    <UsePromptProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header onSearch={() => setSearching(true)} />
          <main className="flex w-full flex-col gap-3.5 px-5 py-[18px] max-sm:px-4">
            <Outlet />
          </main>
        </div>
      </div>
      <SearchDialog open={searching} onOpenChange={setSearching} />
    </UsePromptProvider>
  )
}
