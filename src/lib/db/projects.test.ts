import { db } from './schema'
import {
  COPY_SUFFIX,
  createProject,
  deleteProject,
  duplicateProject,
  getProject,
  listProjects,
  projectStats,
  updateProject,
} from './projects'
import { getSettings, updateSettings } from './settings'

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

describe('dự án', () => {
  it('tạo dự án mới với hồ sơ trống, giai đoạn 0', async () => {
    const p = await createProject({ name: '  Prompt Studio  ', description: 'App cá nhân' })
    expect(p.name).toBe('Prompt Studio')
    expect(p.currentPhase).toBe(0)
    expect(p.profile.techStack).toBe('')
    expect(await getProject(p.id)).toEqual(p)
  })

  it('không cho tạo hoặc đổi tên thành rỗng', async () => {
    await expect(createProject({ name: '   ' })).rejects.toThrow('Tên dự án không được để trống.')
    const p = await createProject({ name: 'A' })
    await expect(updateProject(p.id, { name: ' ' })).rejects.toThrow()
  })

  it('cập nhật hồ sơ, giới hạn giai đoạn trong 0–10, dự án sửa gần nhất đứng đầu', async () => {
    const a = await createProject({ name: 'A' })
    const b = await createProject({ name: 'B' })
    await new Promise((r) => setTimeout(r, 5))
    await updateProject(a.id, { profile: { ...a.profile, techStack: 'React' }, currentPhase: 42 })
    const saved = await getProject(a.id)
    expect(saved?.profile.techStack).toBe('React')
    expect(saved?.currentPhase).toBe(10)
    expect((await listProjects()).map((p) => p.id)).toEqual([a.id, b.id])
  })

  it('báo lỗi khi cập nhật dự án không tồn tại', async () => {
    await expect(updateProject('khong-co', { name: 'X' })).rejects.toThrow('Không tìm thấy dự án')
  })

  it('nhân bản kèm prompt và AGENTS.md', async () => {
    const p = await createProject({ name: 'Gốc' })
    await db.prompts.add({
      id: 'p1',
      projectId: p.id,
      title: 'Sửa lỗi',
      typeCode: 'SUA_LOI',
      body: 'x',
      tags: [],
      createdAt: 1,
      updatedAt: 1,
    })
    await db.agentsDocs.add({ id: 'd1', projectId: p.id, sections: [], updatedAt: 1 })

    const copy = await duplicateProject(p.id)
    expect(copy.name).toBe('Gốc' + COPY_SUFFIX)
    expect(copy.id).not.toBe(p.id)
    expect(await db.prompts.where('projectId').equals(copy.id).count()).toBe(1)
    expect(await db.agentsDocs.where('projectId').equals(copy.id).count()).toBe(1)
    expect(await db.prompts.where('projectId').equals(p.id).count()).toBe(1)
  })

  it('xóa dự án xóa luôn prompt, AGENTS.md, lịch sử và bỏ chọn dự án hiện tại', async () => {
    const p = await createProject({ name: 'Xóa tôi' })
    const keep = await createProject({ name: 'Giữ lại' })
    await db.prompts.bulkAdd([
      {
        id: 'p1',
        projectId: p.id,
        title: 'a',
        typeCode: 'TU_DO',
        body: '',
        tags: [],
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: 'p2',
        projectId: keep.id,
        title: 'b',
        typeCode: 'TU_DO',
        body: '',
        tags: [],
        createdAt: 1,
        updatedAt: 1,
      },
    ])
    await db.agentsDocs.add({ id: 'd1', projectId: p.id, sections: [], updatedAt: 1 })
    await db.revisions.add({ id: 'r1', docId: 'd1', kind: 'agents', content: '', createdAt: 1 })
    await updateSettings({ currentProjectId: p.id })

    await deleteProject(p.id)
    expect(await getProject(p.id)).toBeUndefined()
    expect(await db.prompts.toCollection().primaryKeys()).toEqual(['p2'])
    expect(await db.agentsDocs.count()).toBe(0)
    expect(await db.revisions.count()).toBe(0)
    expect((await getSettings()).currentProjectId).toBeNull()
  })

  it('thống kê số prompt và số mục AGENTS.md đang bật', async () => {
    const p = await createProject({ name: 'A' })
    await db.prompts.add({
      id: 'p1',
      projectId: p.id,
      title: 'a',
      typeCode: 'TU_DO',
      body: '',
      tags: [],
      createdAt: 1,
      updatedAt: 1,
    })
    await db.agentsDocs.add({
      id: 'd1',
      projectId: p.id,
      updatedAt: 1,
      sections: [
        { key: 'a', title: 'A', enabled: true, order: 0, content: '', custom: false },
        { key: 'b', title: 'B', enabled: false, order: 1, content: '', custom: false },
      ],
    })
    expect((await projectStats())[p.id]).toEqual({ prompts: 1, agentsSections: 1 })
  })
})

describe('cài đặt', () => {
  it('trả về mặc định khi chưa lưu, gộp thay đổi khi lưu', async () => {
    expect((await getSettings()).theme).toBe('light')
    await updateSettings({ theme: 'dark' })
    await updateSettings({ sidebarCollapsed: true })
    expect(await getSettings()).toMatchObject({
      theme: 'dark',
      sidebarCollapsed: true,
      currentProjectId: null,
    })
  })
})
