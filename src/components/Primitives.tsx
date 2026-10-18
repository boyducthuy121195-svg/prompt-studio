import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface text-ink hover:bg-hover',
        primary:
          'border-accent bg-accent text-on-accent hover:border-accent-hover hover:bg-accent-hover',
        ai: 'border-ai-line bg-ai-bg text-ai-ink hover:brightness-95',
        ghost: 'border-transparent bg-transparent text-ink hover:bg-hover',
        danger: 'border-border bg-surface text-red-ink hover:bg-hover',
        dangerSolid: 'border-red-ink bg-red-ink text-surface hover:brightness-110',
      },
      size: {
        default: 'h-9 px-3 text-[13px]',
        sm: 'h-7 px-2.5 text-xs',
        icon: 'size-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export function Button({
  className,
  variant,
  size,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
}

const tagVariants = cva(
  'inline-flex h-5 items-center whitespace-nowrap rounded border px-1.5 text-[11.5px] font-medium',
  {
    variants: {
      tone: {
        default: 'border-border bg-soft text-muted',
        accent: 'border-accent-line bg-accent-weak text-accent-ink',
        warn: 'border-warn-line bg-warn-bg text-warn-ink',
      },
    },
    defaultVariants: { tone: 'default' },
  },
)

export function Tag({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof tagVariants>) {
  return <span className={cn(tagVariants({ tone }), className)} {...props} />
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-[18px] items-center rounded border border-b-2 border-border bg-soft px-1 font-mono text-[10.5px] text-muted',
        className,
      )}
    >
      {children}
    </kbd>
  )
}

export function Panel({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn('rounded-lg border border-border bg-surface', className)} {...props} />
  )
}

export function PanelHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 border-b border-border px-3.5 py-2.5',
        className,
      )}
      {...props}
    />
  )
}

export function PageHeader({
  title,
  desc,
  aside,
}: {
  title: string
  desc?: string
  aside?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="min-w-0 flex-[1_1_300px]">
        <h1 className="text-[19px] font-bold tracking-tight">{title}</h1>
        {desc && <p className="mt-0.5 text-muted">{desc}</p>}
      </div>
      {aside}
    </div>
  )
}
