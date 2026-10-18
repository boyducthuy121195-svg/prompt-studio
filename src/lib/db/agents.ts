import type { AgentsDoc, AgentsSection } from '@/types/models'
import { renderAgentsMd, skeletonSections } from '@/lib/agents/doc'
import { newId } from './projects'
import { db } from './schema'

export function getAgentsDoc(projectId: string): Promise<AgentsDoc | undefined> {
  return db.agentsDocs.where('projectId').equals(projectId).first()
}

/** Lấy AGENTS.md của dự án; chưa có thì tạo từ khung chuẩn 10 mục. */
export async function ensureAgentsDoc(projectId: string): Promise<AgentsDoc> {
  return db.transaction('rw', db.agentsDocs, async () => {
    const existing = await getAgentsDoc(projectId)
    if (existing) return existing
    const doc: AgentsDoc = {
      id: newId(),
      projectId,
      sections: skeletonSections(),
      updatedAt: Date.now(),
    }
    await db.agentsDocs.add(doc)
    return doc
  })
}

/** Lưu và ghi một bản vào lịch sử phiên bản (dành cho tính năng B1). */
export async function saveAgentsDoc(
  doc: AgentsDoc,
  sections: AgentsSection[],
  projectName: string,
): Promise<void> {
  const now = Date.now()
  await db.transaction('rw', db.agentsDocs, db.revisions, db.projects, async () => {
    await db.agentsDocs.put({ ...doc, sections, updatedAt: now })
    await db.revisions.add({
      id: newId(),
      docId: doc.id,
      kind: 'agents',
      content: renderAgentsMd(projectName, sections),
      createdAt: now,
    })
    await db.projects.update(doc.projectId, { updatedAt: now })
  })
}
