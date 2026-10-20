import { AIError, toAIError } from './errors'
import { withRetry } from './retry'

const signal = () => new AbortController().signal

describe('withRetry – Gemini tự thử lại khi bận', () => {
  it('lỗi tạm thời thì thử lại rồi thành công', async () => {
    const run = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new AIError('server', 'gemini'))
      .mockRejectedValueOnce(new AIError('rate_limit', 'gemini'))
      .mockResolvedValue('ok')
    expect(await withRetry(run, signal(), [0, 0])).toBe('ok')
    expect(run).toHaveBeenCalledTimes(3)
  })

  it('thử tối đa 2 lần rồi báo lỗi', async () => {
    const run = vi.fn(() => Promise.reject(new AIError('server', 'gemini')))
    await expect(withRetry(run, signal(), [0, 0])).rejects.toThrow('Dịch vụ AI đang bận')
    expect(run).toHaveBeenCalledTimes(3)
  })

  it('hết hạn mức ngày, key sai: không thử lại', async () => {
    for (const code of ['quota', 'invalid_key', 'bad_json'] as const) {
      const run = vi.fn(() => Promise.reject(new AIError(code, 'gemini')))
      await expect(withRetry(run, signal(), [0, 0])).rejects.toBeInstanceOf(AIError)
      expect(run).toHaveBeenCalledOnce()
    }
  })

  it('bấm Dừng trong lúc chờ thì dừng ngay', async () => {
    const ctrl = new AbortController()
    const run = vi.fn(() => Promise.reject(new AIError('server', 'gemini')))
    const p = withRetry(run, ctrl.signal, [60_000])
    await Promise.resolve()
    ctrl.abort()
    await expect(p).rejects.toThrow('Đã dừng')
    expect(run).toHaveBeenCalledOnce()
  })
})

describe('hết hạn mức trong ngày', () => {
  it('nhận ra lỗi 429 theo ngày và nói rõ cần làm gì', () => {
    const daily = toAIError(
      { status: 429, message: 'Quota exceeded for metric: ...requests_per_day, limit: 250' },
      'gemini',
    )
    expect(daily.code).toBe('quota')
    expect(daily.message).toMatch(/hết hạn mức dùng Gemini trong ngày.*Cài đặt/)
    expect(toAIError({ status: 429, message: 'Too many requests' }, 'gemini').code).toBe(
      'rate_limit',
    )
  })
})
