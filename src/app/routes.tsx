import { Navigate, type RouteObject } from 'react-router'
import { PlaceholderPage } from '@/components/PlaceholderPage'
import { NotFoundPage } from '@/components/NotFoundPage'
import { LibraryPage } from '@/features/library/LibraryPage'
import { ProjectDetailPage } from '@/features/projects/ProjectDetailPage'
import { ProjectsPage } from '@/features/projects/ProjectsPage'
import { PromptBuilderPage } from '@/features/task-prompt/PromptBuilderPage'
import { PromptPickPage } from '@/features/task-prompt/PromptPickPage'
import { TemplatesPage } from '@/features/templates/TemplatesPage'
import { vi } from '@/lib/i18n/vi'
import { AppLayout } from './AppLayout'

const p = vi.pages

/** Các trang trống sẽ được thay bằng trang thật ở từng task trong PLAN.md. */
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
      { path: 'agents', element: <PlaceholderPage {...p.agents} /> },
      { path: 'improve', element: <PlaceholderPage {...p.improve} /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'settings', element: <PlaceholderPage {...p.settings} /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
