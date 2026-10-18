import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const inputClass =
  'w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] text-ink placeholder:text-muted focus:outline-2 focus:outline-accent focus:-outline-offset-1'

export function TextField({
  id,
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { id: string; label: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold">
        {label}
      </label>
      <input id={id} className={cn(inputClass, 'h-9')} {...props} />
    </div>
  )
}

export function TextAreaField({
  id,
  label,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; label: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold">
        {label}
      </label>
      <textarea id={id} className={cn(inputClass, 'min-h-16 resize-y leading-normal')} {...props} />
    </div>
  )
}
