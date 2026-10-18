import { getProject, listProjects, projectStats } from './projects'
import { getSettings } from './settings'
import { useLiveQuery } from './use-live-query'

export const useProjects = () => useLiveQuery(listProjects, [])
export const useProjectStats = () => useLiveQuery(projectStats, [])
export const useSettings = () => useLiveQuery(getSettings, [])
export const useProject = (id: string) => useLiveQuery(() => getProject(id), [id])
