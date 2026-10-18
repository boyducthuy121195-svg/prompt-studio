import { ImproveSchema, improveRequest } from '@/lib/prompts/meta/improve'
import { parseAgentsMd } from './parse'

describe('tách file AGENTS.md có sẵn', () => {
  it('nhận diện mục chuẩn từ tiêu đề tiếng Việt / tiếng Anh, có hoặc không có số thứ tự', () => {
    const md = `# AGENTS.md – Web

## 1. Tổng quan dự án
App bán hàng.

## Commands
- \`npm run dev\`

## Testing instructions
Vitest.

## Quy tắc đặt tên file
kebab-case
`
    const s = parseAgentsMd(md)
    const get = (k: string) => s.find((x) => x.key === k)!
    expect(get('overview')).toMatchObject({ content: 'App bán hàng.', enabled: true })
    expect(get('commands').content).toBe('- `npm run dev`')
    expect(get('testing').content).toBe('Vitest.')
    expect(get('boundaries')).toMatchObject({ enabled: true, content: '' }) // bắt buộc: bật nhưng trống
    expect(get('gotchas').enabled).toBe(false)
    const custom = s.filter((x) => x.custom)
    expect(custom).toEqual([
      expect.objectContaining({ title: 'Quy tắc đặt tên file', content: 'kebab-case' }),
    ])
    expect(s.map((x) => x.order)).toEqual(s.map((_, i) => i))
  })
})

describe('chỉ dẫn Cải thiện', () => {
  it('effort high; AGENTS.md theo khung 10 mục, prompt theo khung 8 khối', () => {
    const a = improveRequest({ kind: 'agents', content: 'x', language: 'vi-en' })
    expect(a.effort).toBe('high')
    expect(a.system).toContain('khung chuẩn 10 mục')
    expect(improveRequest({ kind: 'prompt', content: 'x', language: 'vi-en' }).system).toContain(
      'khung 8 khối',
    )
  })

  it('schema điểm 0–10', () => {
    const ok = {
      scores: { clarity: 5, specificity: 3, context: 2, consistency: 9, length: 8 },
      issues: [],
      proposal: 'x',
    }
    expect(ImproveSchema.safeParse(ok).success).toBe(true)
    expect(ImproveSchema.safeParse({ ...ok, scores: { ...ok.scores, clarity: 11 } }).success).toBe(
      false,
    )
  })
})
