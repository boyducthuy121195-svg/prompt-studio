import { PanelLeft, Pin, Terminal } from 'lucide-react'
import { NavLink } from 'react-router'
import { Kbd, Tag } from '@/components/Primitives'
import { vi } from '@/lib/i18n/vi'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-items'
import { useUiPrefs } from './ui-prefs-context'

/**
 * Thanh bên trái. Khi thu gọn (hoặc màn hình hẹp dưới 768px) toàn bộ thanh chỉ còn biểu tượng.
 * Class `label` là phần chữ bị ẩn khi thu gọn.
 */
export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiPrefs()
  const label = cn('max-md:hidden', sidebarCollapsed && 'hidden')
  const center = cn('max-md:justify-center max-md:px-0', sidebarCollapsed && 'justify-center px-0')
  const toggleLabel = sidebarCollapsed ? vi.nav.expand : vi.nav.collapse

  return (
    <aside
      data-collapsed={sidebarCollapsed}
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col gap-0.5 border-r border-border bg-side px-2.5 py-3 max-md:w-[60px]',
        sidebarCollapsed ? 'w-[60px]' : 'w-[236px]',
      )}
    >
      <div className={cn('flex items-center gap-2.5 px-1.5 pb-3', center)}>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent">
          <Terminal className="size-4 text-on-accent" strokeWidth={2.2} aria-hidden="true" />
        </div>
        <div className={label}>
          <div className="text-sm font-bold">{vi.app.name}</div>
          <div className="text-[11px] text-muted">{vi.app.localUrl}</div>
        </div>
      </div>

      <nav aria-label={vi.nav.mainLabel} className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ path, label: text, icon: Icon, comingSoon }) => (
          <NavLink
            key={path}
            to={path}
            title={text}
            className={({ isActive }) =>
              cn(
                'flex h-9 items-center gap-2.5 overflow-hidden whitespace-nowrap rounded-md px-2.5 text-ink hover:bg-hover',
                isActive &&
                  'bg-accent-weak font-semibold text-accent-ink shadow-[inset_0_0_0_1px_var(--accent-line)]',
                center,
              )
            }
          >
            <Icon className="size-[17px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
            <span className={cn('flex-1', label)}>{text}</span>
            {comingSoon && (
              <Tag tone="warn" className={label}>
                {vi.nav.comingSoon}
              </Tag>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-3.5 flex flex-col gap-0.5 border-t border-border px-1 pt-2.5">
        <div
          className={cn('flex items-center gap-1.5 px-1.5 pb-1 text-muted', center)}
          title={vi.nav.pinned}
        >
          <Pin className="size-[13px]" aria-hidden="true" />
          <span className={cn('text-[11px] font-semibold uppercase tracking-wide', label)}>
            {vi.nav.pinned}
          </span>
        </div>
        <p className={cn('px-1.5 text-xs text-muted', label)}>{vi.nav.noPinned}</p>
      </div>

      <div className="mt-auto border-t border-border pt-2.5">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={toggleLabel}
          title={`${toggleLabel} (Ctrl+B)`}
          className={cn(
            'flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-ink hover:bg-hover max-md:hidden',
            center,
          )}
        >
          <PanelLeft className="size-[17px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
          <span className={cn('flex-1 whitespace-nowrap text-left', label)}>{vi.nav.collapse}</span>
          <Kbd className={label}>Ctrl+B</Kbd>
        </button>
      </div>
    </aside>
  )
}
