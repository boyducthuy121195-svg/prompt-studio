import { EMPTY_PROFILE } from '@/lib/db/projects'
import {
  agentsCheckRequest,
  AgentsClassifySchema,
  agentsClassifyRequest,
  agentsGenerateRequest,
  agentsRewriteRequest,
  AgentsRewriteSchema,
  AgentsSectionsSchema,
} from './agents'

const project = {
  name: 'Prompt Studio',
  description: 'App',
  profile: { ...EMPTY_PROFILE, commands: 'npm run dev' },
}

describe('chỉ dẫn AI cho AGENTS.md', () => {
  it('tạo từ Hỏi đáp: effort high, có khung 10 mục, hồ sơ dự án và câu trả lời trong thẻ', () => {
    const r = agentsGenerateRequest({
      project,
      language: 'vi-en',
      answers: [
        { key: 'commands', question: 'Lệnh?', options: ['npm'], free: '' },
        { key: 'gotchas', question: 'Bẫy?', options: [], free: '' },
      ],
    })
    expect(r.effort).toBe('high')
    expect(r.system).toContain('key "boundaries" – Ranh giới (bắt buộc)')
    expect(r.system).toContain('✅ Luôn làm / ⚠️ Hỏi trước / 🚫 Không bao giờ')
    expect(r.prompt).toContain('<ho_so_du_an>\nTên: Prompt Studio')
    expect(r.prompt).toContain('Lệnh: npm run dev')
    expect(r.prompt).toContain('[commands] Lệnh?\n- Chọn: npm')
    expect(r.prompt).not.toContain('[gotchas]')
  })

  it('schema chỉ nhận key của khung chuẩn', () => {
    expect(
      AgentsSectionsSchema.safeParse({ sections: [{ key: 'commands', content: 'x' }] }).success,
    ).toBe(true)
    expect(
      AgentsSectionsSchema.safeParse({ sections: [{ key: 'la', content: 'x' }] }).success,
    ).toBe(false)
    expect(AgentsClassifySchema.safeParse({ sections: [], missing: ['overview'] }).success).toBe(
      true,
    )
  })

  it('phân loại, viết lại, kiểm tra: đúng effort và bọc dữ liệu trong thẻ', () => {
    expect(agentsClassifyRequest({ raw: 'dùng npm', language: 'vi' }).effort).toBe('medium')
    const rw = agentsRewriteRequest({
      sectionKey: 'commands',
      sectionTitle: 'Lệnh',
      content: 'npm',
      mode: 'shorter',
      project: null,
      others: [],
      language: 'vi',
    })
    expect(rw.effort).toBe('low')
    expect(rw.system).toContain('Rút gọn tối đa')
    expect(rw.system).toContain('Mục này dùng để: Lệnh phải copy là chạy được')
    expect(rw.prompt).toBe('<noi_dung>\nnpm\n</noi_dung>')
    expect(agentsCheckRequest({ md: '# A', language: 'en' }).system).toContain(
      'Respond in English.',
    )
  })

  it('viết lại một mục theo ngữ cảnh: có giai đoạn dự án, các mục khác, schema có gợi ý', () => {
    const rw = agentsRewriteRequest({
      sectionKey: 'testing',
      sectionTitle: 'Kiểm thử',
      content: 'Có test',
      mode: 'rewrite',
      project: { ...project, currentPhase: 7 },
      others: [
        { title: 'Lệnh', content: '- Test: `npm test`' },
        { title: 'Bẫy', content: '' },
      ],
      language: 'vi-en',
    })
    expect(rw.prompt).toContain('Giai đoạn hiện tại: 7 · Xây tính năng')
    expect(rw.prompt).toContain('<cac_muc_khac>\n## Lệnh\n- Test: `npm test`\n</cac_muc_khac>')
    expect(rw.prompt).not.toContain('## Bẫy')
    expect(AgentsRewriteSchema.safeParse({ content: 'x', suggestions: ['a'] }).success).toBe(true)
    expect(
      AgentsRewriteSchema.safeParse({ content: 'x', suggestions: ['1', '2', '3', '4', '5'] })
        .success,
    ).toBe(false)
  })
})
