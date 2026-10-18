import type { ZodType } from 'zod'

export type ProviderId = 'claude' | 'gemini'

/** Mức "suy nghĩ" của AI – ARCHITECTURE.md mục 6.2 */
export type Effort = 'low' | 'medium' | 'high'

export interface AIRequest {
  system: string
  prompt: string
  effort: Effort
  maxTokens?: number
}

/** "Ổ cắm" chung cho mọi nhà cung cấp AI. Giao diện chỉ làm việc với interface này. */
export interface AIProvider {
  id: ProviderId
  model: string
  /** Kiểm tra key, trả về danh sách model dùng được */
  testKey(signal?: AbortSignal): Promise<string[]>
  /** Trả chữ theo từng đoạn (streaming); dừng bằng AbortSignal */
  streamText(req: AIRequest, signal: AbortSignal): AsyncIterable<string>
  /** Trả JSON đúng schema */
  generateJson<T>(req: AIRequest, schema: ZodType<T>, signal: AbortSignal): Promise<T>
}
