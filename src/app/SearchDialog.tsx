import * as RadixDialog from '@radix-ui/react-dialog'
import { Search } from 'lucide-react'
import { useMemo, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { Tag } from '@/components/Primitives'
import { useUsePrompt } from '@/components/use-prompt-context'
import { useAllPrompts, useProjects } from '@/lib/db/hooks'
import { vi } from '@/lib/i18n/vi'
import { savedItem, stdItems } from '@/lib/library'
import { PROMPT_TYPES } from '@/lib/prompts/prompt-types'
import { buildSearchIndex, searchItems, type SearchItem } from '@/lib/search'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-items'

const t = vi.search

/** Hộp Tìm nhanh (Ctrl+K): tìm dự án, prompt, loại prompt, trang; Enter để mở. */
export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-20 bg-[rgba(14,22,20,.5)] dark:bg-black/60" />
        <RadixDialog.Content className="fixed left-1/2 top-[10vh] z-20 flex max-h-[76vh] w-[calc(100%-32px)] max-w-[620px] -translate-x-1/2 flex-col overflow-hidden rounded-[10px] border border-border bg-surface text-ink shadow-xl">
          <RadixDialog.Title className="sr-only">{t.title}</RadixDialog.Title>
          <RadixDialog.Description className="sr-only">{t.desc}</RadixDialog.Description>
          {open && <SearchBody close={() => onOpenChange(false)} />}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

function SearchBody({ close }: { close: () => void }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const projects = useProjects()
  const prompts = useAllPrompts()
  const openPrompt = useUsePrompt()
  const navigate = useNavigate()

  const index = useMemo(
    () =>
      buildSearchIndex({
        projects: projects.status === 'ready' ? projects.data : [],
        types: PROMPT_TYPES,
        prompts: [
          ...(prompts.status === 'ready' ? prompts.data.map(savedItem) : []),
          ...stdItems(),
        ],
        pages: NAV_ITEMS.filter((n) => !n.comingSoon),
        labels: { typeDesc: t.typeDesc, page: t.page },
      }),
    [projects, prompts],
  )
  const results = searchItems(index, query)
  const current = Math.min(active, Math.max(results.length - 1, 0))

  const choose = (item: SearchItem) => {
    close()
    if (item.kind === 'prompt') openPrompt(item.item)
    else navigate(item.to)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((current + 1) % Math.max(results.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((current - 1 + results.length) % Math.max(results.length, 1))
    } else if (e.key === 'Enter' && results[current]) {
      e.preventDefault()
      choose(results[current])
    }
  }

  const optionId = (i: number) => `search-opt-${i}`

  return (
    <>
      <div className="flex items-center gap-2 border-b border-border px-3.5">
        <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
        <input
          autoFocus
          role="combobox"
          aria-label={t.input}
          aria-expanded="true"
          aria-controls="search-results"
          aria-activedescendant={results.length ? optionId(current) : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
          }}
          onKeyDown={onKeyDown}
          placeholder={t.placeholder}
          className="h-12 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
        />
      </div>
      <ul
        id="search-results"
        role="listbox"
        aria-label={t.results}
        className="min-h-0 flex-1 overflow-y-auto p-1.5"
      >
        {results.length === 0 && (
          <li className="px-3 py-6 text-center text-muted">{t.empty(query.trim())}</li>
        )}
        {results.map((item, i) => (
          <li
            key={item.id}
            id={optionId(i)}
            role="option"
            aria-selected={i === current}
            onMouseMove={() => setActive(i)}
            onClick={() => choose(item)}
            className={cn(
              'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2',
              i === current && 'bg-accent-weak',
            )}
          >
            <Tag tone={item.kind === 'prompt' ? 'accent' : 'default'} className="shrink-0">
              {t.kinds[item.kind]}
            </Tag>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{item.title}</span>
              {item.desc && <span className="block truncate text-xs text-muted">{item.desc}</span>}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-x-3 border-t border-border bg-soft px-3.5 py-2 text-xs text-muted">
        <span>{t.hint}</span>
        <span>{t.promptAction}</span>
      </div>
    </>
  )
}
