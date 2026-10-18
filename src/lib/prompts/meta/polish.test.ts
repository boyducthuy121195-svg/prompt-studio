import { EMPTY_PROFILE } from '@/lib/db/projects'
import { emptyForm } from '../build-prompt'
import { getPromptType } from '../prompt-types'
import {
  appendAnswers,
  appendLines,
  insertAdditions,
  PolishFieldSchema,
  polishFieldRequest,
  PolishPromptSchema,
  polishPromptRequest,
} from './polish'

const type = getPromptType('SUA_LOI')
const project = {
  name: 'Web bán hàng',
  description: 'Bán đồ gia dụng',
  currentPhase: 7,
  profile: { ...EMPTY_PROFILE, techStack: 'React + Vite' },
}
const form = {
  ...emptyForm('SUA_LOI', 'vi-en'),
  task: 'màn hình trắng',
  fields: { steps: 'Mở giỏ hàng → bấm Thanh toán', env: ['Chrome'] },
}

describe('chỉ dẫn trau chuốt theo ngữ cảnh', () => {
  it('trau chuốt một ô: effort low, trọng tâm riêng của ô, có hồ sơ dự án, loại prompt và các ô khác', () => {
    const r = polishFieldRequest({
      field: { key: 'task', label: 'Nhiệm vụ' },
      text: 'màn hình trắng',
      type,
      form,
      project,
      language: 'vi-en',
    })
    expect(r.effort).toBe('low')
    expect(r.system).toContain('loại "Sửa lỗi", ô "Nhiệm vụ"')
    expect(r.system).toContain('Trọng tâm của ô này: Một câu nêu đúng một việc chính')
    expect(r.system).toContain('"màn hình trắng" → blank screen / runtime error')
    expect(r.system).toContain('KHÔNG thêm yêu cầu')
    expect(r.prompt).toContain('Tech stack: React + Vite')
    expect(r.prompt).toContain('Giai đoạn hiện tại: 7 · Xây tính năng')
    expect(r.prompt).toContain('Trọng tâm: Có các bước tái hiện cụ thể')
    expect(r.prompt).toContain('- Thao tác gây lỗi: Mở giỏ hàng → bấm Thanh toán')
    expect(r.prompt).toContain('- Môi trường: Chrome')
    // Ô đang trau chuốt không lặp lại trong <cac_o_khac>
    expect(r.prompt).not.toContain('- Nhiệm vụ: màn hình trắng')
    expect(r.prompt).toContain('<noi_dung>\nmàn hình trắng\n</noi_dung>')
  })

  it('ô không có trọng tâm riêng dùng nhãn và ví dụ của ô; không có dự án thì bỏ hồ sơ', () => {
    const r = polishFieldRequest({
      field: { key: 'other', label: 'Ghi chú', placeholder: 'chỉ lỗi trên điện thoại' },
      text: 'x',
      type,
      form: emptyForm('SUA_LOI', 'vi-en'),
      project: null,
      language: 'en',
    })
    expect(r.system).toContain('Làm rõ "Ghi chú", cụ thể như ví dụ: chỉ lỗi trên điện thoại.')
    expect(r.prompt).not.toContain('<ho_so_du_an>')
    expect(r.prompt).not.toContain('<cac_o_khac>')
    expect(PolishFieldSchema.safeParse({ rewritten: 'a', suggestions: [] }).success).toBe(true)
  })

  it('trau chuốt toàn bộ: effort medium, gợi ý cố định chưa tích được gửi để AI chọn, schema có additions', () => {
    const r = polishPromptRequest({
      prompt: '# Vai trò\nBạn là dev',
      type,
      form,
      project,
      language: 'en',
    })
    expect(r.effort).toBe('medium')
    expect(r.system).toContain('Respond in English.')
    expect(r.prompt).toContain('<goi_y_co_san_chua_chon>')
    // RB-01 đã tích sẵn cho Sửa lỗi nên không nằm trong danh sách chưa chọn
    expect(r.prompt).not.toContain('Chỉ thay đổi những gì được yêu cầu')
    expect(r.prompt).toContain('[Ràng buộc] Không thêm dependency mới')
    expect(
      PolishPromptSchema.safeParse({
        improved: 'x',
        changes: [],
        questions: ['?'],
        additions: [{ block: 'Ràng buộc', text: 'a', reason: 'b' }],
      }).success,
    ).toBe(true)
    expect(
      PolishPromptSchema.safeParse({
        improved: 'x',
        changes: [],
        questions: [],
        additions: [{ block: 'Khối lạ', text: 'a', reason: 'b' }],
      }).success,
    ).toBe(false)
  })

  it('chèn gợi ý vào đúng khối; khối chưa có thì tạo trước # Ngôn ngữ', () => {
    const p = '# Nhiệm vụ\nSửa lỗi\n\n# Ràng buộc\n- A\n\n# Ngôn ngữ\nVi'
    expect(
      insertAdditions(p, [
        { block: 'Ràng buộc', text: 'B', reason: '' },
        { block: 'Tiêu chí hoàn thành', text: 'Test pass', reason: '' },
      ]),
    ).toBe(
      '# Nhiệm vụ\nSửa lỗi\n\n# Ràng buộc\n- A\n- B\n\n# Tiêu chí hoàn thành\n- [ ] Test pass\n\n# Ngôn ngữ\nVi',
    )
    expect(insertAdditions('# Nhiệm vụ\nX', [{ block: 'Ràng buộc', text: 'B', reason: '' }])).toBe(
      '# Nhiệm vụ\nX\n\n# Ràng buộc\n- B',
    )
  })

  it('thêm gợi ý đã chọn vào cuối ô, mỗi ý một dòng', () => {
    expect(appendLines('Mở app', ['Bấm Lưu', ' '])).toBe('Mở app\n- Bấm Lưu')
    expect(appendLines('', ['A'])).toBe('- A')
    expect(appendLines('X', [])).toBe('X')
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
