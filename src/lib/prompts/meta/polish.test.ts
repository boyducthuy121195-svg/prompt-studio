import {
  appendAnswers,
  PolishPromptSchema,
  polishFieldRequest,
  polishPromptRequest,
} from './polish'

describe('chỉ dẫn trau chuốt', () => {
  it('trau chuốt một ô: effort low, có bảng thuật ngữ, quy tắc không thêm yêu cầu, dữ liệu bọc trong thẻ', () => {
    const r = polishFieldRequest({
      fieldLabel: 'Nhiệm vụ',
      text: 'màn hình trắng',
      promptTypeName: 'Sửa lỗi',
      language: 'vi-en',
    })
    expect(r.effort).toBe('low')
    expect(r.system).toContain('ô "Nhiệm vụ"')
    expect(r.system).toContain('"màn hình trắng" → blank screen / runtime error')
    expect(r.system).toContain('KHÔNG thêm yêu cầu')
    expect(r.system).toContain('giữ nguyên thuật ngữ kỹ thuật tiếng Anh')
    expect(r.prompt).toBe('<noi_dung>\nmàn hình trắng\n</noi_dung>')
  })

  it('trau chuốt toàn bộ: effort medium, schema có improved/changes/questions', () => {
    const r = polishPromptRequest({ prompt: '# Vai trò\nBạn là dev', language: 'en' })
    expect(r.effort).toBe('medium')
    expect(r.system).toContain('Respond in English.')
    expect(
      PolishPromptSchema.safeParse({ improved: 'x', changes: [], questions: ['?'] }).success,
    ).toBe(true)
    expect(PolishPromptSchema.safeParse({ improved: 1 }).success).toBe(false)
  })

  it('gắn câu trả lời vào cuối prompt, bỏ câu chưa trả lời', () => {
    expect(
      appendAnswers('A', [
        { question: 'Trình duyệt?', answer: 'Chrome' },
        { question: 'Log?', answer: ' ' },
      ]),
    ).toBe('A\n\n# Thông tin bổ sung\n- Trình duyệt? → Chrome')
    expect(appendAnswers('A', [])).toBe('A')
  })
})
