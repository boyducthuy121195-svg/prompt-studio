import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import type { ZodType } from 'zod'
import { AIError, toAIError } from './errors'
import type { AIProvider, AIRequest } from './types'

/**
 * Dự phòng khi bộ lọc an toàn từ chối nhầm: Anthropic tự chạy lại trên model dự phòng
 * (ARCHITECTURE.md mục 6.3). Dạng 'default' đi với header -2026-07-01.
 */
const FALLBACK_BETA = 'server-side-fallback-2026-07-01'

export function createClaudeProvider(apiKey: string, model: string): AIProvider {
  // App cá nhân, key do người dùng tự nhập – được phép gọi thẳng từ trình duyệt (AGENTS.md mục 6)
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2 })

  const base = (req: AIRequest) => ({
    model,
    max_tokens: req.maxTokens ?? 16000,
    system: req.system,
    messages: [{ role: 'user' as const, content: req.prompt }],
    betas: [FALLBACK_BETA],
    fallbacks: 'default' as const,
  })

  return {
    id: 'claude',
    model,

    async testKey(signal) {
      try {
        const ids: string[] = []
        for await (const m of client.models.list({}, { signal })) ids.push(m.id)
        return ids
      } catch (err) {
        throw toAIError(err, 'claude')
      }
    },

    async *streamText(req, signal) {
      try {
        const stream = client.beta.messages.stream(
          { ...base(req), output_config: { effort: req.effort } },
          { signal },
        )
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            yield event.delta.text
          }
        }
        const final = await stream.finalMessage()
        if (final.stop_reason === 'refusal') throw new AIError('refusal', 'claude')
      } catch (err) {
        throw toAIError(err, 'claude')
      }
    },

    async generateJson<T>(req: AIRequest, schema: ZodType<T>, signal: AbortSignal): Promise<T> {
      try {
        const res = await client.beta.messages.parse(
          {
            ...base(req),
            output_config: { effort: req.effort, format: betaZodOutputFormat(schema) },
          },
          { signal },
        )
        if (res.stop_reason === 'refusal') throw new AIError('refusal', 'claude')
        if (res.parsed_output == null) throw new AIError('bad_json', 'claude')
        return res.parsed_output as T
      } catch (err) {
        throw toAIError(err, 'claude')
      }
    },
  }
}
