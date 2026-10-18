import { fieldFocus, TYPE_FOCUS } from './polish-focus'
import { PROMPT_TYPE_CODES } from './types'

describe('trọng tâm trau chuốt', () => {
  it('mọi loại prompt đều có trọng tâm riêng, không trùng nhau', () => {
    const all = PROMPT_TYPE_CODES.map((c) => TYPE_FOCUS[c])
    expect(all.every((f) => f.length > 20)).toBe(true)
    expect(new Set(all).size).toBe(all.length)
  })

  it('ô quen thuộc có trọng tâm riêng, ô khác dùng nhãn và ví dụ', () => {
    expect(fieldFocus('steps')).toContain('đánh số')
    expect(fieldFocus('x', { label: 'Phạm vi' })).toBe(
      'Làm rõ "Phạm vi" cho cụ thể, kiểm tra được.',
    )
  })
})
