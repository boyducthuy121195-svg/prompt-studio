import { z } from 'zod'

const anthropic = vi.hoisted(() => ({
  ctorOpts: undefined as unknown,
  streamParams: undefined as Record<string, unknown> | undefined,
  parseParams: undefined as Record<string, unknown> | undefined,
  stopReason: 'end_turn',
}))

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    constructor(opts: unknown) {
      anthropic.ctorOpts = opts
    }
    models = {
      list: () => ({
        async *[Symbol.asyncIterator]() {
          yield { id: 'claude-opus-5-5' }
          yield { id: 'claude-haiku-5-5' }
        },
      }),
    }
    beta = {
      messages: {
        stream: (params: Record<string, unknown>) => {
          anthropic.streamParams = params
          return {
            async *[Symbol.asyncIterator]() {
              yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Xin ' } }
              yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'chào' } }
            },
            finalMessage: async () => ({ stop_reason: anthropic.stopReason }),
          }
        },
        parse: async (params: Record<string, unknown>) => {
          anthropic.parseParams = params
          return { stop_reason: anthropic.stopReason, parsed_output: { ok: true } }
        },
      },
    }
  },
}))

const gemini = vi.hoisted(() => ({
  config: undefined as Record<string, unknown> | undefined,
  /** Số lần đầu tiên trả lỗi 503 (giả lập Gemini quá tải). */
  failTimes: 0,
  calls: 0,
}))

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = {
      list: async () => ({
        async *[Symbol.asyncIterator]() {
          yield { name: 'models/gemini-3.8-flash', supportedActions: ['generateContent'] }
          yield { name: 'models/text-embedding', supportedActions: ['embedContent'] }
        },
      }),
      generateContentStream: async () => ({
        async *[Symbol.asyncIterator]() {
          yield { text: 'Gemini ' }
          yield { text: 'trả lời' }
        },
      }),
      generateContent: async (p: { config: Record<string, unknown> }) => {
        gemini.calls++
        if (gemini.calls <= gemini.failTimes)
          throw Object.assign(new Error('The model is overloaded'), { status: 503 })
        gemini.config = p.config
        return { text: '{"ok":true}' }
      },
    }
  },
}))

const { createClaudeProvider } = await import('./claude')
const { createGeminiProvider } = await import('./gemini')

const req = { system: 'sys', prompt: 'hỏi', effort: 'low' as const }
const collect = async (it: AsyncIterable<string>) => {
  let s = ''
  for await (const p of it) s += p
  return s
}

describe('Claude adapter', () => {
  beforeEach(() => (anthropic.stopReason = 'end_turn'))

  it('cho phép chạy trong trình duyệt, bật dự phòng khi bị từ chối, gửi đúng effort', async () => {
    const p = createClaudeProvider('sk-ant-test', 'claude-opus-5-5')
    expect(anthropic.ctorOpts).toMatchObject({
      apiKey: 'sk-ant-test',
      dangerouslyAllowBrowser: true,
    })
    expect(await collect(p.streamText(req, new AbortController().signal))).toBe('Xin chào')
    expect(anthropic.streamParams).toMatchObject({
      model: 'claude-opus-5-5',
      system: 'sys',
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low' },
    })
    expect(anthropic.streamParams).not.toHaveProperty('thinking')
  })

  it('JSON có cấu trúc qua output_config.format; bị từ chối thì báo lỗi tiếng Việt', async () => {
    const p = createClaudeProvider('k', 'claude-opus-5-5')
    expect(
      await p.generateJson(req, z.object({ ok: z.boolean() }), new AbortController().signal),
    ).toEqual({ ok: true })
    expect(anthropic.parseParams?.output_config).toHaveProperty('format')
    anthropic.stopReason = 'refusal'
    await expect(collect(p.streamText(req, new AbortController().signal))).rejects.toThrow(
      'AI từ chối yêu cầu này',
    )
  })

  it('kiểm tra key trả danh sách model', async () => {
    expect(await createClaudeProvider('k', 'x').testKey()).toEqual([
      'claude-opus-5-5',
      'claude-haiku-5-5',
    ])
  })
})

describe('Gemini adapter', () => {
  it('lấy danh sách model tạo nội dung, bỏ tiền tố models/', async () => {
    expect(await createGeminiProvider('k', '').testKey()).toEqual(['gemini-3.8-flash'])
  })

  it('stream chữ và trả JSON theo schema', async () => {
    const p = createGeminiProvider('k', 'gemini-3.8-flash')
    expect(await collect(p.streamText(req, new AbortController().signal))).toBe('Gemini trả lời')
    expect(
      await p.generateJson(req, z.object({ ok: z.boolean() }), new AbortController().signal),
    ).toEqual({ ok: true })
    expect(gemini.config).toMatchObject({
      responseMimeType: 'application/json',
      systemInstruction: 'sys',
    })
    expect(gemini.config?.responseJsonSchema).toMatchObject({ type: 'object' })
  })

  it('quá tải (503) thì tự thử lại; vẫn bận sau 2 lần thì báo lỗi tiếng Việt', async () => {
    const schema = z.object({ ok: z.boolean() })
    Object.assign(gemini, { failTimes: 2, calls: 0 })
    const p = createGeminiProvider('k', 'gemini-3.8-flash', [0, 0])
    expect(await p.generateJson(req, schema, new AbortController().signal)).toEqual({ ok: true })
    expect(gemini.calls).toBe(3)

    Object.assign(gemini, { failTimes: 5, calls: 0 })
    await expect(p.generateJson(req, schema, new AbortController().signal)).rejects.toThrow(
      'Dịch vụ AI đang bận',
    )
    expect(gemini.calls).toBe(3)
    Object.assign(gemini, { failTimes: 0, calls: 0 })
  })

  it('chưa chọn model thì báo lỗi rõ ràng', async () => {
    const p = createGeminiProvider('k', '')
    await expect(p.generateJson(req, z.object({}), new AbortController().signal)).rejects.toThrow(
      'chưa chọn model',
    )
  })
})
