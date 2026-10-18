/**
 * Khớp phím tắt dạng 'mod+b', 'mod+enter', 'escape'.
 * 'mod' là Ctrl trên Windows/Linux và Cmd (⌘) trên macOS.
 */
export interface KeyLike {
  key: string
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  altKey: boolean
}

export function matchesHotkey(event: KeyLike, combo: string): boolean {
  const parts = combo.toLowerCase().split('+')
  const key = parts.pop()
  const wantMod = parts.includes('mod')
  const wantShift = parts.includes('shift')
  const wantAlt = parts.includes('alt')
  const hasMod = event.ctrlKey || event.metaKey
  return (
    event.key.toLowerCase() === key &&
    hasMod === wantMod &&
    event.shiftKey === wantShift &&
    event.altKey === wantAlt
  )
}
