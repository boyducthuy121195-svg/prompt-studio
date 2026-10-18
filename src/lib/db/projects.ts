import type { Project, ProjectProfile } from '@/types/models'
import { LAST_PHASE } from '@/lib/phases'
import { db } from './schema'

export const EMPTY_PROFILE: ProjectProfile = {
  goal: '',
  techStack: '',
  commands: '',
  structure: '',
  conventions: '',
  donts: '',
  notes: '',
}

export const COPY_SUFFIX = ' (bản sao)'

export function newId(): string {
  return crypto.randomUUID()
}

export async function createProject(input: {
  name: string
  description?: string
}): Promise<Project> {
  const name = input.name.trim()
  if (!name) throw new Error('Tên dự án không được để trống.')
  const now = Date.now()
  const project: Project = {
    id: newId(),
    name,
    description: input.description?.trim() ?? '',
    profile: { ...EMPTY_PROFILE },
    currentPhase: 0,
    createdAt: now,
    updatedAt: now,
  }
  await db.projects.add(project)
  return project
}

export type ProjectPatch = Partial<
  Pick<Project, 'name' | 'description' | 'profile' | 'currentPhase'>
>

export async function updateProject(id: string, patch: ProjectPatch): Promise<void> {
  const changes: ProjectPatch & { updatedAt: number } = { ...patch, updatedAt: Date.now() }
  if (patch.name !== undefined) {
    changes.name = patch.name.trim()
    if (!changes.name) throw new Error('Tên dự án không được để trống.')
  }
  if (patch.currentPhase !== undefined) {
    changes.currentPhase = Math.min(Math.max(Math.trunc(patch.currentPhase), 0), LAST_PHASE)
  }
  const updated = await db.projects.update(id, changes)
  if (!updated) throw new Error('Không tìm thấy dự án. Có thể dự án đã bị xóa.')
}

export function getProject(id: string): Promise<Project | undefined> {
  return db.projects.get(id)
}

/** Dự án sửa gần nhất đứng đầu. */
export function listProjects(): Promise<Project[]> {
  return db.projects.orderBy('updatedAt').reverse().toArray()
}

/** Nhân bản dự án kèm hồ sơ, AGENTS.md và các prompt đã lưu của dự án. */
export async function duplicateProject(id: string): Promise<Project> {
  return db.transaction('rw', db.projects, db.prompts, db.agentsDocs, async () => {
    const source = await db.projects.get(id)
    if (!source) throw new Error('Không tìm thấy dự án để nhân bản.')
    const now = Date.now()
    const copy: Project = {
      ...source,
      id: newId(),
      name: source.name + COPY_SUFFIX,
      profile: { ...source.profile },
      createdAt: now,
      updatedAt: now,
    }
    await db.projects.add(copy)

    const prompts = await db.prompts.where('projectId').equals(id).toArray()
    await db.prompts.bulkAdd(
      prompts.map((p) => ({
        ...p,
        id: newId(),
        projectId: copy.id,
        createdAt: now,
        updatedAt: now,
      })),
    )
    const doc = await db.agentsDocs.where('projectId').equals(id).first()
    if (doc) {
      await db.agentsDocs.add({ ...doc, id: newId(), projectId: copy.id, updatedAt: now })
    }
    return copy
  })
}

/** Xóa dự án cùng prompt, AGENTS.md và lịch sử phiên bản của dự án. */
export async function deleteProject(id: string): Promise<void> {
  await db.transaction(
    'rw',
    [db.projects, db.prompts, db.agentsDocs, db.revisions, db.settings],
    async () => {
      const promptIds = await db.prompts.where('projectId').equals(id).primaryKeys()
      const docIds = await db.agentsDocs.where('projectId').equals(id).primaryKeys()
      await db.revisions
        .where('docId')
        .anyOf([...promptIds, ...docIds])
        .delete()
      await db.prompts.bulkDelete(promptIds)
      await db.agentsDocs.bulkDelete(docIds)
      await db.projects.delete(id)
      const settings = await db.settings.get('app')
      if (settings?.currentProjectId === id) {
        await db.settings.update('app', { currentProjectId: null })
      }
    },
  )
}

export interface ProjectStats {
  prompts: number
  agentsSections: number | null
}

/** Số prompt và số mục AGENTS.md đang bật của từng dự án (null = chưa có AGENTS.md). */
export async function projectStats(): Promise<Record<string, ProjectStats>> {
  const [prompts, docs] = await Promise.all([db.prompts.toArray(), db.agentsDocs.toArray()])
  const stats: Record<string, ProjectStats> = {}
  const get = (id: string) => (stats[id] ??= { prompts: 0, agentsSections: null })
  for (const p of prompts) if (p.projectId) get(p.projectId).prompts++
  for (const d of docs) get(d.projectId).agentsSections = d.sections.filter((s) => s.enabled).length
  return stats
}
