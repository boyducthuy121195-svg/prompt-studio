import { useEffect, useState, type ReactNode } from 'react'
import { loadUiPrefs, saveUiPrefs, type UiPrefs } from '@/lib/ui-prefs'
import { UiPrefsContext, type UiPrefsValue } from './ui-prefs-context'

/** Giữ lựa chọn sáng/tối và thu gọn thanh bên, gắn class `dark` lên <html>. */
export function UiPrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UiPrefs>(loadUiPrefs)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', prefs.theme === 'dark')
    saveUiPrefs(prefs)
  }, [prefs])

  const value: UiPrefsValue = {
    ...prefs,
    toggleTheme: () => setPrefs((p) => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' })),
    toggleSidebar: () => setPrefs((p) => ({ ...p, sidebarCollapsed: !p.sidebarCollapsed })),
  }

  return <UiPrefsContext value={value}>{children}</UiPrefsContext>
}
