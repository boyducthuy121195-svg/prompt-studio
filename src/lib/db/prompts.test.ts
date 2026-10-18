import { hasVariables, resolvePins, STD_PREFIX, stdItems } from '@/lib/library'
import { createProject } from './projects'
import {
  deletePrompt,
  listPrompts,
  normalizeTags,
  savePrompt,
  togglePin,
  updatePrompt,
} from './prompts'
import { db } from './schema'
import { getSettings } from './settings'

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

describe('prompt đã lưu', () => {
  it('lưu theo dự án hoặc dùng chung, chuẩn hóa thẻ', async () => {
    const p = await createProject({ name: 'A' })
    await savePrompt({
      projectId: p.id,
      title: ' Sửa lỗi nhanh ',
      typeCode: 'SUA_LOI',
      body: 'x',
      tags: ['Bug', 'bug ', ''],
    })
    await savePrompt({ projectId: null, title: 'Chung', typeCode: 'TU_DO', body: 'y' })
    const own = await listPrompts(p.id)
    expect(own.map((x) => x.title)).toEqual(['Sửa lỗi nhanh'])
    expect(own[0].tags).toEqual(['bug'])
    expect((await listPrompts(null)).map((x) => x.title)).toEqual(['Chung'])
    expect(normalizeTags([' A', 'a', 'B'])).toEqual(['a', 'b'])
  })

  it('không cho tên rỗng, sửa được nội dung', async () => {
    await expect(
      savePrompt({ projectId: null, title: ' ', typeCode: 'TU_DO', body: '' }),
    ).rejects.toThrow()
    const s = await savePrompt({ projectId: null, title: 'A', typeCode: 'TU_DO', body: 'cũ' })
    await updatePrompt(s.id, { body: 'mới', tags: ['X'] })
    expect((await db.prompts.get(s.id))?.body).toBe('mới')
    await expect(updatePrompt('khong-co', { body: '' })).rejects.toThrow('Không tìm thấy prompt')
  })

  it('ghim / bỏ ghim; xóa prompt thì tự bỏ ghim', async () => {
    const s = await savePrompt({ projectId: null, title: 'A', typeCode: 'TU_DO', body: '' })
    expect(await togglePin(s.id)).toBe(true)
    expect(await togglePin('std:phase-1')).toBe(true)
    expect((await getSettings()).pins).toEqual([s.id, 'std:phase-1'])
    await deletePrompt(s.id)
    expect((await getSettings()).pins).toEqual(['std:phase-1'])
    expect(await togglePin('std:phase-1')).toBe(false)
    expect((await getSettings()).pins).toEqual([])
  })
})

describe('thư viện', () => {
  it('có prompt Quy trình chuẩn chỉ đọc với mã ghim std:', () => {
    const items = stdItems()
    expect(items.length).toBeGreaterThan(10)
    expect(items.every((i) => i.pinId.startsWith(STD_PREFIX) && i.source === 'std')).toBe(true)
  })

  it('đổi mã ghim thành mục, bỏ qua mã không còn tồn tại', async () => {
    const s = await savePrompt({
      projectId: null,
      title: 'Có biến',
      typeCode: 'TU_DO',
      body: 'Làm {{viec}}',
    })
    const items = resolvePins(['std:phase-1', 'mat-roi', s.id], [s])
    expect(items.map((i) => i.title)).toEqual(['GĐ 1 – Khám phá ý tưởng', 'Có biến'])
    expect(hasVariables(items[1])).toBe(true)
    expect(hasVariables({ body: 'không biến' })).toBe(false)
  })
})
