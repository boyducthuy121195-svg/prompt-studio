import { useEffect, useLayoutEffect, useRef } from 'react'
import { matchesHotkey } from '@/lib/hotkeys'

/** Gắn một phím tắt toàn app. `handler` luôn dùng bản mới nhất, không cần useCallback. */
export function useHotkey(combo: string, handler: (event: KeyboardEvent) => void) {
  const handlerRef = useRef(handler)
  useLayoutEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (matchesHotkey(event, combo)) {
        event.preventDefault()
        handlerRef.current(event)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [combo])
}
