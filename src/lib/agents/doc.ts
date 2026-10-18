import type { AgentsSection } from '@/types/models'
import { AGENTS_SECTIONS, getAgentsSection } from '@/lib/prompts/agents-skeleton'

/** Các thao tác thuần (không đụng IndexedDB) trên danh sách mục của AGENTS.md. */

export function skeletonSections(): AgentsSection[] {
  return AGENTS_SECTIONS.map((s, i) => ({
    key: s.key,
    title: s.title,
    enabled: true,
    order: i,
    content: s.template,
    custom: false,
  }))
}

export const isRequired = (key: string) => getAgentsSection(key)?.required ?? false

export function sortSections(sections: readonly AgentsSection[]): AgentsSection[] {
  return [...sections].sort((a, b) => a.order - b.order)
}

const renumber = (list: AgentsSection[]) => list.map((s, i) => ({ ...s, order: i }))

/** Đưa mục `key` tới vị trí `toIndex` (dùng cho kéo thả và nút lên/xuống). */
export function moveSection(
  sections: readonly AgentsSection[],
  key: string,
  toIndex: number,
): AgentsSection[] {
  const list = sortSections(sections)
  const from = list.findIndex((s) => s.key === key)
  if (from < 0) return list
  const [item] = list.splice(from, 1)
  list.splice(Math.max(0, Math.min(toIndex, list.length)), 0, item)
  return renumber(list)
}

/** Mục bắt buộc (★) không tắt được. */
export function toggleSection(sections: readonly AgentsSection[], key: string): AgentsSection[] {
  return sections.map((s) =>
    s.key === key && !isRequired(key) ? { ...s, enabled: !s.enabled } : s,
  )
}

export function addCustomSection(
  sections: readonly AgentsSection[],
  title: string,
): AgentsSection[] {
  const name = title.trim()
  if (!name) return [...sections]
  const key = `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  return renumber([
    ...sortSections(sections),
    { key, title: name, enabled: true, order: 0, content: '', custom: true },
  ])
}

/** Chỉ xóa được mục tùy chỉnh. */
export function removeSection(sections: readonly AgentsSection[], key: string): AgentsSection[] {
  return renumber(sortSections(sections).filter((s) => !(s.key === key && s.custom)))
}

export function updateSection(
  sections: readonly AgentsSection[],
  key: string,
  patch: Partial<Pick<AgentsSection, 'content' | 'title'>>,
): AgentsSection[] {
  return sections.map((s) => (s.key === key ? { ...s, ...patch } : s))
}

/** Ghép thành file AGENTS.md: chỉ các mục đang bật, đúng thứ tự, đánh số lại. */
export function renderAgentsMd(projectName: string, sections: readonly AgentsSection[]): string {
  const parts = sortSections(sections)
    .filter((s) => s.enabled)
    .map((s, i) => `## ${i + 1}. ${s.title}\n\n${s.content.trim()}`)
  return `# AGENTS.md – ${projectName.trim() || 'Dự án'}\n\n${parts.join('\n\n')}\n`
}
