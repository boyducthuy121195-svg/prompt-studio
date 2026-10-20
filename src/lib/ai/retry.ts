import { AIError } from './errors'

/** Chờ trước lần thử lại thứ 1, thứ 2 (ms). */
export const RETRY_DELAYS_MS = [1000, 2000] as const

/** Lỗi tạm thời (máy chủ bận, gửi quá nhanh) thì đáng thử lại; hết hạn mức ngày, key sai… thì không. */
const isTransient = (err: unknown) =>
  err instanceof AIError && (err.code === 'server' || err.code === 'rate_limit')

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new AIError('aborted', 'gemini'))
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(new AIError('aborted', 'gemini'))
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * Chạy `run`; gặp lỗi tạm thời thì chờ rồi thử lại (mặc định tối đa 2 lần: sau 1 giây, rồi 2 giây).
 * Bấm "Dừng" trong lúc chờ thì dừng ngay. `run` phải ném AIError (đã qua `toAIError`).
 */
export async function withRetry<T>(
  run: () => Promise<T>,
  signal: AbortSignal,
  delays: readonly number[] = RETRY_DELAYS_MS,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await run()
    } catch (err) {
      if (!isTransient(err) || attempt >= delays.length || signal.aborted) throw err
      await wait(delays[attempt], signal)
    }
  }
}
