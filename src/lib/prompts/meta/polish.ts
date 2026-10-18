import { z } from 'zod'
import type { AIRequest } from '@/lib/ai/types'
import type { LanguageCode } from '../prompt-types'
import { glossaryText, languageInstruction, POLISH_RULES, wrap } from './common'

/** ✨ cạnh một ô: viết lại nội dung ô (ARCHITECTURE.md 6.2 – polishField, effort low). */
export function polishFieldRequest(input: {
  fieldLabel: string
  text: string
  promptTypeName: string
  language: LanguageCode
}): AIRequest {
  return {
    effort: 'low',
    maxTokens: 4000,
    system: `Bạn là biên tập viên kỹ thuật, giúp người không biết lập trình viết yêu cầu cho AI lập trình.
Nhiệm vụ: viết lại nội dung của MỘT ô trong bảng nhập prompt loại "${input.promptTypeName}", ô "${input.fieldLabel}".
${POLISH_RULES}
- Chỉ trả về đúng nội dung đã viết lại, không lời chào, không giải thích, không tiêu đề, không bọc trong khối code.
- Giữ độ dài tương đương hoặc ngắn hơn.
${languageInstruction(input.language)}

Bảng thuật ngữ (cách nói đời thường → thuật ngữ chuẩn):
${glossaryText()}`,
    prompt: wrap('noi_dung', input.text),
  }
}

export const PolishPromptSchema = z.object({
  improved: z
    .string()
    .describe('Toàn bộ prompt sau khi trau chuốt, giữ cấu trúc các khối # tiêu đề'),
  changes: z.array(z.string()).describe('Danh sách ngắn các thay đổi chính, mỗi mục một câu'),
  questions: z.array(z.string()).describe('Tối đa 3 câu hỏi về thông tin còn thiếu; rỗng nếu đủ'),
})
export type PolishPromptResult = z.infer<typeof PolishPromptSchema>

/** ✨ Trau chuốt toàn bộ (ARCHITECTURE.md 6.2 – polishPrompt, effort medium). */
export function polishPromptRequest(input: { prompt: string; language: LanguageCode }): AIRequest {
  return {
    effort: 'medium',
    maxTokens: 12000,
    system: `Bạn là chuyên gia viết prompt cho AI lập trình (Claude Code, Gemini CLI, Codex, Cursor).
Nhiệm vụ: rà soát và trau chuốt prompt trong thẻ <noi_dung>.
${POLISH_RULES}
- Kiểm tra: chỗ mơ hồ, mâu thuẫn, thiếu bối cảnh, thuật ngữ chưa chuẩn, thứ tự khối chưa hợp lý.
- Giữ cấu trúc khối "# Vai trò / # Bối cảnh / # Nhiệm vụ / ..." và giữ nguyên mọi tham chiếu dạng @TEN_FILE.md.
- "changes": liệt kê ngắn gọn những gì bạn đã sửa. "questions": tối đa 3 câu hỏi cho người viết về thông tin còn thiếu.
${languageInstruction(input.language)}

Bảng thuật ngữ (cách nói đời thường → thuật ngữ chuẩn):
${glossaryText()}`,
    prompt: wrap('noi_dung', input.prompt),
  }
}

/** Gắn câu trả lời của người dùng cho câu hỏi của AI vào cuối prompt. */
export function appendAnswers(prompt: string, qa: { question: string; answer: string }[]): string {
  const answered = qa.filter((x) => x.answer.trim())
  if (!answered.length) return prompt
  return `${prompt.trimEnd()}\n\n# Thông tin bổ sung\n${answered.map((x) => `- ${x.question} → ${x.answer.trim()}`).join('\n')}`
}
