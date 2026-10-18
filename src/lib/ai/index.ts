import type { Settings } from '@/types/models'
import { createClaudeProvider } from './claude'
import { AIError } from './errors'
import { createGeminiProvider } from './gemini'
import type { AIProvider, ProviderId } from './types'

type Factory = (s: Settings, id: ProviderId) => AIProvider

const realFactory: Factory = (s, id) =>
  id === 'claude'
    ? createClaudeProvider(s.claudeKey, s.claudeModel)
    : createGeminiProvider(s.geminiKey, s.geminiModel)

let factory: Factory = realFactory

/** Chỉ dùng trong test: thay nhà cung cấp thật bằng bản giả. */
export function setProviderFactory(f: Factory | null): void {
  factory = f ?? realFactory
}

export function hasKey(s: Settings, id: ProviderId = s.defaultProvider): boolean {
  return (id === 'claude' ? s.claudeKey : s.geminiKey).trim() !== ''
}

/** Nhà cung cấp AI đang dùng theo Cài đặt. Báo lỗi tiếng Việt nếu chưa có key. */
export function getProvider(s: Settings, id: ProviderId = s.defaultProvider): AIProvider {
  if (!hasKey(s, id)) throw new AIError('no_key', id)
  return factory(s, id)
}

/** Nhãn trên header, ví dụ "AI: Claude · opus-5-5". */
export function aiLabel(s: Settings): string | null {
  if (!hasKey(s)) return null
  if (s.defaultProvider === 'claude') return `Claude · ${s.claudeModel.replace(/^claude-/, '')}`
  return `Gemini · ${s.geminiModel.replace(/^gemini-/, '') || 'chưa chọn model'}`
}
