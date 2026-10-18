import { liveQuery } from 'dexie'
import { useEffect, useState, type DependencyList } from 'react'

export type LiveResult<T> =
  { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error'; error: Error }

/**
 * Đọc dữ liệu từ IndexedDB và tự cập nhật mỗi khi dữ liệu liên quan thay đổi
 * (kể cả thay đổi từ tab khác của cùng trình duyệt).
 */
export function useLiveQuery<T>(querier: () => Promise<T>, deps: DependencyList): LiveResult<T> {
  const [result, setResult] = useState<LiveResult<T>>({ status: 'loading' })

  useEffect(() => {
    const subscription = liveQuery(querier).subscribe({
      next: (data) => setResult({ status: 'ready', data }),
      error: (error: unknown) =>
        setResult({
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        }),
    })
    return () => subscription.unsubscribe()
    // querier được tạo lại mỗi lần render; deps do nơi gọi khai báo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return result
}
