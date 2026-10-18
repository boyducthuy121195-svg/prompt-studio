import { copyText } from './clipboard'

describe('copyText', () => {
  it('dùng Clipboard API khi có', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    expect(await copyText('xin chào')).toBe(true)
    expect(writeText).toHaveBeenCalledWith('xin chào')
    vi.unstubAllGlobals()
  })

  it('trả về false khi mọi cách đều bị chặn', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: () => Promise.reject(new Error('no')) } })
    document.execCommand = () => false
    expect(await copyText('x')).toBe(false)
    vi.unstubAllGlobals()
  })
})
