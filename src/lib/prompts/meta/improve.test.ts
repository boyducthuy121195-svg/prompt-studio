import { ImproveSchema, improveRequest } from './improve'

describe('chỉ dẫn AI cho Cải thiện', () => {
  it('prompt: effort high, khung 8 khối, nội dung nằm trong thẻ', () => {
    const r = improveRequest({ kind: 'prompt', content: 'Sửa lỗi giúp tôi', language: 'vi-en' })
    expect(r.effort).toBe('high')
    expect(r.system).toContain('khung 8 khối')
    expect(r.system).toContain('[cần bổ sung: …]')
    expect(r.prompt).toContain('<noi_dung>\nSửa lỗi giúp tôi')
  })

  it('AGENTS.md: yêu cầu khung 10 mục và Ranh giới 3 mức', () => {
    const r = improveRequest({ kind: 'agents', content: '# Rules', language: 'en' })
    expect(r.system).toContain('khung chuẩn 10 mục')
    expect(r.system).toContain('✅ Luôn làm / ⚠️ Hỏi trước / 🚫 Không bao giờ')
  })

  it('schema từ chối điểm ngoài 0–10', () => {
    const base = {
      scores: { clarity: 5, specificity: 5, context: 5, consistency: 5, length: 5 },
      issues: [],
      proposal: 'x',
    }
    expect(ImproveSchema.safeParse(base).success).toBe(true)
    expect(
      ImproveSchema.safeParse({ ...base, scores: { ...base.scores, clarity: 11 } }).success,
    ).toBe(false)
  })
})
