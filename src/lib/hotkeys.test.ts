import { matchesHotkey, type KeyLike } from './hotkeys'

const key = (k: string, mods: Partial<KeyLike> = {}): KeyLike => ({
  key: k,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  altKey: false,
  ...mods,
})

describe('matchesHotkey', () => {
  it('Ctrl+B và Cmd+B đều khớp mod+b', () => {
    expect(matchesHotkey(key('b', { ctrlKey: true }), 'mod+b')).toBe(true)
    expect(matchesHotkey(key('B', { metaKey: true }), 'mod+b')).toBe(true)
  })

  it('không khớp khi thiếu hoặc thừa phím bổ trợ', () => {
    expect(matchesHotkey(key('b'), 'mod+b')).toBe(false)
    expect(matchesHotkey(key('b', { ctrlKey: true, shiftKey: true }), 'mod+b')).toBe(false)
    expect(matchesHotkey(key('Escape', { ctrlKey: true }), 'escape')).toBe(false)
  })

  it('khớp phím không có phím bổ trợ', () => {
    expect(matchesHotkey(key('Escape'), 'escape')).toBe(true)
    expect(matchesHotkey(key('Enter', { ctrlKey: true }), 'mod+enter')).toBe(true)
  })
})
