import type { Project } from '@/types/models'
import { getPromptType, LANGUAGES, type LanguageCode } from './prompt-types'
import { SUGGESTIONS } from './suggestions'
import type { PromptTypeCode, SuggestionGroup } from './types'

/** Dữ liệu dán vào được bọc trong thẻ để AI không nhầm dữ liệu với chỉ dẫn (docs/04 – khối DV). */
export type PastedKind = 'log' | 'code' | 'tai_lieu'

export interface PromptForm {
  typeCode: PromptTypeCode
  role: string
  language: LanguageCode
  task: string
  purpose: string
  /** Trường riêng của loại prompt: chuỗi hoặc danh sách (multiselect) */
  fields: Record<string, string | string[]>
  attachments: string[]
  pasted: { kind: PastedKind; label: string; content: string }
  examples: string
  length: string
  /** Mã gợi ý đang tích (RB-01, CL-02…) */
  selected: string[]
}

export type ProjectContext = Pick<Project, 'name' | 'description' | 'profile'>

const PROFILE_LINES: [keyof Project['profile'], string][] = [
  ['goal', 'Mục tiêu'],
  ['techStack', 'Tech stack'],
  ['commands', 'Lệnh'],
  ['structure', 'Cấu trúc thư mục'],
  ['conventions', 'Quy ước code'],
  ['donts', 'Điều không được làm'],
  ['notes', 'Ghi chú'],
]

const oneLine = (s: string) => s.trim().replace(/\s*\n\s*/g, '; ')

function fieldValue(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v.filter(Boolean).join(', ')
  return (v ?? '').trim()
}

function picked(group: SuggestionGroup, selected: ReadonlySet<string>, prefix: string): string[] {
  return SUGGESTIONS[group].filter((s) => selected.has(s.code)).map((s) => prefix + s.text)
}

/**
 * Ghép prompt hoàn chỉnh theo khung 8 khối (docs/02 mục 4). Chạy trên máy, không cần AI.
 * Chỉ in các khối đã có nội dung.
 */
export function buildPrompt(form: PromptForm, project: ProjectContext | null): string {
  const type = getPromptType(form.typeCode)
  const selected = new Set(form.selected)
  const blocks: [string, string[]][] = []

  blocks.push(['Vai trò', [`Bạn là ${form.role.trim() || type.role}.`]])

  const ctx: string[] = []
  if (project) {
    ctx.push(
      `- Dự án: ${project.name}${project.description.trim() ? ` – ${oneLine(project.description)}` : ''}`,
    )
    for (const [key, label] of PROFILE_LINES) {
      const v = project.profile[key].trim()
      if (v) ctx.push(`- ${label}: ${oneLine(v)}`)
    }
  }
  ctx.push('- Quy tắc dự án: tuân thủ @AGENTS.md')
  blocks.push(['Bối cảnh', ctx])

  const task = [`${type.name}: ${form.task.trim() || '[mô tả nhiệm vụ]'}`]
  for (const f of type.fields) {
    const v = fieldValue(form.fields[f.key])
    if (!v) continue
    task.push(
      f.kind === 'textarea' && v.includes('\n') ? `- ${f.label}:\n${v}` : `- ${f.label}: ${v}`,
    )
  }
  blocks.push(['Nhiệm vụ', task])

  if (form.purpose.trim()) blocks.push(['Mục đích', [form.purpose.trim()]])

  const inputs = form.attachments.map((a) => `- ${a}`)
  const pasted = form.pasted.content.trim()
  if (pasted) {
    const label = form.pasted.label.trim()
    const attr = label ? (form.pasted.kind === 'code' ? ` file="${label}"` : ` ten="${label}"`) : ''
    inputs.push(`<${form.pasted.kind}${attr}>\n${pasted}\n</${form.pasted.kind}>`)
  }
  if (inputs.length) blocks.push(['Đầu vào', inputs])

  if (form.examples.trim())
    blocks.push(['Ví dụ mẫu', [`<vi_du>\n${form.examples.trim()}\n</vi_du>`]])

  const rb = picked('rb', selected, '- ')
  if (rb.length) blocks.push(['Ràng buộc', rb])

  const cl = picked('cl', selected, '- ')
  if (type.tip) cl.push(`- ${type.tip}`)
  if (cl.length) blocks.push(['Cách làm việc', cl])

  const dr = picked('dr', selected, '- ')
  if (form.length) dr.push(`- Độ dài trả lời: ${form.length.toLowerCase()}.`)
  if (dr.length) blocks.push(['Định dạng đầu ra', dr])

  const tc = picked('tc', selected, '- [ ] ')
  if (tc.length) blocks.push(['Tiêu chí hoàn thành', tc])

  const lang = LANGUAGES.find((l) => l.value === form.language) ?? LANGUAGES[0]
  blocks.push(['Ngôn ngữ', [lang.instruction]])

  return blocks.map(([title, lines]) => `# ${title}\n${lines.join('\n')}`).join('\n\n')
}

/** Ước tính số token (khoảng 3,5 ký tự / token với tiếng Việt có dấu). */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5)
}

export function emptyForm(typeCode: PromptTypeCode, language: LanguageCode): PromptForm {
  const type = getPromptType(typeCode)
  const d = type.defaults
  return {
    typeCode,
    role: type.role,
    language,
    task: '',
    purpose: '',
    fields: {},
    attachments: [],
    pasted: { kind: 'log', label: '', content: '' },
    examples: '',
    length: '',
    selected: [...d.rb, ...d.cl, ...d.dr, ...d.tc],
  }
}
