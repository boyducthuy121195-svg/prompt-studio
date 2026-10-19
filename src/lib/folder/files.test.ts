import { skeletonSections } from '@/lib/agents/doc'
import type { BackupFile } from '@/lib/backup'
import type { Project, SavedPrompt } from '@/types/models'
import {
  agentsFiles,
  backupName,
  buildDataFolderFiles,
  codeFileAction,
  DATA_FILE,
  hashText,
  isEmptyData,
  planSync,
  profileMarkdown,
  promptMarkdown,
  slugify,
} from './files'

const project = (id: string, name: string, createdAt: number): Project => ({
  id,
  name,
  description: '',
  profile: {
    goal: 'MVP chạy local',
    techStack: '',
    commands: '',
    structure: '',
    conventions: '',
    donts: '',
    notes: '',
  },
  currentPhase: 2,
  createdAt,
  updatedAt: createdAt + 5,
})

const prompt = (id: string, projectId: string | null, title: string, at: number): SavedPrompt => ({
  id,
  projectId,
  title,
  typeCode: 'SUA_LOI',
  body: `Nội dung ${title}`,
  tags: ['loi'],
  createdAt: at,
  updatedAt: at,
})

function backup(over: Partial<BackupFile['data']> = {}): BackupFile {
  return {
    app: 'prompt-studio',
    version: 1,
    exportedAt: 999_999,
    includesKeys: true,
    data: {
      projects: [],
      prompts: [],
      agentsDocs: [],
      revisions: [],
      settings: { claudeKey: 'sk-ant-bi-mat', geminiKey: 'AIza-bi-mat', theme: 'dark' },
      ...over,
    },
  }
}

describe('slugify', () => {
  it('bỏ dấu, chữ thường, chỉ giữ a-z 0-9 và gạch nối', () => {
    expect(slugify('Web bán hàng: Đợt 2!')).toBe('web-ban-hang-dot-2')
    expect(slugify('***', 'du-an')).toBe('du-an')
    expect(slugify('a'.repeat(80))).toHaveLength(60)
  })
})

describe('nội dung file', () => {
  it('hồ sơ dự án chỉ in ô có nội dung, kèm giai đoạn', () => {
    const md = profileMarkdown(project('p1', 'Web bán hàng', 1))
    expect(md).toContain('# Web bán hàng')
    expect(md).toContain('## Mục tiêu\n\nMVP chạy local')
    expect(md).not.toContain('## Lệnh')
    expect(md).toMatch(/Giai đoạn hiện tại: /)
  })

  it('prompt có dòng ghi chú tiêu đề, loại, thẻ', () => {
    expect(promptMarkdown(prompt('x', null, 'Sửa lỗi lưu', 1))).toBe(
      '<!-- Sửa lỗi lưu · Loại: SUA_LOI · Thẻ: loi -->\n\nNội dung Sửa lỗi lưu\n',
    )
  })

  it('AGENTS.md kèm CLAUDE.md trỏ tới @AGENTS.md', () => {
    const files = agentsFiles('Web', skeletonSections())
    expect(files.map((f) => f.path)).toEqual(['AGENTS.md', 'CLAUDE.md'])
    expect(files[0].content).toMatch(/^# AGENTS.md – Web/)
    expect(files[1].content.trim()).toBe('@AGENTS.md')
  })
})

describe('buildDataFolderFiles', () => {
  const data = backup({
    projects: [project('p1', 'Web bán hàng', 1), project('p2', 'Web bán hàng', 2)],
    prompts: [
      prompt('a', 'p1', 'Sửa lỗi', 10),
      prompt('b', 'p1', 'Sửa lỗi', 11),
      prompt('c', null, 'Dùng chung', 12),
      prompt('d', 'mat-tich', 'Mồ côi', 13),
    ],
    agentsDocs: [{ id: 'd1', projectId: 'p1', sections: skeletonSections(), updatedAt: 20 }],
  })

  it('đủ cấu trúc thư mục, tên trùng được đánh số', () => {
    const paths = buildDataFolderFiles(data).map((f) => f.path)
    expect(paths).toEqual([
      'README.md',
      DATA_FILE,
      'du-an/web-ban-hang/ho-so.md',
      'du-an/web-ban-hang/AGENTS.md',
      'du-an/web-ban-hang/CLAUDE.md',
      'du-an/web-ban-hang-2/ho-so.md',
      'du-an/web-ban-hang/prompts/sua-loi.md',
      'du-an/web-ban-hang/prompts/sua-loi-2.md',
      'dung-chung/prompts/dung-chung.md',
    ])
  })

  it('file dữ liệu KHÔNG BAO GIỜ chứa API key, kể cả khi bản sao lưu có key', () => {
    const files = buildDataFolderFiles(data)
    for (const f of files) {
      expect(f.content).not.toContain('sk-ant-bi-mat')
      expect(f.content).not.toContain('AIza-bi-mat')
    }
    const json = JSON.parse(files.find((f) => f.path === DATA_FILE)!.content)
    expect(json.includesKeys).toBe(false)
    expect(json.data.settings.theme).toBe('dark')
  })

  it('thời điểm trong file dữ liệu là lần sửa cuối, không đổi khi chỉ mở lại app', () => {
    const a = buildDataFolderFiles({ ...data, exportedAt: 1 })
    const b = buildDataFolderFiles({ ...data, exportedAt: 2 })
    expect(a).toEqual(b)
    expect(JSON.parse(a[1].content).exportedAt).toBe(20)
  })

  it('app trống = chưa có dự án và prompt', () => {
    expect(isEmptyData(backup())).toBe(true)
    expect(isEmptyData(data)).toBe(false)
  })
})

describe('planSync', () => {
  it('chỉ ghi file mới / đổi, xóa file app từng ghi mà nay không còn', () => {
    const prev = { 'a.md': hashText('A'), 'b.md': hashText('B'), 'cu.md': hashText('C') }
    const plan = planSync(prev, [
      { path: 'a.md', content: 'A' },
      { path: 'b.md', content: 'B mới' },
      { path: 'moi.md', content: 'M' },
    ])
    expect(plan.write.map((f) => f.path)).toEqual(['b.md', 'moi.md'])
    expect(plan.remove).toEqual(['cu.md'])
    expect(Object.keys(plan.next)).toEqual(['a.md', 'b.md', 'moi.md'])
  })
})

describe('thư mục code', () => {
  it('quyết định ghi / bỏ qua / giữ bản cũ', () => {
    expect(codeFileAction(null, 'mới', undefined)).toBe('write')
    expect(codeFileAction('mới', 'mới', undefined)).toBe('skip')
    expect(codeFileAction('của người khác', 'mới', undefined)).toBe('backup')
    expect(codeFileAction('bản app ghi', 'mới', hashText('bản app ghi'))).toBe('write')
    expect(codeFileAction('đã bị sửa tay', 'mới', hashText('bản app ghi'))).toBe('backup')
  })

  it('tên bản cũ theo ngày', () => {
    const day = new Date(2026, 9, 19, 15, 30).getTime()
    expect(backupName('AGENTS.md', day)).toBe('AGENTS.backup-2026-10-19.md')
    expect(backupName('CLAUDE.md', day, 2)).toBe('CLAUDE.backup-2026-10-19-2.md')
  })
})
