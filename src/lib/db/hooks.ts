import { listAllPrompts, listPrompts } from './prompts'
import { getProject, listProjects, projectStats } from './projects'
import { getSettings } from './settings'
import { useLiveQuery } from './use-live-query'

export const useProjects = () => useLiveQuery(listProjects, [])
export const useProjectStats = () => useLiveQuery(projectStats, [])
export const useSettings = () => useLiveQuery(getSettings, [])
export const useProject = (id: string) => useLiveQuery(() => getProject(id), [id])

/** Dự án đang chọn trên header (null = dùng chung). */
export function useCurrentProject() {
  return useLiveQuery(async () => {
    const s = await getSettings()
    return s.currentProjectId ? ((await getProject(s.currentProjectId)) ?? null) : null
  }, [])
}

export const usePrompts = (projectId: string | null) =>
  useLiveQuery(() => listPrompts(projectId), [projectId])
export const useAllPrompts = () => useLiveQuery(listAllPrompts, [])
