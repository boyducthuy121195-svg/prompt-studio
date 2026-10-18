import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Ô tích có khung, tô màu khi được chọn. `detail` là câu đầy đủ hiện dưới nhãn. */
export function CheckOption({
  checked,
  onChange,
  label,
  detail,
  className,
}: {
  checked: boolean
  onChange: () => void
  label: ReactNode
  detail?: ReactNode
  className?: string
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-2 rounded-md border bg-surface px-2.5 py-1.5 text-[12.5px] leading-snug hover:border-accent-line',
        checked ? 'border-accent-line bg-accent-weak' : 'border-border',
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 size-[15px] shrink-0 accent-accent"
      />
      <span>
        <span className="font-semibold">{label}</span>
        {detail && <span className="mt-0.5 block text-muted">{detail}</span>}
      </span>
    </label>
  )
}
