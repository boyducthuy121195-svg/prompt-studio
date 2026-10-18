import { EMPTY_PROFILE } from '@/lib/db/projects'
import { buildPrompt, emptyForm, estimateTokens, type ProjectContext } from './build-prompt'

const project: ProjectContext = {
  name: 'Prompt Studio',
  description: 'App tạo prompt',
  profile: {
    ...EMPTY_PROFILE,
    techStack: 'React 19 + Vite',
    donts: 'Không commit API key\nKhông tắt test',
  },
}

describe('buildPrompt', () => {
  it('ghép đủ các khối theo thứ tự của khung 8 khối', () => {
    const form = { ...emptyForm('SUA_LOI', 'vi-en'), task: 'Màn hình trắng khi bấm Lưu' }
    const out = buildPrompt(form, project)
    const headings = out.match(/^# .+$/gm)
    expect(headings).toEqual([
      '# Vai trò',
      '# Bối cảnh',
      '# Nhiệm vụ',
      '# Ràng buộc',
      '# Cách làm việc',
      '# Định dạng đầu ra',
      '# Tiêu chí hoàn thành',
      '# Ngôn ngữ',
    ])
    expect(out).toContain('Bạn là Senior Full-stack Developer.')
    expect(out).toContain('- Dự án: Prompt Studio – App tạo prompt')
    expect(out).toContain('- Tech stack: React 19 + Vite')
    expect(out).toContain('- Điều không được làm: Không commit API key; Không tắt test')
    expect(out).toContain('Sửa lỗi: Màn hình trắng khi bấm Lưu')
    expect(out).toContain('- [ ] Code mới hoặc sửa đổi có test đi kèm.')
    // mẹo riêng của loại Sửa lỗi
    expect(out).toMatch(/# Cách làm việc[\s\S]*root cause/)
    expect(out).toContain('Trả lời bằng tiếng Việt, giữ nguyên thuật ngữ kỹ thuật tiếng Anh.')
  })

  it('không có dự án thì vẫn nhắc tuân thủ AGENTS.md, nhiệm vụ trống có chỗ giữ', () => {
    const out = buildPrompt(emptyForm('TU_DO', 'en'), null)
    expect(out).toContain('# Bối cảnh\n- Quy tắc dự án: tuân thủ @AGENTS.md')
    expect(out).toContain('Prompt tự do: [mô tả nhiệm vụ]')
    expect(out).toContain('Respond in English.')
  })

  it('in trường riêng, mục đích, đầu vào đính kèm và bọc dữ liệu dán vào trong thẻ', () => {
    const form = {
      ...emptyForm('SUA_LOI', 'vi'),
      fields: { steps: 'Mở dự án → bấm Lưu', env: ['Chrome', 'Máy tính'], frequency: '' },
      purpose: 'Để không mất dữ liệu',
      attachments: ['@PLAN.md'],
      pasted: { kind: 'log' as const, label: 'console', content: 'TypeError: x is undefined' },
      examples: 'Ví dụ A',
      length: 'Ngắn gọn',
      selected: [],
    }
    const out = buildPrompt(form, null)
    expect(out).toContain('- Thao tác gây lỗi: Mở dự án → bấm Lưu')
    expect(out).toContain('- Môi trường: Chrome, Máy tính')
    expect(out).not.toContain('Tần suất')
    expect(out).toContain('# Mục đích\nĐể không mất dữ liệu')
    expect(out).toContain(
      '# Đầu vào\n- @PLAN.md\n<log ten="console">\nTypeError: x is undefined\n</log>',
    )
    expect(out).toContain('<vi_du>\nVí dụ A\n</vi_du>')
    expect(out).toContain('- Độ dài trả lời: ngắn gọn.')
    expect(out).not.toContain('# Ràng buộc')
  })

  it('ước tính token', () => {
    expect(estimateTokens('')).toBe(0)
    expect(estimateTokens('a'.repeat(35))).toBe(10)
  })
})
