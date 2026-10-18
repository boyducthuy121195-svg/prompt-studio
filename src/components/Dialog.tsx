import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { vi } from '@/lib/i18n/vi'
import { cn } from '@/lib/utils'

/** Hộp thoại dùng chung (Radix): có Esc để đóng, khóa focus bên trong, đọc được bằng trình đọc màn hình. */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  wide = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-20 bg-[rgba(14,22,20,.5)] dark:bg-black/60" />
        <RadixDialog.Content
          {...(description ? {} : { 'aria-describedby': undefined })}
          className={cn(
            'fixed left-1/2 top-[12vh] z-20 flex max-h-[80vh] w-[calc(100%-32px)] -translate-x-1/2 flex-col rounded-[10px] border border-border bg-surface text-ink shadow-xl',
            wide ? 'max-w-[880px]' : 'max-w-[520px]',
          )}
        >
          <div className="flex items-start gap-3 border-b border-border px-[18px] py-3">
            <div className="min-w-0 flex-1">
              <RadixDialog.Title className="text-base font-semibold">{title}</RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="mt-0.5 text-muted">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close
              aria-label={vi.common.close}
              className="flex size-7 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
            >
              <X className="size-4" aria-hidden="true" />
            </RadixDialog.Close>
          </div>
          {children && <div className="overflow-y-auto px-[18px] py-4">{children}</div>}
          {footer && (
            <div
              className={cn(
                'flex flex-wrap justify-end gap-1.5 px-[18px] pb-4',
                !children && 'pt-4',
              )}
            >
              {footer}
            </div>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
