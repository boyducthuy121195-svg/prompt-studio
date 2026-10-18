import { Check } from 'lucide-react'
import { PHASES } from '@/lib/phases'
import { cn } from '@/lib/utils'

/** Thanh tiến độ 11 giai đoạn: đã qua (xanh lá), hiện tại (teal), chưa tới (trắng). */
export function PhaseBar({
  current,
  onSelect,
}: {
  current: number
  onSelect: (index: number) => void
}) {
  return (
    <ol className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-1.5">
      {PHASES.map((name, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo'
        return (
          <li key={name}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={state === 'current' ? 'step' : undefined}
              className={cn(
                'flex min-h-12 w-full cursor-pointer flex-col gap-0.5 rounded-md border px-2 py-1.5 text-left text-[11.5px]',
                state === 'done' && 'border-transparent bg-green-bg text-green-ink',
                state === 'current' && 'border-accent bg-accent text-on-accent',
                state === 'todo' && 'border-border bg-surface text-ink hover:border-accent',
              )}
            >
              <span className="flex items-center gap-1 font-semibold">
                {state === 'done' && <Check className="size-3" aria-hidden="true" />}
                {i}
              </span>
              <span>{name}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
