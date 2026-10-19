import { GoogleGenAI } from '@google/genai'
import { z, type ZodType } from 'zod'
import { AIError, toAIError } from './errors'
import { RETRY_DELAYS_MS, withRetry } from './retry'
import type { AIProvider, AIRequest } from './types'

/** `retryDelays`: chờ bao lâu trước mỗi lần thử lại khi Gemini bận (test truyền [0, 0]). */
export function createGeminiProvider(
  apiKey: string,
  model: string,
  retryDelays: readonly number[] = RETRY_DELAYS_MS,
): AIProvider {
  const ai = new GoogleGenAI({ apiKey })
  /** Gemini bản miễn phí hay báo quá tải: tự thử lại vài lần trước khi báo lỗi. */
  const call = <T>(run: () => Promise<T>, signal: AbortSignal) =>
    withRetry(
      () =>
        run().catch((err: unknown) => {
          throw toAIError(err, 'gemini')
        }),
      signal,
      retryDelays,
    )

  return {
    id: 'gemini',
    model,

    async testKey(signal) {
      try {
        const pager = await ai.models.list({ config: { abortSignal: signal } })
        const ids: string[] = []
        for await (const m of pager) {
          if (m.name && (m.supportedActions ?? ['generateContent']).includes('generateContent')) {
            ids.push(m.name.replace(/^models\//, ''))
          }
        }
        return ids
      } catch (err) {
        throw toAIError(err, 'gemini')
      }
    },

    async *streamText(req: AIRequest, signal: AbortSignal) {
      if (!model) throw new AIError('bad_request', 'gemini', 'chưa chọn model')
      try {
        // Chỉ thử lại lúc bắt đầu; chữ đã hiện ra rồi thì không gửi lại từ đầu
        const stream = await call(
          () =>
            ai.models.generateContentStream({
              model,
              contents: req.prompt,
              config: {
                systemInstruction: req.system,
                abortSignal: signal,
                maxOutputTokens: req.maxTokens,
              },
            }),
          signal,
        )
        for await (const chunk of stream) {
          if (signal.aborted) throw new AIError('aborted', 'gemini')
          const text = chunk.text
          if (text) yield text
        }
      } catch (err) {
        throw toAIError(err, 'gemini')
      }
    },

    async generateJson<T>(req: AIRequest, schema: ZodType<T>, signal: AbortSignal): Promise<T> {
      if (!model) throw new AIError('bad_request', 'gemini', 'chưa chọn model')
      const res = await call(
        () =>
          ai.models.generateContent({
            model,
            contents: req.prompt,
            config: {
              systemInstruction: req.system,
              abortSignal: signal,
              responseMimeType: 'application/json',
              responseJsonSchema: z.toJSONSchema(schema),
            },
          }),
        signal,
      )
      let data: unknown
      try {
        data = JSON.parse(res.text ?? '')
      } catch {
        throw new AIError('bad_json', 'gemini')
      }
      const parsed = schema.safeParse(data)
      if (!parsed.success) throw new AIError('bad_json', 'gemini')
      return parsed.data
    },
  }
}
