import { parseAgentsMd } from './parse'

describe('tách file AGENTS.md có sẵn', () => {
  it('nhận diện mục chuẩn từ tiêu đề tiếng Việt / tiếng Anh, có hoặc không có số thứ tự', () => {
    const md = `# AGENTS.md – Web

## 1. Tổng quan dự án
App bán hàng.

## Commands
- \`npm run dev\`

## Testing instructions
Vitest.

## Quy tắc đặt tên file
kebab-case
`
    const s = parseAgentsMd(md)
    const get = (k: string) => s.find((x) => x.key === k)!
    expect(get('overview')).toMatchObject({ content: 'App bán hàng.', enabled: true })
    expect(get('commands').content).toBe('- `npm run dev`')
    expect(get('testing').content).toBe('Vitest.')
    expect(get('boundaries')).toMatchObject({ enabled: true, content: '' }) // bắt buộc: bật nhưng trống
    expect(get('gotchas').enabled).toBe(false)
    const custom = s.filter((x) => x.custom)
    expect(custom).toEqual([
      expect.objectContaining({ title: 'Quy tắc đặt tên file', content: 'kebab-case' }),
    ])
    expect(s.map((x) => x.order)).toEqual(s.map((_, i) => i))
  })
})
