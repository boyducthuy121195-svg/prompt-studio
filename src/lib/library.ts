import type { SavedPrompt } from '@/types/models'
import { standardProcessPrompts } from './prompts/standard-process'
import type { PromptTypeCode } from './prompts/types'
import { parseVariables } from './prompts/variables'

/** Một mục trong Thư viện: prompt có sẵn của Quy trình chuẩn (chỉ đọc) hoặc prompt người dùng đã lưu. */
export interface LibraryItem {
  /** Mã dùng để ghim: 'std:<id>' với prompt có sẵn, id gốc với prompt đã lưu */
  pinId: string
  source: 'std' | 'saved'
  title: string
  desc: string
  typeCode: PromptTypeCode | string
  body: string
  tags: string[]
  saved?: SavedPrompt
}

export const STD_PREFIX = 'std:'

export function stdItems(): LibraryItem[] {
  return standardProcessPrompts().map((p) => ({
    pinId: STD_PREFIX + p.id,
    source: 'std',
    title: p.title,
    desc: p.desc,
    typeCode: p.typeCode,
    body: p.body,
    tags: [],
  }))
}

export function savedItem(p: SavedPrompt): LibraryItem {
  const firstLine = p.body.split('\n').find((l) => l.trim() && !l.startsWith('#')) ?? ''
  return {
    pinId: p.id,
    source: 'saved',
    title: p.title,
    desc: firstLine.length > 120 ? firstLine.slice(0, 117) + '…' : firstLine,
    typeCode: p.typeCode,
    body: p.body,
    tags: p.tags,
    saved: p,
  }
}

/** Đổi danh sách mã đã ghim thành mục thư viện; mã không còn tồn tại thì bỏ qua. */
export function resolvePins(pins: readonly string[], saved: readonly SavedPrompt[]): LibraryItem[] {
  const std = new Map(stdItems().map((i) => [i.pinId, i]))
  const byId = new Map(saved.map((p) => [p.id, p]))
  return pins.flatMap((id) => {
    const item = std.get(id) ?? (byId.has(id) ? savedItem(byId.get(id)!) : undefined)
    return item ? [item] : []
  })
}

export function hasVariables(item: Pick<LibraryItem, 'body'>): boolean {
  return parseVariables(item.body).length > 0
}
