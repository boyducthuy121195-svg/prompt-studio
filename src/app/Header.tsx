import { Moon, Search, Sun } from 'lucide-react'
import { Button, Kbd, Tag } from '@/components/Primitives'
import { aiLabel } from '@/lib/ai'
import { useSettings } from '@/lib/db/hooks'
import { vi } from '@/lib/i18n/vi'
import { ProjectSelect } from './ProjectSelect'
import { useUiPrefs } from './ui-prefs-context'

export function Header({ onSearch }: { onSearch: () => void }) {
  const { theme, toggleTheme } = useUiPrefs()
  const settings = useSettings()
  const ai = settings.status === 'ready' ? aiLabel(settings.data) : null
  const isDark = theme === 'dark'
  const themeLabel = isDark ? vi.header.toLight : vi.header.toDark

  return (
    <header className="flex min-h-[52px] flex-wrap items-center gap-2.5 border-b border-border bg-surface px-5 py-2">
      <ProjectSelect />
      <Tag tone={ai ? 'accent' : 'default'}>{ai ? vi.header.aiLabel(ai) : vi.header.aiNotSet}</Tag>
      <div className="flex-[1_1_40px]" />
      <button
        type="button"
        onClick={onSearch}
        aria-label={vi.header.openSearch}
        className="flex h-9 flex-[0_1_300px] cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-left text-muted hover:border-accent-line max-sm:flex-[1_1_100%]"
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{vi.header.searchPlaceholder}</span>
        <Kbd className="max-sm:hidden">Ctrl+K</Kbd>
      </button>
      <Button variant="ghost" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel}>
        {isDark ? (
          <Sun className="size-[17px]" aria-hidden="true" />
        ) : (
          <Moon className="size-[17px]" aria-hidden="true" />
        )}
        <span className="max-sm:hidden">{isDark ? vi.header.light : vi.header.dark}</span>
      </Button>
    </header>
  )
}
