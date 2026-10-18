/**
 * Danh sách model – chỗ DUY NHẤT ghi tên model (AGENTS.md mục 6).
 * Gemini không ghi cứng: lấy danh sách thật từ Google khi kiểm tra key.
 */
export const CLAUDE_MODELS = [
  { id: 'claude-opus-5-5', label: 'claude-opus-5-5 (mạnh nhất, khuyến nghị)' },
  { id: 'claude-sonnet-5-5', label: 'claude-sonnet-5-5 (cân bằng, rẻ bằng một nửa)' },
  { id: 'claude-haiku-5-5', label: 'claude-haiku-5-5 (nhanh, rẻ nhất)' },
] as const

export const DEFAULT_CLAUDE_MODEL = 'claude-opus-5-5'

/** Chủ dự án chọn "Gemini 3.8 Flash"; tên chính xác do Google trả về. */
export const PREFERRED_GEMINI = { version: '3.8', family: 'flash' } as const

function versionOf(id: string): number[] {
  const m = id.match(/gemini-(\d+(?:\.\d+)*)/)
  return m ? m[1].split('.').map(Number) : []
}

function compareVersion(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0)
    if (d) return d
  }
  return 0
}

const isStable = (id: string) =>
  !/(preview|exp|experimental|latest|tts|image|live|embedding)/i.test(id)

/**
 * Chọn model Gemini mặc định từ danh sách Google trả về:
 * ưu tiên 3.8 Flash; không có thì chọn bản Flash ổn định mới nhất; không có Flash thì model mới nhất.
 * Trả về `exact = false` khi không tìm thấy 3.8 Flash để giao diện báo người dùng.
 */
export function pickGeminiModel(ids: readonly string[]): { id: string; exact: boolean } | null {
  if (ids.length === 0) return null
  const flash = ids.filter((id) => id.includes(PREFERRED_GEMINI.family) && !id.includes('lite'))
  const exact = flash.filter((id) => versionOf(id).join('.') === PREFERRED_GEMINI.version)
  if (exact.length) return { id: exact.find(isStable) ?? exact[0], exact: true }
  const pool = (flash.length ? flash : [...ids]).filter(isStable)
  const sorted = (pool.length ? pool : [...ids]).sort((a, b) =>
    compareVersion(versionOf(b), versionOf(a)),
  )
  return { id: sorted[0], exact: false }
}
