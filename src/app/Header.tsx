import { Moon, Sun } from 'lucide-react'
import { Button, Kbd, Tag } from '@/components/Primitives'
import { useToast } from '@/components/toast-context'
import { vi } from '@/lib/i18n/vi'
import { ProjectSelect } from './ProjectSelect'
import { useUiPrefs } from './ui-prefs-context'

export function Header() {
  const { theme, toggleTheme } = useUiPrefs()
  const toast = useToast()
  const isDark = theme === 'dark'
  const themeLabel = isDark ? vi.header.toLight : vi.header.toDark

  return (
    <header className="flex min-h-[52px] flex-wrap items-center gap-2.5 border-b border-border bg-surface px-5 py-2">
      <ProjectSelect />
      <Tag>{vi.header.aiNotSet}</Tag>
      <div className="flex-[1_1_40px]" />
      <div className="relative flex-[0_1_300px] max-sm:flex-[1_1_100%]">
        <label htmlFor="search" className="sr-only">
          {vi.header.search}
        </label>
        <input
          id="search"
          readOnly
          onFocus={() => toast(vi.header.searchSoon)}
          placeholder={vi.header.searchPlaceholder}
          className="h-9 w-full rounded-md border border-border bg-surface pl-2.5 pr-16 text-ink placeholder:text-muted"
        />
        <Kbd className="absolute right-2 top-2.5">Ctrl+K</Kbd>
      </div>
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
