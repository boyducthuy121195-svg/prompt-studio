import { useEffect, useRef, useState, type ReactNode } from 'react'
import { db } from '@/lib/db/schema'
import { updateSettings } from '@/lib/db/settings'
import { loadUiPrefs, saveUiPrefs, type UiPrefs } from '@/lib/ui-prefs'
import { UiPrefsContext, type UiPrefsValue } from './ui-prefs-context'

/**
 * Giữ lựa chọn sáng/tối và thu gọn thanh bên, gắn class `dark` lên <html>.
 * Nơi lưu chính là bảng Settings (IndexedDB). localStorage chỉ là bản sao để
 * lần mở app sau hiện đúng màu ngay, không bị nháy trắng trong lúc chờ IndexedDB.
 */
export function UiPrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UiPrefs>(loadUiPrefs)
  const loadedFromDb = useRef(false)

  useEffect(() => {
    let cancelled = false
    void db.settings
      .get('app')
      .then((saved) => {
        if (cancelled) return
        loadedFromDb.current = true
        if (saved) setPrefs({ theme: saved.theme, sidebarCollapsed: saved.sidebarCollapsed })
        else void updateSettings(loadUiPrefs()) // lần đầu: chuyển lựa chọn cũ vào Settings
      })
      .catch(() => {
        loadedFromDb.current = true // IndexedDB không dùng được: vẫn chạy bằng localStorage
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', prefs.theme === 'dark')
    saveUiPrefs(prefs)
  }, [prefs])

  const change = (fn: (p: UiPrefs) => UiPrefs) =>
    setPrefs((p) => {
      const next = fn(p)
      if (loadedFromDb.current) void updateSettings(next).catch(() => undefined)
      return next
    })

  const value: UiPrefsValue = {
    ...prefs,
    toggleTheme: () => change((p) => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' })),
    toggleSidebar: () => change((p) => ({ ...p, sidebarCollapsed: !p.sidebarCollapsed })),
  }

  return <UiPrefsContext value={value}>{children}</UiPrefsContext>
}
