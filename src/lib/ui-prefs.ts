/**
 * Tùy chọn giao diện (sáng/tối, thu gọn thanh bên) lưu tạm trong localStorage.
 * Task 3 sẽ chuyển sang bảng Settings trong IndexedDB.
 */
export type Theme = 'light' | 'dark'

export interface UiPrefs {
  theme: Theme
  sidebarCollapsed: boolean
}

export const UI_PREFS_KEY = 'prompt-studio:ui-prefs'

export const DEFAULT_UI_PREFS: UiPrefs = { theme: 'light', sidebarCollapsed: false }

export function parseUiPrefs(raw: string | null): UiPrefs {
  if (!raw) return { ...DEFAULT_UI_PREFS }
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return { ...DEFAULT_UI_PREFS }
    const obj = data as Record<string, unknown>
    return {
      theme: obj.theme === 'dark' ? 'dark' : 'light',
      sidebarCollapsed: obj.sidebarCollapsed === true,
    }
  } catch {
    return { ...DEFAULT_UI_PREFS }
  }
}

export function loadUiPrefs(
  storage: Pick<Storage, 'getItem'> | undefined = safeStorage(),
): UiPrefs {
  try {
    return parseUiPrefs(storage?.getItem(UI_PREFS_KEY) ?? null)
  } catch {
    return { ...DEFAULT_UI_PREFS }
  }
}

export function saveUiPrefs(
  prefs: UiPrefs,
  storage: Pick<Storage, 'setItem'> | undefined = safeStorage(),
): void {
  try {
    storage?.setItem(UI_PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // Trình duyệt chặn lưu trữ: bỏ qua, app vẫn chạy với lựa chọn hiện tại.
  }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}
