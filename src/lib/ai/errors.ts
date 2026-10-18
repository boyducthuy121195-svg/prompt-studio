import type { ProviderId } from './types'

export type AIErrorCode =
  | 'no_key'
  | 'invalid_key'
  | 'rate_limit'
  | 'server'
  | 'network'
  | 'refusal'
  | 'bad_json'
  | 'bad_request'
  | 'aborted'
  | 'unknown'

const NAME: Record<ProviderId, string> = { claude: 'Claude', gemini: 'Gemini' }

/** Thông báo lỗi tiếng Việt: chuyện gì xảy ra + cần làm gì (ARCHITECTURE.md mục 6.5). */
export function aiErrorMessage(code: AIErrorCode, provider: ProviderId, detail = ''): string {
  const n = NAME[provider]
  switch (code) {
    case 'no_key':
      return `Bạn chưa nhập API key ${n}. Vào Cài đặt để nhập.`
    case 'invalid_key':
      return `API key ${n} không hợp lệ. Vào Cài đặt để kiểm tra lại.`
    case 'rate_limit':
      return 'Bạn đang gửi quá nhanh hoặc hết hạn mức. Đợi một chút rồi thử lại.'
    case 'server':
      return 'Dịch vụ AI đang bận. Thử lại sau ít phút.'
    case 'network':
      return 'Không kết nối được Internet. Kiểm tra mạng rồi thử lại.'
    case 'refusal':
      return 'AI từ chối yêu cầu này. Thử diễn đạt lại nội dung.'
    case 'bad_json':
      return 'AI trả về kết quả không đúng định dạng. Bấm Thử lại.'
    case 'bad_request':
      return `${n} không nhận yêu cầu này${detail ? `: ${detail}` : ''}. Kiểm tra model trong Cài đặt.`
    case 'aborted':
      return 'Đã dừng.'
    default:
      return `Có lỗi không mong muốn${detail ? `: ${detail}` : ''}. Thử lại.`
  }
}

export class AIError extends Error {
  readonly code: AIErrorCode
  readonly provider: ProviderId
  constructor(code: AIErrorCode, provider: ProviderId, detail = '') {
    super(aiErrorMessage(code, provider, detail))
    this.name = 'AIError'
    this.code = code
    this.provider = provider
  }
}

/** Đổi lỗi bất kỳ của SDK/mạng thành AIError có thông báo tiếng Việt. */
export function toAIError(err: unknown, provider: ProviderId): AIError {
  if (err instanceof AIError) return err
  const e = err as { name?: string; status?: number; message?: string; cause?: unknown }
  const message = typeof e?.message === 'string' ? e.message : String(err)
  if (e?.name === 'AbortError' || e?.name === 'APIUserAbortError' || /abort/i.test(message)) {
    return new AIError('aborted', provider)
  }
  const status = typeof e?.status === 'number' ? e.status : undefined
  if (
    status === 401 ||
    status === 403 ||
    /api[ _-]?key (not valid|invalid)|invalid x-api-key/i.test(message)
  ) {
    return new AIError('invalid_key', provider)
  }
  if (status === 429) return new AIError('rate_limit', provider)
  if (status !== undefined && status >= 500) return new AIError('server', provider)
  if (status === 400 || status === 404)
    return new AIError('bad_request', provider, shorten(message))
  if (
    e?.name === 'APIConnectionError' ||
    e?.name === 'TypeError' ||
    /network|fetch|connection/i.test(message)
  ) {
    return new AIError('network', provider)
  }
  return new AIError('unknown', provider, shorten(message))
}

function shorten(s: string): string {
  const one = s.replace(/\s+/g, ' ').trim()
  return one.length > 140 ? one.slice(0, 137) + '…' : one
}
