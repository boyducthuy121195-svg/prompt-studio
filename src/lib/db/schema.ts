import Dexie, { type EntityTable } from 'dexie'
import type { AgentsDoc, Project, Revision, SavedPrompt, Settings } from '@/types/models'

export const DB_NAME = 'prompt-studio'

export class PromptStudioDB extends Dexie {
  projects!: EntityTable<Project, 'id'>
  prompts!: EntityTable<SavedPrompt, 'id'>
  agentsDocs!: EntityTable<AgentsDoc, 'id'>
  revisions!: EntityTable<Revision, 'id'>
  settings!: EntityTable<Settings, 'id'>

  constructor(name = DB_NAME) {
    super(name)
    // Đổi cấu trúc: thêm db.version(2) kèm .upgrade() – KHÔNG sửa phiên bản cũ (xem AGENTS.md).
    this.version(1).stores({
      projects: 'id, updatedAt',
      prompts: 'id, projectId, typeCode, updatedAt, *tags',
      agentsDocs: 'id, &projectId',
      revisions: 'id, docId, createdAt',
      settings: 'id',
    })
  }
}

export const db = new PromptStudioDB()
