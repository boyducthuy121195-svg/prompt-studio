import { phaseLabel } from '@/lib/phases'
import type { Project } from '@/types/models'
import type { PromptForm } from '../build-prompt'
import { TYPE_FOCUS } from '../polish-focus'
import type { PromptTypeDef } from '../types'
import { wrap } from './common'

/** Thông tin dự án gửi kèm cho AI. `currentPhase` không bắt buộc. */
export type AIProjectContext = Pick<Project, 'name' | 'description' | 'profile'> &
  Partial<Pick<Project, 'currentPhase'>>

const PROFILE: [keyof Project['profile'], string][] = [
  ['goal', 'Mục tiêu'],
  ['techStack', 'Tech stack'],
  ['commands', 'Lệnh'],
  ['structure', 'Cấu trúc thư mục'],
  ['conventions', 'Quy ước code'],
  ['donts', 'Điều không được làm'],
  ['notes', 'Ghi chú'],
]

/** Giới hạn độ dài từng giá trị để chỉ dẫn gửi AI không quá dài. */
export function clip(text: string, max = 1500): string {
  const t = text.trim()
  return t.length > max ? `${t.slice(0, max)}… (đã cắt bớt)` : t
}

/** Hồ sơ dự án + giai đoạn hiện tại. Không có dự án thì trả về chuỗi rỗng. */
export function projectBlock(p: AIProjectContext | null): string {
  if (!p) return ''
  const lines = [`Tên: ${p.name}`]
  if (p.description.trim()) lines.push(`Mô tả: ${clip(p.description, 500)}`)
  if (p.currentPhase !== undefined)
    lines.push(`Giai đoạn hiện tại: ${phaseLabel(p.currentPhase)} (theo quy trình 11 giai đoạn)`)
  for (const [k, label] of PROFILE)
    if (p.profile[k].trim()) lines.push(`${label}: ${clip(p.profile[k], 600)}`)
  return wrap('ho_so_du_an', lines.join('\n'))
}

/** Loại prompt: mô tả, vai trò, lưu ý riêng và trọng tâm cố định. */
export function promptTypeBlock(type: PromptTypeDef): string {
  const lines = [`Loại: ${type.name} – ${type.desc}`, `Vai trò AI: ${type.role}`]
  if (type.tip) lines.push(`Lưu ý riêng: ${type.tip}`)
  lines.push(`Trọng tâm: ${TYPE_FOCUS[type.code]}`)
  return wrap('loai_prompt', lines.join('\n'))
}

function value(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v.filter(Boolean).join(', ') : (v ?? '').trim()
}

/** Nội dung các ô người dùng đã điền (trừ ô đang trau chuốt). */
export function formBlock(form: PromptForm, type: PromptTypeDef, exceptKey?: string): string {
  const lines: string[] = []
  const add = (key: string, label: string, v: string) => {
    if (key !== exceptKey && v) lines.push(`- ${label}: ${clip(v, 800)}`)
  }
  add('task', 'Nhiệm vụ', form.task.trim())
  add('purpose', 'Mục đích', form.purpose.trim())
  for (const f of type.fields) add(f.key, f.label, value(form.fields[f.key]))
  add('attachments', 'Đầu vào đính kèm', form.attachments.join(', '))
  add('pasted', 'Nội dung dán vào', form.pasted.content.trim())
  add('examples', 'Ví dụ mẫu', form.examples.trim())
  return lines.length ? wrap('cac_o_khac', lines.join('\n')) : ''
}

/** Ghép các khối ngữ cảnh, bỏ khối rỗng. */
export function joinBlocks(...blocks: string[]): string {
  return blocks.filter(Boolean).join('\n\n')
}
