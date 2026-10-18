import type { SavedPrompt } from '@/types/models'
import { newId } from './projects'
import { db } from './schema'
import { getSettings, updateSettings } from './settings'

export interface PromptInput {
  projectId: string | null
  title: string
  typeCode: string
  body: string
  formState?: unknown
  tags?: string[]
}

export function normalizeTags(tags: readonly string[] = []): string[] {
  return [...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))]
}

export async function savePrompt(input: PromptInput): Promise<SavedPrompt> {
  const title = input.title.trim()
  if (!title) throw new Error('Tên prompt không được để trống.')
  const now = Date.now()
  const prompt: SavedPrompt = {
    id: newId(),
    projectId: input.projectId,
    title,
    typeCode: input.typeCode,
    body: input.body,
    formState: input.formState,
    tags: normalizeTags(input.tags),
    createdAt: now,
    updatedAt: now,
  }
  await db.prompts.add(prompt)
  return prompt
}

export async function updatePrompt(
  id: string,
  patch: Partial<Pick<SavedPrompt, 'title' | 'body' | 'tags' | 'projectId'>>,
): Promise<void> {
  const changes: typeof patch & { updatedAt: number } = { ...patch, updatedAt: Date.now() }
  if (patch.title !== undefined) {
    changes.title = patch.title.trim()
    if (!changes.title) throw new Error('Tên prompt không được để trống.')
  }
  if (patch.tags) changes.tags = normalizeTags(patch.tags)
  if (!(await db.prompts.update(id, changes)))
    throw new Error('Không tìm thấy prompt. Có thể đã bị xóa.')
}

/** Xóa prompt và bỏ ghim nếu đang ghim. */
export async function deletePrompt(id: string): Promise<void> {
  await db.transaction('rw', db.prompts, db.revisions, db.settings, async () => {
    await db.prompts.delete(id)
    await db.revisions.where('docId').equals(id).delete()
    const s = await getSettings()
    if (s.pins.includes(id)) await updateSettings({ pins: s.pins.filter((p) => p !== id) })
  })
}

/** projectId = null → prompt "Dùng chung". Mới sửa đứng đầu. */
export async function listPrompts(projectId: string | null): Promise<SavedPrompt[]> {
  const all = await db.prompts.orderBy('updatedAt').reverse().toArray()
  return all.filter((p) => p.projectId === projectId)
}

export async function listAllPrompts(): Promise<SavedPrompt[]> {
  return db.prompts.toArray()
}

export async function togglePin(pinId: string): Promise<boolean> {
  return db.transaction('rw', db.settings, async () => {
    const s = await getSettings()
    const pinned = s.pins.includes(pinId)
    await updateSettings({ pins: pinned ? s.pins.filter((p) => p !== pinId) : [...s.pins, pinId] })
    return !pinned
  })
}
