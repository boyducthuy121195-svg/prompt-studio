/** Biến trong prompt: {{ten_bien}} hoặc {{ten_bien|giá trị mặc định}} (PRD mục A5). */
export interface PromptVariable {
  name: string
  defaultValue: string
}

const VAR_RE = /\{\{\s*([\p{L}\p{N}_]+)\s*(?:\|([^}]*))?\}\}/gu

/** Danh sách biến theo thứ tự xuất hiện, không trùng tên (lấy mặc định của lần xuất hiện đầu tiên). */
export function parseVariables(body: string): PromptVariable[] {
  const seen = new Map<string, PromptVariable>()
  for (const m of body.matchAll(VAR_RE)) {
    if (!seen.has(m[1])) seen.set(m[1], { name: m[1], defaultValue: (m[2] ?? '').trim() })
  }
  return [...seen.values()]
}

/** Thay biến bằng giá trị đã điền; bỏ trống thì dùng mặc định; không có mặc định thì để [ten_bien]. */
export function fillVariables(body: string, values: Record<string, string>): string {
  return body.replace(VAR_RE, (_all, name: string, def?: string) => {
    const v = values[name]?.trim()
    if (v) return v
    if (def?.trim()) return def.trim()
    return `[${name}]`
  })
}

/** "so_cau_hoi" → "So cau hoi" để làm nhãn ô nhập dễ đọc hơn. */
export function variableLabel(name: string): string {
  const s = name.replace(/_/g, ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}
