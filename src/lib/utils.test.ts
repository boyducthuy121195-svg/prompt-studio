import { cn } from './utils'

describe('cn', () => {
  it('gộp class và để class sau ghi đè class trước', () => {
    expect(cn('px-2 text-sm', 'px-4')).toBe('text-sm px-4')
  })

  it('bỏ qua giá trị rỗng', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b')
  })
})
