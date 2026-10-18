import {
  BookOpen,
  FileText,
  FolderOpen,
  Settings,
  Sparkles,
  Table2,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { vi } from '@/lib/i18n/vi'

export interface NavItem {
  path: string
  label: string
  icon: LucideIcon
  comingSoon?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/projects', label: vi.nav.projects, icon: FolderOpen },
  { path: '/prompt', label: vi.nav.prompt, icon: Sparkles },
  { path: '/agents', label: vi.nav.agents, icon: FileText },
  { path: '/improve', label: vi.nav.improve, icon: TrendingUp },
  { path: '/library', label: vi.nav.library, icon: BookOpen },
  { path: '/templates', label: vi.nav.templates, icon: Table2, comingSoon: true },
  { path: '/settings', label: vi.nav.settings, icon: Settings },
]
