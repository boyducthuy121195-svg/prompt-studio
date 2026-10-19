import { Navigate, type RouteObject } from 'react-router'
import { NotFoundPage } from '@/components/NotFoundPage'
import { ProjectDetailPage } from '@/features/projects/ProjectDetailPage'
import { ProjectsPage } from '@/features/projects/ProjectsPage'
import { vi } from '@/lib/i18n/vi'
import { AppLayout } from './AppLayout'

/**
 * Trang Dự án tải ngay; các trang khác chỉ tải khi mở lần đầu (`lazy`) để app khởi động nhanh
 * (CodeMirror, react-markdown… khá nặng).
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    hydrateFallbackElement: <p className="p-5 text-muted">{vi.common.loading}</p>,
    children: [
      { index: true, element: <Navigate to="/projects" replace /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      {
        path: 'prompt',
        lazy: async () => ({
          Component: (await import('@/features/task-prompt/PromptPickPage')).PromptPickPage,
        }),
      },
      {
        path: 'prompt/:typeCode',
        lazy: async () => ({
          Component: (await import('@/features/task-prompt/PromptBuilderPage')).PromptBuilderPage,
        }),
      },
      {
        path: 'agents',
        lazy: async () => ({
          Component: (await import('@/features/wizard/AgentsAi')).AgentsPageWithAi,
        }),
      },
      {
        path: 'improve',
        lazy: async () => ({
          Component: (await import('@/features/improve/ImprovePage')).ImprovePage,
        }),
      },
      {
        path: 'library',
        lazy: async () => ({
          Component: (await import('@/features/library/LibraryPage')).LibraryPage,
        }),
      },
      {
        path: 'templates',
        lazy: async () => ({
          Component: (await import('@/features/templates/TemplatesPage')).TemplatesPage,
        }),
      },
      {
        path: 'settings',
        lazy: async () => {
          const [{ SettingsPage }, { BackupPanel }, { FolderPanel }] = await Promise.all([
            import('@/features/settings/SettingsPage'),
            import('@/features/backup/BackupPanel'),
            import('@/features/folder/FolderPanel'),
          ])
          return {
            element: (
              <SettingsPage
                backupSlot={
                  <>
                    <FolderPanel />
                    <BackupPanel />
                  </>
                }
              />
            ),
          }
        },
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
