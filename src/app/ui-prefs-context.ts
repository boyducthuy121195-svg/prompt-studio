import { createContext, useContext } from 'react'
import type { UiPrefs } from '@/lib/ui-prefs'

export interface UiPrefsValue extends UiPrefs {
  toggleTheme: () => void
  toggleSidebar: () => void
}

export const UiPrefsContext = createContext<UiPrefsValue | null>(null)

export function useUiPrefs(): UiPrefsValue {
  const ctx = useContext(UiPrefsContext)
  if (!ctx) throw new Error('useUiPrefs phải nằm trong UiPrefsProvider')
  return ctx
}
