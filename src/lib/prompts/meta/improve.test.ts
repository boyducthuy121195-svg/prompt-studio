import { EMPTY_PROFILE } from '@/lib/db/projects'
import {
  ImproveRewriteSchema,
  improveRewriteRequest,
  ImproveSchema,
  improveRequest,
} from './improve'

const project = {
  name: 'Web bán hàng',
  description: '',
  currentPhase: 7,
  profile: { ...EMPTY_PROFILE, techStack: 'Next.js' },
}

describe('chỉ dẫn AI cho Cải thiện', () => {
  it('phân tích prompt: effort high, tiêu chí riêng cho prompt, có hồ sơ dự án, chưa viết lại', () => {
    const r = improveRequest({
      kind: 'prompt',
      content: 'Sửa lỗi giúp tôi',
      project,
      language: 'vi-en',
    })
    expect(r.effort).toBe('high')
    expect(r.system).toContain('Nhiệm vụ có nêu đúng một việc chính')
    expect(r.system).not.toContain('Ranh giới có đủ 3 mức')
    expect(r.prompt).toContain('Tech stack: Next.js')
    expect(r.prompt).toContain('Giai đoạn hiện tại: 7 · Xây tính năng')
    expect(r.prompt).toContain('<noi_dung>\nSửa lỗi giúp tôi')
  })

  it('phân tích AGENTS.md dùng tiêu chí khác prompt; không có dự án thì không có hồ sơ', () => {
    const r = improveRequest({ kind: 'agents', content: '# Rules', project: null, language: 'en' })
    expect(r.system).toContain('Ranh giới có đủ 3 mức')
    expect(r.prompt).not.toContain('<ho_so_du_an>')
  })

  it('viết lại: chỉ sửa các vấn đề đã chọn, theo khung đúng loại', () => {
    const r = improveRewriteRequest({
      kind: 'agents',
      content: 'viết code sạch',
      issues: [{ level: 'high', text: 'Câu mơ hồ', fix: 'Đổi thành quy tắc kiểm tra được' }],
      project: null,
      language: 'vi-en',
    })
    expect(r.system).toContain('CHỈ sửa các vấn đề trong <van_de_can_sua>')
    expect(r.system).toContain('khung chuẩn 10 mục')
    expect(r.prompt).toContain(
      '<van_de_can_sua>\n1. Câu mơ hồ → Đổi thành quy tắc kiểm tra được\n</van_de_can_sua>',
    )
    expect(ImproveRewriteSchema.safeParse({ proposal: 'x', changes: [] }).success).toBe(true)
  })

  it('schema: mỗi vấn đề có cách sửa, điểm trong 0–10', () => {
    const base = {
      scores: { clarity: 5, specificity: 5, context: 5, consistency: 5, length: 5 },
      issues: [{ level: 'low', text: 'a', fix: 'b' }],
    }
    expect(ImproveSchema.safeParse(base).success).toBe(true)
    expect(
      ImproveSchema.safeParse({ ...base, issues: [{ level: 'low', text: 'a' }] }).success,
    ).toBe(false)
    expect(
      ImproveSchema.safeParse({ ...base, scores: { ...base.scores, clarity: 11 } }).success,
    ).toBe(false)
  })
})
