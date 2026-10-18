import type { ZodType } from 'zod'
import { AIError } from './errors'
import type { AIProvider, AIRequest, ProviderId } from './types'

/** Nhà cung cấp giả dùng trong test – KHÔNG gọi API thật (AGENTS.md mục 6). */
export interface MockScript {
  text?: string
  json?: unknown
  error?: AIError
  models?: string[]
}

export function createMockProvider(
  script: MockScript = {},
  id: ProviderId = 'claude',
): AIProvider & { calls: AIRequest[] } {
  const calls: AIRequest[] = []
  return {
    id,
    model: 'mock-model',
    calls,
    async testKey() {
      if (script.error) throw script.error
      return script.models ?? ['mock-model']
    },
    async *streamText(req, signal) {
      calls.push(req)
      if (script.error) throw script.error
      for (const word of (script.text ?? '').split(/(?<= )/)) {
        if (signal.aborted) throw new AIError('aborted', id)
        await Promise.resolve()
        yield word
      }
    },
    async generateJson<T>(req: AIRequest, schema: ZodType<T>): Promise<T> {
      calls.push(req)
      if (script.error) throw script.error
      const parsed = schema.safeParse(script.json)
      if (!parsed.success) throw new AIError('bad_json', id)
      return parsed.data
    },
  }
}
