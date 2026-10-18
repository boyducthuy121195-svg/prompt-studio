import { z } from 'zod'
import { db } from '@/lib/db/schema'
import { DEFAULT_SETTINGS, getSettings } from '@/lib/db/settings'
import type { Settings } from '@/types/models'

export const BACKUP_APP = 'prompt-studio'
export const BACKUP_VERSION = 1
/** Nhắc sao lưu khi đã quá số ngày này. */
export const REMIND_AFTER_DAYS = 7
const DAY = 24 * 60 * 60 * 1000

const ProfileSchema = z.object({
  goal: z.string(),
  techStack: z.string(),
  commands: z.string(),
  structure: z.string(),
  conventions: z.string(),
  donts: z.string(),
  notes: z.string(),
})

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  profile: ProfileSchema,
  currentPhase: z.number().int().min(0).max(10),
  createdAt: z.number(),
  updatedAt: z.number(),
})

const PromptSchema = z.object({
  id: z.string(),
  projectId: z.string().nullable(),
  title: z.string(),
  typeCode: z.string(),
  body: z.string(),
  formState: z.unknown().optional(),
  tags: z.array(z.string()),
  createdAt: z.number(),
  updatedAt: z.number(),
})

const AgentsDocSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  sections: z.array(
    z.object({
      key: z.string(),
      title: z.string(),
      enabled: z.boolean(),
      order: z.number(),
      content: z.string(),
      custom: z.boolean(),
    }),
  ),
  updatedAt: z.number(),
})

const RevisionSchema = z.object({
  id: z.string(),
  docId: z.string(),
  kind: z.enum(['agents', 'prompt']),
  content: z.string(),
  createdAt: z.number(),
})

/** Cài đặt: chỉ nhận các trường biết trước, trường thiếu lấy giá trị mặc định. */
const SettingsSchema = z
  .object({
    theme: z.enum(['light', 'dark']),
    sidebarCollapsed: z.boolean(),
    currentProjectId: z.string().nullable(),
    pins: z.array(z.string()),
    claudeKey: z.string(),
    geminiKey: z.string(),
    defaultProvider: z.enum(['claude', 'gemini']),
    claudeModel: z.string(),
    geminiModel: z.string(),
    geminiModels: z.array(z.string()),
    language: z.enum(['vi-en', 'vi', 'en']),
    lastBackupAt: z.number().nullable(),
  })
  .partial()

export const BackupSchema = z.object({
  app: z.literal(BACKUP_APP),
  version: z.literal(BACKUP_VERSION),
  exportedAt: z.number(),
  includesKeys: z.boolean(),
  data: z.object({
    projects: z.array(ProjectSchema),
    prompts: z.array(PromptSchema),
    agentsDocs: z.array(AgentsDocSchema),
    revisions: z.array(RevisionSchema),
    settings: SettingsSchema,
  }),
})
export type BackupFile = z.infer<typeof BackupSchema>

/** Đọc toàn bộ dữ liệu thành một file sao lưu. Mặc định bỏ API key ra. */
export async function createBackup(
  { includeKeys = false }: { includeKeys?: boolean } = {},
  now: number = Date.now(),
): Promise<BackupFile> {
  const [projects, prompts, agentsDocs, revisions, settings] = await Promise.all([
    db.projects.toArray(),
    db.prompts.toArray(),
    db.agentsDocs.toArray(),
    db.revisions.toArray(),
    getSettings(),
  ])
  const { id: _id, ...rest } = settings
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: now,
    includesKeys: includeKeys,
    data: {
      projects,
      prompts,
      agentsDocs,
      revisions,
      settings: includeKeys ? rest : { ...rest, claudeKey: '', geminiKey: '' },
    },
  }
}

export function backupFileName(now: number = Date.now()): string {
  const d = new Date(now)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `prompt-studio-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`
}

export type ParseResult =
  { ok: true; backup: BackupFile } | { ok: false; reason: 'json' | 'format' }

/** Kiểm tra file sao lưu bằng Zod trước khi cho khôi phục. */
export function parseBackup(text: string): ParseResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'json' }
  }
  const parsed = BackupSchema.safeParse(raw)
  return parsed.success ? { ok: true, backup: parsed.data } : { ok: false, reason: 'format' }
}

export function backupSummary(b: BackupFile) {
  return {
    projects: b.data.projects.length,
    prompts: b.data.prompts.length,
    agentsDocs: b.data.agentsDocs.length,
  }
}

/**
 * Thay toàn bộ dữ liệu bằng nội dung file sao lưu.
 * File không kèm API key thì giữ key đang có trên máy này.
 */
export async function restoreBackup(b: BackupFile): Promise<void> {
  const current = await getSettings()
  const keep = b.includesKeys ? {} : { claudeKey: current.claudeKey, geminiKey: current.geminiKey }
  const settings: Settings = {
    ...DEFAULT_SETTINGS,
    ...b.data.settings,
    ...keep,
    lastBackupAt: b.exportedAt,
    id: 'app',
  }
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()))
    await db.projects.bulkAdd(b.data.projects)
    await db.prompts.bulkAdd(b.data.prompts)
    await db.agentsDocs.bulkAdd(b.data.agentsDocs)
    await db.revisions.bulkAdd(b.data.revisions)
    await db.settings.put(settings)
  })
}

/** Xóa sạch mọi dữ liệu của app trong trình duyệt này. */
export async function wipeAllData(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()))
  })
}

/**
 * Số ngày chưa sao lưu nếu cần nhắc, ngược lại null.
 * Chưa từng sao lưu thì tính từ dự án tạo sớm nhất.
 */
export function backupReminderDays(
  lastBackupAt: number | null,
  firstProjectAt: number | null,
  now: number = Date.now(),
): number | null {
  const since = lastBackupAt ?? firstProjectAt
  if (since === null) return null
  const days = Math.floor((now - since) / DAY)
  return days >= REMIND_AFTER_DAYS ? days : null
}
