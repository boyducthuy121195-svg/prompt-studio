import type { AgentsSection } from '@/types/models'
import { AGENTS_LENGTH, AGENTS_SECTIONS, VAGUE_PHRASES } from '@/lib/prompts/agents-skeleton'
import { renderAgentsMd, sortSections } from './doc'

export interface AgentsCheck {
  level: 'ok' | 'warn' | 'error'
  text: string
  sectionKey?: string
}

/** Chuỗi trông giống secret: key Anthropic, Google, GitHub, OpenAI, AWS hoặc chuỗi hex dài. */
const SECRET_PATTERNS = [
  /sk-ant-[A-Za-z0-9_-]{16,}/,
  /AIza[0-9A-Za-z_-]{30,}/,
  /gh[pousr]_[A-Za-z0-9]{30,}/,
  /sk-[A-Za-z0-9]{32,}/,
  /AKIA[0-9A-Z]{16}/,
  /\b[a-f0-9]{40,}\b/i,
]

/**
 * Kiểm tra AGENTS.md ngay trên máy, không tốn tiền AI (docs/03 mục 4):
 * mục bắt buộc, lệnh trong khối code, độ dài, câu mơ hồ, chỗ trống chưa điền, chuỗi giống secret.
 */
export function localChecks(
  projectName: string,
  sections: readonly AgentsSection[],
): AgentsCheck[] {
  const out: AgentsCheck[] = []
  const list = sortSections(sections)
  const enabled = list.filter((s) => s.enabled)
  const byKey = new Map(list.map((s) => [s.key, s]))

  const required = AGENTS_SECTIONS.filter((d) => d.required)
  const missing = required.filter((d) => {
    const s = byKey.get(d.key)
    return !s || !s.enabled || !s.content.trim()
  })
  out.push(
    missing.length
      ? {
          level: 'error',
          text: `Thiếu nội dung ở mục bắt buộc: ${missing.map((m) => m.title).join(', ')}.`,
          sectionKey: missing[0].key,
        }
      : { level: 'ok', text: `Có đủ ${required.length} mục bắt buộc.` },
  )

  const commands = byKey.get('commands')
  if (commands?.enabled && commands.content.trim()) {
    out.push(
      /`[^`]+`/.test(commands.content)
        ? { level: 'ok', text: 'Các lệnh nằm trong khối code.' }
        : {
            level: 'warn',
            text: 'Mục Lệnh chưa có lệnh nào trong dấu `code`. AI cần lệnh copy là chạy được.',
            sectionKey: 'commands',
          },
    )
  }

  const lines = renderAgentsMd(projectName, sections).split('\n').length
  out.push(
    lines > AGENTS_LENGTH.warn
      ? {
          level: 'error',
          text: `Dài ${lines} dòng – quá ${AGENTS_LENGTH.warn} dòng. File dài làm AI làm việc kém hơn.`,
        }
      : lines > AGENTS_LENGTH.target
        ? {
            level: 'warn',
            text: `Dài ${lines} dòng (mục tiêu dưới ${AGENTS_LENGTH.target}). Nên rút gọn.`,
          }
        : { level: 'ok', text: `Độ dài ${lines} dòng (mục tiêu dưới ${AGENTS_LENGTH.target}).` },
  )

  for (const s of enabled) {
    const lower = s.content.toLowerCase()
    const vague = VAGUE_PHRASES.filter((p) => lower.includes(p))
    if (vague.length) {
      out.push({
        level: 'warn',
        text: `Mục "${s.title}": "${vague.join('", "')}" là cách nói mơ hồ. Nên đổi thành quy tắc kiểm tra được.`,
        sectionKey: s.key,
      })
    }
    if (/\{\{[^}]*\}\}/.test(s.content)) {
      out.push({
        level: 'warn',
        text: `Mục "${s.title}" còn chỗ trống {{…}} chưa điền.`,
        sectionKey: s.key,
      })
    }
    if (!s.content.trim() && !s.custom) {
      out.push({
        level: 'warn',
        text: `Mục "${s.title}" đang trống. Điền hoặc tắt mục này.`,
        sectionKey: s.key,
      })
    }
  }

  const leaked = enabled.find((s) => SECRET_PATTERNS.some((re) => re.test(s.content)))
  out.push(
    leaked
      ? {
          level: 'error',
          text: `Mục "${leaked.title}" có chuỗi giống API key/secret. Xóa ngay, không đưa lên GitHub.`,
          sectionKey: leaked.key,
        }
      : { level: 'ok', text: 'Không phát hiện chuỗi giống API key.' },
  )
  return out
}
