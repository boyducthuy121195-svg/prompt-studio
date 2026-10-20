import { useState } from 'react'
import { Outlet } from 'react-router'
import { UsePromptProvider } from '@/components/UsePromptProvider'
import { FolderPermissionBanner } from '@/features/folder/FolderPermissionBanner'
import { useFolderSync } from '@/features/folder/use-folders'
import { useSettings } from '@/lib/db/hooks'
import { vi } from '@/lib/i18n/vi'
import { Header } from './Header'
import { SearchDialog } from './SearchDialog'
import { Sidebar } from './Sidebar'
import { useHotkey } from './use-hotkey'
import { useUiPrefs } from './ui-prefs-context'

export function AppLayout() {
  const { toggleSidebar } = useUiPrefs()
  const [searching, setSearching] = useState(false)
  // Không đọc được IndexedDB (ví dụ trình duyệt chặn lưu trữ): báo một lần cho mọi trang
  const dbFailed = useSettings().status === 'error'
  // Task 15: sau mỗi lần sửa, tự ghi ra thư mục trên máy (nếu đã chọn)
  useFolderSync()
  useHotkey('mod+b', toggleSidebar)
  useHotkey('mod+k', () => setSearching((v) => !v), { inDialog: true })

  return (
    <UsePromptProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header onSearch={() => setSearching(true)} />
          <main className="flex w-full flex-col gap-3.5 px-5 py-[18px] max-sm:px-4">
            {dbFailed && (
              <p
                role="alert"
                className="rounded-md border border-red-ink/30 bg-red-bg px-3 py-2 text-red-ink"
              >
                {vi.common.dbError}
              </p>
            )}
            <FolderPermissionBanner />
            <Outlet />
          </main>
        </div>
      </div>
      <SearchDialog open={searching} onOpenChange={setSearching} />
    </UsePromptProvider>
  )
}
