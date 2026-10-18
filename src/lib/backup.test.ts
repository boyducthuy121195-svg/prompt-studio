import { saveAgentsDoc, ensureAgentsDoc } from '@/lib/db/agents'
import { createProject, listProjects } from '@/lib/db/projects'
import { listAllPrompts, savePrompt } from '@/lib/db/prompts'
import { db } from '@/lib/db/schema'
import { getSettings, updateSettings } from '@/lib/db/settings'
import { clearDb } from '@/test/render-app'
import {
  backupFileName,
  backupReminderDays,
  backupSummary,
  createBackup,
  parseBackup,
  restoreBackup,
  wipeAllData,
} from './backup'

beforeEach(clearDb)

const DAY = 24 * 60 * 60 * 1000

async function seed() {
  const p = await createProject({ name: 'Prompt Studio' })
  await savePrompt({ projectId: p.id, title: 'Sửa lỗi', typeCode: 'SUA_LOI', body: 'abc' })
  const doc = await ensureAgentsDoc(p.id)
  await saveAgentsDoc(doc, doc.sections, p.name)
  await updateSettings({ claudeKey: 'sk-ant-secret', geminiKey: 'AIza-secret', theme: 'dark' })
  return p
}

describe('sao lưu', () => {
  it('mặc định không kèm API key', async () => {
    await seed()
    const b = await createBackup()
    expect(b.includesKeys).toBe(false)
    expect(b.data.settings.claudeKey).toBe('')
    expect(JSON.stringify(b)).not.toMatch(/sk-ant-secret|AIza-secret/)
    expect(backupSummary(b)).toEqual({ projects: 1, prompts: 1, agentsDocs: 1 })
  })

  it('kèm API key khi người dùng chọn', async () => {
    await seed()
    const b = await createBackup({ includeKeys: true })
    expect(b.data.settings.claudeKey).toBe('sk-ant-secret')
  })

  it('sao lưu → xóa hết → khôi phục: dữ liệu quay lại đủ', async () => {
    await seed()
    const text = JSON.stringify(await createBackup({}, 1_000))
    await wipeAllData()
    expect(await listProjects()).toHaveLength(0)
    await updateSettings({ claudeKey: 'sk-ant-new' })

    const parsed = parseBackup(text)
    if (!parsed.ok) throw new Error('parse failed')
    await restoreBackup(parsed.backup)
    expect(await listProjects()).toHaveLength(1)
    expect(await listAllPrompts()).toHaveLength(1)
    expect(await db.agentsDocs.count()).toBe(1)
    expect(await db.revisions.count()).toBe(1)
    const s = await getSettings()
    expect(s.theme).toBe('dark')
    expect(s.claudeKey).toBe('sk-ant-new')
    expect(s.lastBackupAt).toBe(1_000)
  })

  it('file hỏng hoặc sai định dạng bị từ chối', () => {
    expect(parseBackup('{oops')).toEqual({ ok: false, reason: 'json' })
    expect(parseBackup('{"app":"other"}')).toEqual({ ok: false, reason: 'format' })
  })

  it('tên file có ngày', () => {
    expect(backupFileName(new Date(2026, 9, 18).getTime())).toBe(
      'prompt-studio-backup-2026-10-18.json',
    )
  })

  it('nhắc khi quá 7 ngày, chưa có dự án thì không nhắc', () => {
    const now = 100 * DAY
    expect(backupReminderDays(null, null, now)).toBeNull()
    expect(backupReminderDays(now - 3 * DAY, null, now)).toBeNull()
    expect(backupReminderDays(now - 9 * DAY, null, now)).toBe(9)
    expect(backupReminderDays(null, now - 8 * DAY, now)).toBe(8)
  })
})
