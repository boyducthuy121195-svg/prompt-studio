import { Navigate, type RouteObject } from 'react-router'
import { PlaceholderPage } from '@/components/PlaceholderPage'
import { NotFoundPage } from '@/components/NotFoundPage'
import { ProjectDetailPage } from '@/features/projects/ProjectDetailPage'
import { ProjectsPage } from '@/features/projects/ProjectsPage'
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
      { path: 'prompt', element: <PlaceholderPage {...p.prompt} /> },
      { path: 'agents', element: <PlaceholderPage {...p.agents} /> },
      { path: 'improve', element: <PlaceholderPage {...p.improve} /> },
      { path: 'library', element: <PlaceholderPage {...p.library} /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'settings', element: <PlaceholderPage {...p.settings} /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
