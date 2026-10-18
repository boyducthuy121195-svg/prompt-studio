import { EMPTY_PROFILE } from '@/lib/db/projects'
import { emptyForm } from '../build-prompt'
import { getPromptType } from '../prompt-types'
import { clip, formBlock, joinBlocks, projectBlock, promptTypeBlock } from './context'

describe('khối ngữ cảnh gửi AI', () => {
  it('hồ sơ dự án chỉ in trường có nội dung, kèm giai đoạn nếu có', () => {
    const b = projectBlock({
      name: 'A',
      description: '',
      currentPhase: 2,
      profile: { ...EMPTY_PROFILE, commands: 'npm test' },
    })
    expect(b).toBe(
      '<ho_so_du_an>\nTên: A\nGiai đoạn hiện tại: 2 · PRD (theo quy trình 11 giai đoạn)\nLệnh: npm test\n</ho_so_du_an>',
    )
    expect(projectBlock(null)).toBe('')
    expect(projectBlock({ name: 'B', description: '', profile: EMPTY_PROFILE })).not.toContain(
      'Giai đoạn',
    )
  })

  it('loại prompt có lưu ý riêng và trọng tâm', () => {
    const b = promptTypeBlock(getPromptType('THIET_KE_UI'))
    expect(b).toContain('Loại: Thiết kế giao diện')
    expect(b).toContain('Lưu ý riêng: Tạo bố cục có chủ đích')
    expect(b).toContain('Trọng tâm: Liệt kê đủ màn hình')
  })

  it('các ô đã điền, bỏ ô rỗng và ô đang trau chuốt; cắt bớt nội dung quá dài', () => {
    const form = {
      ...emptyForm('SUA_LOI', 'vi-en'),
      task: 'lỗi',
      purpose: 'khách mua được',
      fields: { evidence: ['Ảnh chụp', 'Log console'] },
    }
    const b = formBlock(form, getPromptType('SUA_LOI'), 'purpose')
    expect(b).toBe(
      '<cac_o_khac>\n- Nhiệm vụ: lỗi\n- Bằng chứng: Ảnh chụp, Log console\n</cac_o_khac>',
    )
    expect(formBlock(emptyForm('TU_DO', 'vi'), getPromptType('TU_DO'))).toBe('')
    expect(clip('abcdef', 3)).toBe('abc… (đã cắt bớt)')
    expect(joinBlocks('a', '', 'b')).toBe('a\n\nb')
  })
})
