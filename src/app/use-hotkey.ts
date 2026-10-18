import { useEffect, useLayoutEffect, useRef } from 'react'
import { matchesHotkey } from '@/lib/hotkeys'

/**
 * Gắn một phím tắt toàn app. `handler` luôn dùng bản mới nhất, không cần useCallback.
 * Mặc định phím tắt của trang KHÔNG chạy khi đang mở hộp thoại (để Ctrl+Enter / Ctrl+S
 * chỉ tác động lên hộp thoại). Phím tắt của chính hộp thoại thì đặt `inDialog: true`.
 */
export function useHotkey(
  combo: string,
  handler: (event: KeyboardEvent) => void,
  { inDialog = false }: { inDialog?: boolean } = {},
) {
  const handlerRef = useRef(handler)
  useLayoutEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!matchesHotkey(event, combo)) return
      event.preventDefault()
      if (!inDialog && document.querySelector('[role="dialog"]')) return
      handlerRef.current(event)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [combo, inDialog])
}
