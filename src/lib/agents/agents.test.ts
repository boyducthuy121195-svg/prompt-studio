import { strFromU8, unzipSync } from 'fflate'
import { createProject } from '@/lib/db/projects'
import { ensureAgentsDoc, getAgentsDoc, saveAgentsDoc } from '@/lib/db/agents'
import { db } from '@/lib/db/schema'
import { localChecks } from './checks'
import {
  addCustomSection,
  moveSection,
  removeSection,
  renderAgentsMd,
  skeletonSections,
  sortSections,
  toggleSection,
  updateSection,
} from './doc'
import { buildAgentsZip } from './export'

describe('thao tác trên mục AGENTS.md', () => {
  it('khung chuẩn có 10 mục theo thứ tự', () => {
    const s = skeletonSections()
    expect(s).toHaveLength(10)
    expect(s.map((x) => x.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('không tắt được mục bắt buộc; tắt được mục tùy chọn', () => {
    let s = toggleSection(skeletonSections(), 'commands')
    expect(s.find((x) => x.key === 'commands')?.enabled).toBe(true)
    s = toggleSection(s, 'gotchas')
    expect(s.find((x) => x.key === 'gotchas')?.enabled).toBe(false)
  })

  it('di chuyển, thêm, xóa mục tùy chỉnh (mục chuẩn không xóa được)', () => {
    let s = moveSection(skeletonSections(), 'boundaries', 0)
    expect(sortSections(s)[0].key).toBe('boundaries')
    s = addCustomSection(s, '  Quy tắc đặt tên  ')
    const custom = sortSections(s).at(-1)!
    expect(custom).toMatchObject({ title: 'Quy tắc đặt tên', custom: true, order: 10 })
    expect(removeSection(s, 'overview')).toHaveLength(11)
    expect(removeSection(s, custom.key)).toHaveLength(10)
    expect(addCustomSection(s, ' ')).toHaveLength(11)
  })

  it('ghép file: chỉ mục đang bật, đánh số lại', () => {
    let s = skeletonSections().map((x) => ({ ...x, content: `nội dung ${x.key}` }))
    s = toggleSection(s, 'structure')
    const md = renderAgentsMd('Prompt Studio', s)
    expect(md.startsWith('# AGENTS.md – Prompt Studio\n\n## 1. Tổng quan dự án')).toBe(true)
    expect(md).not.toContain('Cấu trúc thư mục')
    expect(md).toContain('## 3. Quy ước code')
  })
})

describe('kiểm tra chất lượng cục bộ', () => {
  const filled = () =>
    skeletonSections().map((s) => ({
      ...s,
      content: s.key === 'commands' ? '- Chạy: `npm run dev`' : `Quy tắc cụ thể cho ${s.title}`,
    }))

  it('file đầy đủ thì toàn bộ là ok', () => {
    expect(localChecks('A', filled()).every((c) => c.level === 'ok')).toBe(true)
  })

  it('báo thiếu mục bắt buộc, lệnh không có code, câu mơ hồ, chỗ trống, secret', () => {
    let s = updateSection(filled(), 'overview', { content: '' })
    s = updateSection(s, 'commands', { content: 'chạy npm run dev' })
    s = updateSection(s, 'conventions', { content: 'Viết code sạch, cẩn thận. Dùng {{framework}}' })
    s = updateSection(s, 'security', { content: 'Key: sk-ant-api03-abcdefghijklmnopqrstuvwxyz' })
    const texts = localChecks('A', s).map((c) => `${c.level}: ${c.text}`)
    expect(texts).toContainEqual(
      expect.stringMatching(/^error: Thiếu nội dung ở mục bắt buộc: Tổng quan dự án/),
    )
    expect(texts).toContainEqual(expect.stringMatching(/^warn: Mục Lệnh chưa có lệnh/))
    expect(texts).toContainEqual(
      expect.stringMatching(/^warn: Mục "Quy ước code": "code sạch", "cẩn thận"/),
    )
    expect(texts).toContainEqual(expect.stringMatching(/^warn: Mục "Quy ước code" còn chỗ trống/))
    expect(texts).toContainEqual(
      expect.stringMatching(/^error: Mục "Bảo mật & bí mật" có chuỗi giống API key/),
    )
  })

  it('cảnh báo khi quá dài', () => {
    const s = updateSection(filled(), 'gotchas', { content: Array(200).fill('- dòng').join('\n') })
    expect(localChecks('A', s).find((c) => c.text.startsWith('Dài'))?.level).toBe('warn')
  })
})

describe('xuất file và lưu', () => {
  beforeEach(async () => {
    await Promise.all(db.tables.map((t) => t.clear()))
  })

  it('gói zip có AGENTS.md, CLAUDE.md và .gemini/settings.json', () => {
    const files = unzipSync(buildAgentsZip('# AGENTS.md'))
    expect(Object.keys(files).sort()).toEqual(['.gemini/settings.json', 'AGENTS.md', 'CLAUDE.md'])
    expect(strFromU8(files['CLAUDE.md']).trim()).toBe('@AGENTS.md')
  })

  it('tạo AGENTS.md từ khung khi chưa có; lưu thì ghi lịch sử phiên bản', async () => {
    const p = await createProject({ name: 'A' })
    expect(await getAgentsDoc(p.id)).toBeUndefined()
    const doc = await ensureAgentsDoc(p.id)
    expect((await ensureAgentsDoc(p.id)).id).toBe(doc.id)
    await saveAgentsDoc(doc, updateSection(doc.sections, 'overview', { content: 'App A' }), 'A')
    expect((await getAgentsDoc(p.id))?.sections.find((s) => s.key === 'overview')?.content).toBe(
      'App A',
    )
    const revs = await db.revisions.where('docId').equals(doc.id).toArray()
    expect(revs).toHaveLength(1)
    expect(revs[0].content).toContain('App A')
  })
})
