import { fillVariables, parseVariables, variableLabel } from './variables'

describe('biến trong prompt', () => {
  const body =
    'Hỏi tối đa {{so_cau_hoi|10}} câu về {{y_tuong}}. Nhắc lại: {{y_tuong}}. {{ dau_cach }}'

  it('tìm biến theo thứ tự, không trùng, có giá trị mặc định', () => {
    expect(parseVariables(body)).toEqual([
      { name: 'so_cau_hoi', defaultValue: '10' },
      { name: 'y_tuong', defaultValue: '' },
      { name: 'dau_cach', defaultValue: '' },
    ])
  })

  it('điền giá trị; bỏ trống thì dùng mặc định hoặc để [ten_bien]', () => {
    expect(fillVariables(body, { y_tuong: 'app chi tiêu', dau_cach: '  ' })).toBe(
      'Hỏi tối đa 10 câu về app chi tiêu. Nhắc lại: app chi tiêu. [dau_cach]',
    )
    expect(fillVariables(body, { so_cau_hoi: '5' })).toContain('tối đa 5 câu về [y_tuong]')
  })

  it('không đụng tới chữ không phải biến', () => {
    expect(parseVariables('Không có biến { nào } ở đây')).toEqual([])
    expect(fillVariables('a {b} c', {})).toBe('a {b} c')
  })

  it('nhãn dễ đọc', () => {
    expect(variableLabel('so_cau_hoi')).toBe('So cau hoi')
  })
})
