import type { Settings } from '@/types/models'
import { AIError } from './errors'
import type { AIProvider, ProviderId } from './types'

type Factory = (s: Settings, id: ProviderId) => AIProvider | Promise<AIProvider>

// SDK của Claude / Gemini khá nặng nên chỉ tải khi người dùng bấm nút AI lần đầu
const realFactory: Factory = async (s, id) =>
  id === 'claude'
    ? (await import('./claude')).createClaudeProvider(s.claudeKey, s.claudeModel)
    : (await import('./gemini')).createGeminiProvider(s.geminiKey, s.geminiModel)

let factory: Factory = realFactory

/** Chỉ dùng trong test: thay nhà cung cấp thật bằng bản giả. */
export function setProviderFactory(f: Factory | null): void {
  factory = f ?? realFactory
}

export function hasKey(s: Settings, id: ProviderId = s.defaultProvider): boolean {
  return (id === 'claude' ? s.claudeKey : s.geminiKey).trim() !== ''
}

/** Nhà cung cấp AI đang dùng theo Cài đặt. Báo lỗi tiếng Việt nếu chưa có key. */
export async function getProvider(
  s: Settings,
  id: ProviderId = s.defaultProvider,
): Promise<AIProvider> {
  if (!hasKey(s, id)) throw new AIError('no_key', id)
  return factory(s, id)
}

/** Nhãn trên header, ví dụ "AI: Claude · opus-5-5". */
export function aiLabel(s: Settings): string | null {
  if (!hasKey(s)) return null
  if (s.defaultProvider === 'claude') return `Claude · ${s.claudeModel.replace(/^claude-/, '')}`
  return `Gemini · ${s.geminiModel.replace(/^gemini-/, '') || 'chưa chọn model'}`
}
