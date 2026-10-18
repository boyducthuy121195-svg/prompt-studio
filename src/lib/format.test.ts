import { formatRelativeTime } from './format'

const at = (y: number, m: number, d: number, h = 12, min = 0) =>
  new Date(y, m - 1, d, h, min).getTime()
const NOW = at(2026, 10, 18, 15, 30)

describe('formatRelativeTime', () => {
  it('dưới 1 phút là "Vừa xong"', () => {
    expect(formatRelativeTime(NOW - 20_000, NOW)).toBe('Vừa xong')
  })

  it('dưới 1 giờ tính theo phút', () => {
    expect(formatRelativeTime(NOW - 5 * 60_000, NOW)).toBe('5 phút trước')
  })

  it('trong ngày hiện giờ:phút', () => {
    expect(formatRelativeTime(at(2026, 10, 18, 9, 5), NOW)).toBe('Hôm nay 09:05')
  })

  it('hôm qua, vài ngày, vài tuần trước', () => {
    expect(formatRelativeTime(at(2026, 10, 17, 23, 0), NOW)).toBe('Hôm qua')
    expect(formatRelativeTime(at(2026, 10, 15), NOW)).toBe('3 ngày trước')
    expect(formatRelativeTime(at(2026, 10, 4), NOW)).toBe('2 tuần trước')
  })

  it('lâu hơn 30 ngày hiện ngày tháng năm', () => {
    expect(formatRelativeTime(at(2026, 9, 2), NOW)).toBe('02/09/2026')
  })
})
