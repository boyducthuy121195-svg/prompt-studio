import { useCallback, useEffect, useRef, useState } from 'react'
import { getProvider } from '@/lib/ai'
import { toAIError, type AIError } from '@/lib/ai/errors'
import type { AIProvider } from '@/lib/ai/types'
import { getSettings } from '@/lib/db/settings'

export type AITaskState<T> =
  | { status: 'idle' }
  | { status: 'running'; text: string }
  | { status: 'done'; text: string; data?: T }
  | { status: 'error'; text: string; error: AIError }

type Job<T> =
  | { kind: 'stream'; run: (p: AIProvider, signal: AbortSignal) => AsyncIterable<string> }
  | { kind: 'json'; run: (p: AIProvider, signal: AbortSignal) => Promise<T> }

/**
 * Chạy một tác vụ AI khi người dùng bấm nút: chữ hiện dần (stream) hoặc JSON, có Dừng và Thử lại.
 * Chỉ gọi AI qua `start()` – không bao giờ tự chạy (AGENTS.md mục 6).
 */
export function useAITask<T = never>() {
  const [state, setState] = useState<AITaskState<T>>({ status: 'idle' })
  const ctrl = useRef<AbortController | null>(null)
  const lastJob = useRef<Job<T> | null>(null)

  const start = useCallback(async (job: Job<T>) => {
    ctrl.current?.abort()
    const c = new AbortController()
    ctrl.current = c
    lastJob.current = job
    setState({ status: 'running', text: '' })
    let text = ''
    let provider: AIProvider | undefined
    try {
      const settings = await getSettings()
      provider = getProvider(settings)
      if (job.kind === 'stream') {
        for await (const part of job.run(provider, c.signal)) {
          text += part
          setState({ status: 'running', text })
        }
        setState({ status: 'done', text })
      } else {
        const data = await job.run(provider, c.signal)
        setState({ status: 'done', text, data })
      }
    } catch (err) {
      const error = toAIError(err, provider?.id ?? (await getSettings()).defaultProvider)
      setState({ status: 'error', text, error })
    }
  }, [])

  const stop = useCallback(() => ctrl.current?.abort(), [])
  const retry = useCallback(() => {
    if (lastJob.current) void start(lastJob.current)
  }, [start])
  const reset = useCallback(() => {
    ctrl.current?.abort()
    setState({ status: 'idle' })
  }, [])

  useEffect(() => () => ctrl.current?.abort(), [])

  return { state, start, stop, retry, reset }
}
