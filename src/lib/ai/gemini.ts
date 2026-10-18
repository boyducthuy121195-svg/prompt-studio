import { GoogleGenAI } from '@google/genai'
import { z, type ZodType } from 'zod'
import { AIError, toAIError } from './errors'
import type { AIProvider, AIRequest } from './types'

export function createGeminiProvider(apiKey: string, model: string): AIProvider {
  const ai = new GoogleGenAI({ apiKey })

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
        const stream = await ai.models.generateContentStream({
          model,
          contents: req.prompt,
          config: {
            systemInstruction: req.system,
            abortSignal: signal,
            maxOutputTokens: req.maxTokens,
          },
        })
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
      let raw: string | undefined
      try {
        const res = await ai.models.generateContent({
          model,
          contents: req.prompt,
          config: {
            systemInstruction: req.system,
            abortSignal: signal,
            responseMimeType: 'application/json',
            responseJsonSchema: z.toJSONSchema(schema),
          },
        })
        raw = res.text
      } catch (err) {
        throw toAIError(err, 'gemini')
      }
      let data: unknown
      try {
        data = JSON.parse(raw ?? '')
      } catch {
        throw new AIError('bad_json', 'gemini')
      }
      const parsed = schema.safeParse(data)
      if (!parsed.success) throw new AIError('bad_json', 'gemini')
      return parsed.data
    },
  }
}
