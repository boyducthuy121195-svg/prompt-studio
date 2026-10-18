import { stdItems } from './library'
import { PROMPT_TYPES } from './prompts/prompt-types'
import { buildSearchIndex, normalize, searchItems } from './search'

const index = buildSearchIndex({
  projects: [
    { id: 'p1', name: 'Web bán hàng', description: 'Cửa hàng gia đình' },
    { id: 'p2', name: 'Prompt Studio', description: 'App tạo prompt' },
  ],
  types: PROMPT_TYPES,
  prompts: stdItems(),
  pages: [{ path: '/settings', label: 'Cài đặt' }],
  labels: { typeDesc: (d) => `Loại prompt · ${d}`, page: 'Trang' },
})

describe('tìm nhanh', () => {
  it('bỏ dấu tiếng Việt khi so khớp', () => {
    expect(normalize('  Sửa LỖI đăng nhập ')).toBe('sua loi dang nhap')
  })

  it('gõ không dấu vẫn tìm được, tên khớp đầu được xếp trước', () => {
    const r = searchItems(index, 'sua loi')
    expect(r[0]).toMatchObject({ kind: 'type', title: 'Sửa lỗi', to: '/prompt/SUA_LOI' })
  })

  it('tìm dự án theo mô tả, tìm trang theo tên', () => {
    expect(searchItems(index, 'gia dinh')[0]).toMatchObject({
      kind: 'project',
      to: '/projects/p1',
    })
    expect(searchItems(index, 'cai dat').some((i) => i.kind === 'page')).toBe(true)
  })

  it('phải khớp mọi từ; ô trống trả về mục đầu, có giới hạn số lượng', () => {
    expect(searchItems(index, 'web xyz')).toEqual([])
    expect(searchItems(index, '', 3)).toHaveLength(3)
    expect(searchItems(index, 'a', 5).length).toBeLessThanOrEqual(5)
  })

  it('prompt có sẵn của Quy trình chuẩn nằm trong kết quả', () => {
    const r = searchItems(index, 'ket thuc phien')
    expect(r[0]).toMatchObject({ kind: 'prompt', title: 'Kết thúc phiên làm việc' })
  })
})
