import { DEFAULT_UI_PREFS, loadUiPrefs, parseUiPrefs, saveUiPrefs, UI_PREFS_KEY } from './ui-prefs'

describe('parseUiPrefs', () => {
  it('trả về mặc định khi chưa có dữ liệu', () => {
    expect(parseUiPrefs(null)).toEqual(DEFAULT_UI_PREFS)
  })

  it('đọc đúng dữ liệu đã lưu', () => {
    expect(parseUiPrefs('{"theme":"dark","sidebarCollapsed":true}')).toEqual({
      theme: 'dark',
      sidebarCollapsed: true,
    })
  })

  it('bỏ qua dữ liệu hỏng hoặc giá trị lạ', () => {
    expect(parseUiPrefs('{không phải json')).toEqual(DEFAULT_UI_PREFS)
    expect(parseUiPrefs('"chuỗi"')).toEqual(DEFAULT_UI_PREFS)
    expect(parseUiPrefs('{"theme":"tím","sidebarCollapsed":"có"}')).toEqual(DEFAULT_UI_PREFS)
  })
})

describe('loadUiPrefs / saveUiPrefs', () => {
  it('lưu rồi đọc lại được', () => {
    const store = new Map<string, string>()
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    }
    saveUiPrefs({ theme: 'dark', sidebarCollapsed: true }, storage)
    expect(store.has(UI_PREFS_KEY)).toBe(true)
    expect(loadUiPrefs(storage)).toEqual({ theme: 'dark', sidebarCollapsed: true })
  })

  it('không làm hỏng app khi trình duyệt chặn lưu trữ', () => {
    const blocked = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }
    expect(loadUiPrefs(blocked)).toEqual(DEFAULT_UI_PREFS)
    expect(() => saveUiPrefs(DEFAULT_UI_PREFS, blocked)).not.toThrow()
  })
})
