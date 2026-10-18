import { z } from 'zod'
import type { AIRequest } from '@/lib/ai/types'
import type { LanguageCode } from '../prompt-types'
import { glossaryText, languageInstruction, POLISH_RULES, wrap } from './common'

const score = z.number().int().min(0).max(10)

export const ImproveSchema = z.object({
  scores: z.object({
    clarity: score.describe('Rõ ràng'),
    specificity: score.describe('Cụ thể'),
    context: score.describe('Đầy đủ bối cảnh'),
    consistency: score.describe('Không mâu thuẫn'),
    length: score.describe('Độ dài hợp lý'),
  }),
  issues: z
    .array(z.object({ level: z.enum(['high', 'medium', 'low']), text: z.string() }))
    .describe('Vấn đề cụ thể, mỗi vấn đề kèm cách sửa'),
  proposal: z.string().describe('Bản đề xuất hoàn chỉnh đã sửa các vấn đề trên'),
})
export type ImproveResult = z.infer<typeof ImproveSchema>

export const SCORE_LABELS: Record<keyof ImproveResult['scores'], string> = {
  clarity: 'Rõ ràng',
  specificity: 'Cụ thể',
  context: 'Đầy đủ bối cảnh',
  consistency: 'Không mâu thuẫn',
  length: 'Độ dài hợp lý',
}

export type ImproveKind = 'prompt' | 'agents'

/** ✨ Phân tích (màn hình Cải thiện – improveAnalyze, effort high). */
export function improveRequest(input: {
  kind: ImproveKind
  content: string
  language: LanguageCode
}): AIRequest {
  const what =
    input.kind === 'agents'
      ? `file quy tắc cho AI lập trình (AGENTS.md / CLAUDE.md). Bản đề xuất phải theo khung chuẩn 10 mục
(Tổng quan dự án, Lệnh, Cấu trúc thư mục, Quy ước code, Kiểm thử, Git & Pull Request, Bảo mật & bí mật,
Bẫy thường gặp, Ranh giới, Cách làm việc với tôi), mỗi mục là một tiêu đề "## <số>. <tên mục>", dưới 150 dòng,
lệnh đặt trong dấu \`code\`, Ranh giới có 3 mức ✅ Luôn làm / ⚠️ Hỏi trước / 🚫 Không bao giờ.`
      : `prompt giao việc cho AI lập trình. Bản đề xuất theo khung 8 khối: # Vai trò, # Bối cảnh, # Nhiệm vụ,
# Đầu vào, # Ràng buộc, # Định dạng đầu ra, # Tiêu chí hoàn thành, # Cách làm việc (bỏ khối không có thông tin).`
  return {
    effort: 'high',
    maxTokens: 16000,
    system: `Bạn là chuyên gia viết prompt và file quy tắc cho AI lập trình. Hãy đánh giá ${what}
Chấm 0–10 cho từng tiêu chí: rõ ràng, cụ thể, đầy đủ bối cảnh, không mâu thuẫn, độ dài hợp lý.
Liệt kê vấn đề theo mức high/medium/low, mỗi vấn đề nêu chỗ sai và cách sửa (ví dụ: câu mơ hồ "viết code sạch" → quy tắc kiểm tra được).
${POLISH_RULES}
- Ở bản đề xuất, chỗ còn thiếu thông tin thì ghi "[cần bổ sung: …]" thay vì bịa.
${languageInstruction(input.language)}

Bảng thuật ngữ:
${glossaryText()}`,
    prompt: wrap('noi_dung', input.content),
  }
}
