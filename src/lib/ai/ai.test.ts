import { DEFAULT_SETTINGS } from '@/lib/db/settings'
import { AIError, toAIError } from './errors'
import { aiLabel, getProvider, hasKey, setProviderFactory } from './index'
import { createMockProvider } from './mock'
import { pickGeminiModel } from './models'
import { z } from 'zod'

describe('chọn model Gemini', () => {
  it('ưu tiên Gemini 3.8 Flash', () => {
    expect(
      pickGeminiModel(['gemini-2.5-pro', 'gemini-3.8-flash', 'gemini-3.8-flash-lite']),
    ).toEqual({
      id: 'gemini-3.8-flash',
      exact: true,
    })
  })

  it('không có 3.8 Flash thì chọn Flash ổn định mới nhất và báo exact = false', () => {
    expect(
      pickGeminiModel([
        'gemini-2.5-flash',
        'gemini-3.1-flash',
        'gemini-3.5-flash-preview',
        'gemini-3.5-pro',
      ]),
    ).toEqual({
      id: 'gemini-3.1-flash',
      exact: false,
    })
    expect(pickGeminiModel([])).toBeNull()
  })
})

describe('lỗi AI', () => {
  it('đổi mã HTTP thành thông báo tiếng Việt', () => {
    expect(toAIError({ status: 401, message: 'x' }, 'claude').message).toBe(
      'API key Claude không hợp lệ. Vào Cài đặt để kiểm tra lại.',
    )
    expect(
      toAIError(
        { status: 400, message: 'API key not valid. Please pass a valid API key.' },
        'gemini',
      ).code,
    ).toBe('invalid_key')
    expect(toAIError({ status: 429 }, 'claude').code).toBe('rate_limit')
    expect(toAIError({ status: 529 }, 'claude').code).toBe('server')
    expect(toAIError(new TypeError('Failed to fetch'), 'gemini').code).toBe('network')
    expect(toAIError({ name: 'AbortError', message: 'aborted' }, 'claude').code).toBe('aborted')
    const original = new AIError('refusal', 'claude')
    expect(toAIError(original, 'claude')).toBe(original)
  })
})

describe('chọn nhà cung cấp', () => {
  afterEach(() => setProviderFactory(null))

  it('chưa có key thì báo lỗi no_key', async () => {
    expect(hasKey(DEFAULT_SETTINGS)).toBe(false)
    await expect(getProvider(DEFAULT_SETTINGS)).rejects.toThrow(
      'Bạn chưa nhập API key Claude. Vào Cài đặt để nhập.',
    )
    expect(aiLabel(DEFAULT_SETTINGS)).toBeNull()
  })

  it('có key thì dùng nhà cung cấp theo Cài đặt; nhãn header gọn', async () => {
    const mock = createMockProvider({ json: { ok: true } })
    setProviderFactory(() => mock)
    const s = { ...DEFAULT_SETTINGS, claudeKey: 'sk-ant-x' }
    expect(await getProvider(s)).toBe(mock)
    expect(aiLabel(s)).toBe('Claude · opus-5-5')
    expect(
      aiLabel({ ...s, defaultProvider: 'gemini', geminiKey: 'g', geminiModel: 'gemini-3.8-flash' }),
    ).toBe('Gemini · 3.8-flash')
  })

  it('bản giả trả chữ theo từng đoạn và JSON đúng schema', async () => {
    const mock = createMockProvider({ text: 'xin chào bạn', json: { n: 1 } })
    const parts: string[] = []
    const ctrl = new AbortController()
    for await (const p of mock.streamText({ system: '', prompt: 'hi', effort: 'low' }, ctrl.signal))
      parts.push(p)
    expect(parts.join('')).toBe('xin chào bạn')
    expect(
      await mock.generateJson(
        { system: '', prompt: '', effort: 'low' },
        z.object({ n: z.number() }),
        ctrl.signal,
      ),
    ).toEqual({ n: 1 })
    await expect(
      mock.generateJson(
        { system: '', prompt: '', effort: 'low' },
        z.object({ m: z.string() }),
        ctrl.signal,
      ),
    ).rejects.toMatchObject({ code: 'bad_json' })
  })
})
