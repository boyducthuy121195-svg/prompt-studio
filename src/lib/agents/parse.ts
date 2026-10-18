import type { AgentsSection } from '@/types/models'
import { AGENTS_SECTIONS } from '@/lib/prompts/agents-skeleton'
import { skeletonSections } from './doc'

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9& ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Từ khóa nhận diện mục chuẩn từ tiêu đề tiếng Việt hoặc tiếng Anh. */
const KEYWORDS: Record<string, string[]> = {
  overview: ['tong quan', 'overview', 'gioi thieu', 'about'],
  commands: ['lenh', 'command', 'build', 'setup'],
  structure: ['cau truc', 'structure', 'thu muc', 'layout'],
  conventions: ['quy uoc', 'convention', 'code style', 'coding standard', 'style'],
  testing: ['kiem thu', 'test'],
  git: ['git', 'pull request', 'commit'],
  security: ['bao mat', 'security', 'bi mat', 'secret'],
  gotchas: ['bay', 'gotcha', 'anti pattern', 'pitfall'],
  boundaries: ['ranh gioi', 'boundar', 'gioi han', 'do and don'],
  collaboration: ['cach lam viec', 'working with', 'collaboration', 'communication'],
}

function matchKey(title: string): string | null {
  const n = normalize(title)
  const exact = AGENTS_SECTIONS.find((s) => normalize(s.title) === n)
  if (exact) return exact.key
  for (const [key, words] of Object.entries(KEYWORDS))
    if (words.some((w) => n.includes(w))) return key
  return null
}

/**
 * Tách file AGENTS.md (Markdown) thành các mục theo tiêu đề "## ".
 * Tiêu đề khớp mục chuẩn thì điền vào mục đó; không khớp thì thành mục tùy chỉnh.
 * Mục chuẩn không có trong file sẽ trống và bị tắt (trừ mục bắt buộc).
 */
export function parseAgentsMd(md: string): AgentsSection[] {
  const base = skeletonSections().map((s) => ({
    ...s,
    content: '',
    enabled: AGENTS_SECTIONS.find((d) => d.key === s.key)!.required,
  }))
  const blocks: { title: string; lines: string[] }[] = []
  for (const line of md.split('\n')) {
    const h = line.match(/^##\s+(.*)$/)
    if (h) blocks.push({ title: h[1].replace(/^\d+[.)]\s*/, '').trim(), lines: [] })
    else blocks.at(-1)?.lines.push(line)
  }
  const used = new Set<string>()
  const custom: AgentsSection[] = []
  for (const b of blocks) {
    const content = b.lines.join('\n').trim()
    const key = matchKey(b.title)
    if (key && !used.has(key)) {
      used.add(key)
      const s = base.find((x) => x.key === key)!
      s.content = content
      s.enabled = true
    } else {
      custom.push({
        key: `custom-${custom.length + 1}`,
        title: b.title,
        enabled: true,
        order: 0,
        content,
        custom: true,
      })
    }
  }
  return [...base, ...custom].map((s, i) => ({ ...s, order: i }))
}
