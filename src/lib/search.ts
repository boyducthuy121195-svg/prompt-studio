import type { LibraryItem } from './library'
import type { PromptTypeDef } from './prompts/types'

/** Một kết quả trong hộp Tìm nhanh (Ctrl+K). */
export type SearchItem =
  | { kind: 'project'; id: string; title: string; desc: string; to: string }
  | { kind: 'type'; id: string; title: string; desc: string; to: string }
  | { kind: 'prompt'; id: string; title: string; desc: string; item: LibraryItem }
  | { kind: 'page'; id: string; title: string; desc: string; to: string }

/** Bỏ dấu tiếng Việt và viết thường để gõ "sua loi" vẫn tìm được "Sửa lỗi". */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
}

export function buildSearchIndex(input: {
  projects: readonly { id: string; name: string; description: string }[]
  types: readonly PromptTypeDef[]
  prompts: readonly LibraryItem[]
  pages: readonly { path: string; label: string }[]
  labels: { typeDesc: (desc: string) => string; page: string }
}): SearchItem[] {
  return [
    ...input.projects.map((p): SearchItem => ({
      kind: 'project',
      id: `project:${p.id}`,
      title: p.name,
      desc: p.description,
      to: `/projects/${p.id}`,
    })),
    ...input.types.map((t): SearchItem => ({
      kind: 'type',
      id: `type:${t.code}`,
      title: t.name,
      desc: input.labels.typeDesc(t.desc),
      to: `/prompt/${t.code}`,
    })),
    ...input.prompts.map((i): SearchItem => ({
      kind: 'prompt',
      id: `prompt:${i.pinId}`,
      title: i.title,
      desc: i.desc,
      item: i,
    })),
    ...input.pages.map((p): SearchItem => ({
      kind: 'page',
      id: `page:${p.path}`,
      title: p.label,
      desc: input.labels.page,
      to: p.path,
    })),
  ]
}

/**
 * Lọc theo mọi từ đã gõ (không phân biệt dấu). Ưu tiên: tên bắt đầu bằng từ khóa → tên chứa
 * từ khóa → chỉ mô tả chứa từ khóa. Ô tìm trống thì trả về các mục đầu tiên.
 */
export function searchItems(items: readonly SearchItem[], query: string, limit = 20): SearchItem[] {
  const q = normalize(query)
  if (!q) return items.slice(0, limit)
  const words = q.split(/\s+/)
  const scored: { item: SearchItem; score: number; i: number }[] = []
  items.forEach((item, i) => {
    const title = normalize(item.title)
    const all = `${title} ${normalize(item.desc)}`
    if (!words.every((w) => all.includes(w))) return
    const score = title.startsWith(q) ? 0 : words.every((w) => title.includes(w)) ? 1 : 2
    scored.push({ item, score, i })
  })
  return scored
    .sort((a, b) => a.score - b.score || a.i - b.i)
    .slice(0, limit)
    .map((s) => s.item)
}
