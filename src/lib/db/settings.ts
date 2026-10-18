import type { Settings } from '@/types/models'
import { DEFAULT_CLAUDE_MODEL } from '@/lib/ai/models'
import { db } from './schema'

export const DEFAULT_SETTINGS: Settings = {
  id: 'app',
  theme: 'light',
  sidebarCollapsed: false,
  currentProjectId: null,
  pins: [],
  claudeKey: '',
  geminiKey: '',
  defaultProvider: 'claude',
  claudeModel: DEFAULT_CLAUDE_MODEL,
  geminiModel: '',
  geminiModels: [],
  language: 'vi-en',
  lastBackupAt: null,
}

export async function getSettings(): Promise<Settings> {
  const saved = await db.settings.get('app')
  return { ...DEFAULT_SETTINGS, ...saved }
}

export async function updateSettings(patch: Partial<Omit<Settings, 'id'>>): Promise<Settings> {
  return db.transaction('rw', db.settings, async () => {
    const next: Settings = { ...(await getSettings()), ...patch, id: 'app' }
    await db.settings.put(next)
    return next
  })
}
