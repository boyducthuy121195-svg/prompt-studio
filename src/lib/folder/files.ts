import { renderAgentsMd } from '@/lib/agents/doc'
import type { BackupFile } from '@/lib/backup'
import { phaseLabel } from '@/lib/phases'
import { COMPANION_FILES } from '@/lib/prompts/agents-skeleton'
import { normalize } from '@/lib/search'
import type { AgentsSection, Project, SavedPrompt } from '@/types/models'

/** Một file sẽ ghi ra thư mục; `path` dùng dấu "/" (ví dụ "du-an/web-ban-hang/AGENTS.md"). */
export interface FolderFile {
  path: string
  content: string
}

export const DATA_FILE = 'du-lieu-prompt-studio.json'
export const MANIFEST_FILE = '.prompt-studio-manifest.json'

const PROFILE_LABELS: [keyof Project['profile'], string][] = [
  ['goal', 'Mục tiêu'],
  ['techStack', 'Công nghệ (tech stack)'],
  ['commands', 'Lệnh'],
  ['structure', 'Cấu trúc thư mục'],
  ['conventions', 'Quy ước code'],
  ['donts', 'Điều không được làm'],
  ['notes', 'Ghi chú'],
]

/** Tên file / thư mục an toàn trên Windows: bỏ dấu, chữ thường, chỉ a-z 0-9 và "-". */
export function slugify(name: string, fallback = 'khong-ten'): string {
  const s = normalize(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')
  return s || fallback
}

/** Đặt tên không trùng trong cùng một thư mục: "sua-loi", "sua-loi-2"… */
function uniqueNamer() {
  const used = new Set<string>()
  return (base: string) => {
    let name = base
    for (let n = 2; used.has(name); n++) name = `${base}-${n}`
    used.add(name)
    return name
  }
}

export function profileMarkdown(p: Project): string {
  const lines = [`# ${p.name}`, '']
  if (p.description.trim()) lines.push(p.description.trim(), '')
  lines.push(`- Giai đoạn hiện tại: ${phaseLabel(p.currentPhase)}`)
  for (const [k, label] of PROFILE_LABELS) {
    const v = p.profile[k].trim()
    if (v) lines.push('', `## ${label}`, '', v)
  }
  return lines.join('\n') + '\n'
}

export function promptMarkdown(p: SavedPrompt): string {
  const meta = [`Loại: ${p.typeCode}`, ...(p.tags.length ? [`Thẻ: ${p.tags.join(', ')}`] : [])]
  return `<!-- ${p.title} · ${meta.join(' · ')} -->\n\n${p.body.trim()}\n`
}

/** AGENTS.md và CLAUDE.md (`@AGENTS.md`) của một dự án. */
export function agentsFiles(projectName: string, sections: readonly AgentsSection[]): FolderFile[] {
  return [
    { path: 'AGENTS.md', content: renderAgentsMd(projectName, sections) },
    { path: 'CLAUDE.md', content: COMPANION_FILES['CLAUDE.md'] },
  ]
}

const README = `# Dữ liệu Prompt Studio

Thư mục này do app Prompt Studio tự ghi sau mỗi lần bạn sửa trong app.
- \`${DATA_FILE}\`: toàn bộ dữ liệu (không có API key). Đổi máy thì dùng nút "Nạp từ thư mục" trong Cài đặt.
- \`du-an/\`: mỗi dự án một thư mục (hồ sơ, AGENTS.md, CLAUDE.md, prompt đã lưu).
- \`dung-chung/\`: prompt không thuộc dự án nào.

Hãy sửa trong app. App chỉ ghi ra đây, không đọc lại: sửa tay các file này sẽ bị ghi đè ở lần lưu sau.
`

/** App chưa có dự án và prompt nào – không ghi ra thư mục để khỏi xóa dữ liệu cũ ở đó. */
export function isEmptyData(backup: BackupFile): boolean {
  return backup.data.projects.length === 0 && backup.data.prompts.length === 0
}

/** Thời điểm sửa gần nhất trong dữ liệu (để file dữ liệu không đổi khi chỉ mở lại app). */
function latestChange({ projects, prompts, agentsDocs, revisions }: BackupFile['data']): number {
  return Math.max(
    0,
    ...projects.map((p) => p.updatedAt),
    ...prompts.map((p) => p.updatedAt),
    ...agentsDocs.map((d) => d.updatedAt),
    ...revisions.map((r) => r.createdAt),
  )
}

/**
 * Toàn bộ file của thư mục dữ liệu, dựng từ một bản sao lưu. API key luôn bị bỏ ra.
 * Hàm thuần: cùng dữ liệu luôn ra cùng danh sách file.
 */
export function buildDataFolderFiles(backup: BackupFile): FolderFile[] {
  const safe: BackupFile = {
    ...backup,
    exportedAt: latestChange(backup.data) || backup.exportedAt,
    includesKeys: false,
    data: {
      ...backup.data,
      settings: { ...backup.data.settings, claudeKey: '', geminiKey: '' },
    },
  }
  const files: FolderFile[] = [
    { path: 'README.md', content: README },
    { path: DATA_FILE, content: JSON.stringify(safe, null, 2) + '\n' },
  ]
  const { projects, prompts, agentsDocs } = safe.data
  const projectDir = uniqueNamer()
  const dirOf = new Map<string, string>()
  for (const p of [...projects].sort((a, b) => a.createdAt - b.createdAt)) {
    const dir = `du-an/${projectDir(slugify(p.name, 'du-an'))}`
    dirOf.set(p.id, dir)
    files.push({ path: `${dir}/ho-so.md`, content: profileMarkdown(p) })
    const doc = agentsDocs.find((d) => d.projectId === p.id)
    if (doc)
      for (const f of agentsFiles(p.name, doc.sections))
        files.push({ path: `${dir}/${f.path}`, content: f.content })
  }
  const promptNamers = new Map<string, (base: string) => string>()
  for (const pr of [...prompts].sort((a, b) => a.createdAt - b.createdAt)) {
    const base = pr.projectId ? dirOf.get(pr.projectId) : 'dung-chung'
    if (!base) continue
    const dir = `${base}/prompts`
    if (!promptNamers.has(dir)) promptNamers.set(dir, uniqueNamer())
    const name = promptNamers.get(dir)!(slugify(pr.title, 'prompt'))
    files.push({ path: `${dir}/${name}.md`, content: promptMarkdown(pr) })
  }
  return files
}

/** Mã băm ngắn (FNV-1a) để biết file nào đã đổi, khỏi ghi lại file không đổi. */
export function hashText(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

export type Manifest = Record<string, string>

/** So với lần ghi trước: file nào cần ghi (mới / đổi), file nào cần xóa (app từng ghi mà nay không còn). */
export function planSync(previous: Manifest, files: readonly FolderFile[]) {
  const next: Manifest = {}
  const write: FolderFile[] = []
  for (const f of files) {
    const h = hashText(f.content)
    next[f.path] = h
    if (previous[f.path] !== h) write.push(f)
  }
  const remove = Object.keys(previous).filter((p) => !(p in next))
  return { write, remove, next }
}

/**
 * Ghi một file vào thư mục code của dự án thì làm gì:
 * - `skip`: file ở đó đã đúng nội dung.
 * - `write`: chưa có file, hoặc file ở đó chính là bản app ghi lần trước.
 * - `backup`: file ở đó do người khác viết (khác nội dung) → giữ bản cũ thành *.backup-<ngày>.md rồi mới ghi.
 */
export function codeFileAction(
  existing: string | null,
  content: string,
  lastWrittenHash: string | undefined,
): 'skip' | 'write' | 'backup' {
  if (existing === null) return 'write'
  if (existing === content) return 'skip'
  return lastWrittenHash !== undefined && hashText(existing) === lastWrittenHash
    ? 'write'
    : 'backup'
}

/** "AGENTS.md" → "AGENTS.backup-2026-10-19.md" (lần thứ 2 trong ngày: "AGENTS.backup-2026-10-19-2.md"). */
export function backupName(path: string, now: number, n = 1): string {
  const d = new Date(now)
  const pad = (x: number) => String(x).padStart(2, '0')
  const day = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const dot = path.lastIndexOf('.')
  const [stem, ext] = dot > 0 ? [path.slice(0, dot), path.slice(dot)] : [path, '']
  return `${stem}.backup-${day}${n > 1 ? `-${n}` : ''}${ext}`
}
