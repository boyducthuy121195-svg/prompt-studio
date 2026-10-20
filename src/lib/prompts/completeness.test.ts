import { emptyForm } from './build-prompt'
import { completeness } from './completeness'
import { getPromptType } from './prompt-types'

const labels = { task: 'Nhiệm vụ', purpose: 'Mục đích' }

describe('độ hoàn thiện của bảng nhập', () => {
  it('tính theo Nhiệm vụ, các ô chữ riêng của loại và Mục đích; liệt kê ô còn thiếu', () => {
    const type = getPromptType('SUA_LOI')
    const textareas = type.fields.filter((f) => f.kind === 'textarea')
    const form = emptyForm('SUA_LOI', 'vi-en')
    const empty = completeness(form, type, labels)
    expect(empty.percent).toBe(0)
    expect(empty.missing).toEqual(['Nhiệm vụ', ...textareas.map((f) => f.label), 'Mục đích'])

    const half = completeness(
      { ...form, task: 'Màn hình trắng', fields: { [textareas[0].key]: '1. Bấm Lưu' } },
      type,
      labels,
    )
    expect(half.missing).not.toContain('Nhiệm vụ')
    expect(half.percent).toBe(Math.round((2 / (textareas.length + 2)) * 100))
  })

  it('ô chọn (select, multiselect) không tính; ô chỉ có khoảng trắng coi như trống', () => {
    const type = getPromptType('TU_DO')
    const r = completeness(
      { ...emptyForm('TU_DO', 'vi-en'), task: '  ', purpose: 'Học' },
      type,
      labels,
    )
    expect(r.missing).toContain('Nhiệm vụ')
    expect(r.missing).not.toContain('Mục đích')
  })

  it('điền đủ thì 100%', () => {
    const type = getPromptType('TINH_NANG')
    const fields = Object.fromEntries(
      type.fields.filter((f) => f.kind === 'textarea').map((f) => [f.key, 'x']),
    )
    expect(
      completeness(
        { ...emptyForm('TINH_NANG', 'vi'), task: 'a', purpose: 'b', fields },
        type,
        labels,
      ),
    ).toEqual({ percent: 100, missing: [] })
  })
})
