import { Navigate, type RouteObject } from 'react-router'
import { NotFoundPage } from '@/components/NotFoundPage'
import { BackupPanel } from '@/features/backup/BackupPanel'
import { AgentsPageWithAi } from '@/features/wizard/AgentsAi'
import { ImprovePage } from '@/features/improve/ImprovePage'
import { LibraryPage } from '@/features/library/LibraryPage'
import { ProjectDetailPage } from '@/features/projects/ProjectDetailPage'
import { ProjectsPage } from '@/features/projects/ProjectsPage'
import { PromptBuilderPage } from '@/features/task-prompt/PromptBuilderPage'
import { PromptPickPage } from '@/features/task-prompt/PromptPickPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { TemplatesPage } from '@/features/templates/TemplatesPage'
import { AppLayout } from './AppLayout'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/projects" replace /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      { path: 'prompt', element: <PromptPickPage /> },
      { path: 'prompt/:typeCode', element: <PromptBuilderPage /> },
      { path: 'agents', element: <AgentsPageWithAi /> },
      { path: 'improve', element: <ImprovePage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'settings', element: <SettingsPage backupSlot={<BackupPanel />} /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
