import { PHASES } from '@/lib/phases'
import { AGENTS_SECTIONS, COMPANION_FILES, getAgentsSection } from './agents-skeleton'
import { GLOSSARY } from './glossary'
import {
  defaultSelection,
  getPromptType,
  PROMPT_GROUPS,
  PROMPT_TYPES,
  promptTypesByGroup,
  ROLES,
} from './prompt-types'
import {
  EVERYDAY_PROMPTS,
  EXTENSION_PATHS,
  SPIKE_PROMPT,
  STANDARD_PHASES,
  standardProcessPrompts,
} from './standard-process'
import { EXCLUSIVE_AUTONOMY, getSuggestion, SUGGESTIONS, toggleSuggestion } from './suggestions'
import { PROMPT_TYPE_CODES } from './types'

describe('loại prompt', () => {
  it('có đủ 18 loại, mã không trùng, đúng thứ tự khai báo', () => {
    expect(PROMPT_TYPES).toHaveLength(18)
    expect(PROMPT_TYPES.map((t) => t.code)).toEqual([...PROMPT_TYPE_CODES])
  })

  it('mỗi loại thuộc một nhóm hợp lệ, mỗi nhóm có ít nhất 1 loại', () => {
    for (const g of PROMPT_GROUPS) expect(promptTypesByGroup(g.key).length).toBeGreaterThan(0)
    expect(PROMPT_GROUPS.flatMap((g) => promptTypesByGroup(g.key))).toHaveLength(18)
  })

  it('vai trò mặc định nằm trong danh sách vai trò', () => {
    for (const t of PROMPT_TYPES) expect(ROLES).toContain(t.role)
  })

  it('mọi mã gợi ý được tích sẵn đều tồn tại và đúng nhóm', () => {
    for (const t of PROMPT_TYPES) {
      for (const group of ['rb', 'cl', 'dr', 'tc'] as const) {
        for (const code of t.defaults[group]) {
          expect(getSuggestion(code), `${t.code} → ${code}`).toBeDefined()
          expect(
            SUGGESTIONS[group].some((s) => s.code === code),
            `${code} phải thuộc nhóm ${group}`,
          ).toBe(true)
        }
      }
    }
  })

  it('không loại nào tích sẵn quá 1 mức tự chủ (CL-01/02/03)', () => {
    for (const t of PROMPT_TYPES) {
      const picked = t.defaults.cl.filter((c) =>
        (EXCLUSIVE_AUTONOMY as readonly string[]).includes(c),
      )
      expect(picked.length, t.code).toBeLessThanOrEqual(1)
    }
  })

  it('trường select/multiselect luôn có lựa chọn, key không trùng trong một loại', () => {
    for (const t of PROMPT_TYPES) {
      const keys = t.fields.map((f) => f.key)
      expect(new Set(keys).size, t.code).toBe(keys.length)
      for (const f of t.fields) {
        if (f.kind === 'select' || f.kind === 'multiselect')
          expect(f.options?.length, `${t.code}.${f.key}`).toBeGreaterThan(1)
      }
    }
  })

  it('"Sửa lỗi" tích sẵn đúng như docs/04', () => {
    expect([...defaultSelection('SUA_LOI')].sort()).toEqual(
      [
        'RB-01',
        'RB-06',
        'RB-07',
        'CL-04',
        'CL-06',
        'DR-01',
        'TC-01',
        'TC-02',
        'TC-03',
        'TC-06',
      ].sort(),
    )
    expect(getPromptType('SUA_LOI').tip).toMatch(/root cause/)
  })
})

describe('bộ gợi ý', () => {
  it('đủ số lượng theo docs/04: 12 RB, 7 CL, 7 DR, 7 TC, mã không trùng', () => {
    expect(SUGGESTIONS.rb).toHaveLength(12)
    expect(SUGGESTIONS.cl).toHaveLength(7)
    expect(SUGGESTIONS.dr).toHaveLength(7)
    expect(SUGGESTIONS.tc).toHaveLength(7)
    const codes = Object.values(SUGGESTIONS)
      .flat()
      .map((s) => s.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('bật một mức tự chủ thì tắt hai mức còn lại; các mục khác không bị ảnh hưởng', () => {
    let sel = new Set(['CL-01', 'CL-04'])
    sel = toggleSuggestion(sel, 'CL-03')
    expect([...sel].sort()).toEqual(['CL-03', 'CL-04'])
    sel = toggleSuggestion(sel, 'CL-03')
    expect([...sel]).toEqual(['CL-04'])
    sel = toggleSuggestion(sel, 'RB-01')
    expect(sel.has('RB-01')).toBe(true)
  })
})

describe('quy trình chuẩn', () => {
  it('11 giai đoạn trùng tên và thứ tự với thanh tiến độ', () => {
    expect(STANDARD_PHASES.map((p) => p.name)).toEqual([...PHASES])
    STANDARD_PHASES.forEach((p, i) => expect(p.index).toBe(i))
  })

  it('mỗi giai đoạn (trừ Chuẩn bị) trỏ tới đúng một loại prompt có thật', () => {
    expect(STANDARD_PHASES[0].prompt).toBeNull()
    for (const p of STANDARD_PHASES.slice(1)) {
      expect(p.prompt, p.name).not.toBeNull()
      expect(() => getPromptType(p.prompt!.typeCode)).not.toThrow()
    }
  })

  it('id prompt không trùng và biến {{...}} đúng cú pháp', () => {
    const all = standardProcessPrompts()
    expect(all).toHaveLength(10 + 1 + EVERYDAY_PROMPTS.length)
    expect(new Set(all.map((p) => p.id)).size).toBe(all.length)
    for (const p of all) {
      for (const m of p.body.matchAll(/\{\{([^}]*)\}\}/g)) {
        expect(m[1], `${p.id}: {{${m[1]}}}`).toMatch(/^[a-z0-9_]+(\|[^|]+)?$/)
      }
    }
  })

  it('có 3 lối đi phát triển thêm; lối Lớn có bước Nghiên cứu kỹ thuật', () => {
    expect(EXTENSION_PATHS.map((p) => p.size)).toEqual(['small', 'medium', 'large'])
    expect(EXTENSION_PATHS[2].steps).toContain('spike')
    for (const path of EXTENSION_PATHS) {
      for (const s of path.steps) if (s !== 'spike') expect(path.skip).not.toContain(s)
    }
    expect(SPIKE_PROMPT.body).toContain('spike/')
  })
})

describe('khung AGENTS.md', () => {
  it('có 10 mục, đúng 4 mục bắt buộc (Tổng quan, Lệnh, Quy ước code, Ranh giới)', () => {
    expect(AGENTS_SECTIONS).toHaveLength(10)
    expect(AGENTS_SECTIONS.filter((s) => s.required).map((s) => s.key)).toEqual([
      'overview',
      'commands',
      'conventions',
      'boundaries',
    ])
    expect(getAgentsSection('boundaries')?.template).toMatch(
      /Luôn làm[\s\S]*Hỏi trước[\s\S]*Không bao giờ/,
    )
  })

  it('mỗi mục có câu hỏi Wizard và lựa chọn nhanh', () => {
    for (const s of AGENTS_SECTIONS) {
      expect(s.question.length, s.key).toBeGreaterThan(5)
      expect(s.quickOptions.length, s.key).toBeGreaterThan(0)
    }
  })

  it('file đi kèm trỏ về AGENTS.md', () => {
    expect(COMPANION_FILES['CLAUDE.md'].trim()).toBe('@AGENTS.md')
    expect(JSON.parse(COMPANION_FILES['.gemini/settings.json'])).toEqual({
      context: { fileName: 'AGENTS.md' },
    })
  })
})

describe('bảng thuật ngữ', () => {
  it('có ít nhất 50 mục, không mục nào trống', () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(50)
    for (const g of GLOSSARY) {
      expect(g.vi.trim()).not.toBe('')
      expect(g.term.trim()).not.toBe('')
    }
  })
})
