import { Check } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ShowToast } from './toast-context'

/** Thông báo nhỏ hiện ở cuối màn hình rồi tự ẩn sau 2 giây. Dùng qua hook `useToast()`. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const show = useCallback<ShowToast>((msg) => {
    setMessage(msg)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(null), 2000)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <ToastContext value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4"
      >
        {message && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-lg bg-[#16211f] px-4 py-2.5 text-white shadow-lg"
          >
            <Check className="size-4 text-[#7fe0c9]" aria-hidden="true" />
            {message}
          </div>
        )}
      </div>
    </ToastContext>
  )
}
