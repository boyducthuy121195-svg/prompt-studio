import { LAST_PHASE, PHASES, phaseLabel } from './phases'

describe('phases', () => {
  it('có đủ 11 giai đoạn của quy trình chuẩn', () => {
    expect(PHASES).toHaveLength(11)
    expect(LAST_PHASE).toBe(10)
  })

  it('phaseLabel ghép số và tên, chặn giá trị ngoài khoảng', () => {
    expect(phaseLabel(3)).toBe('3 · Thiết kế')
    expect(phaseLabel(-2)).toBe('0 · Chuẩn bị')
    expect(phaseLabel(99)).toBe('10 · Cải tiến')
  })
})
