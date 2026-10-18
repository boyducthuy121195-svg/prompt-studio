import { strToU8, zipSync } from 'fflate'
import { COMPANION_FILES } from '@/lib/prompts/agents-skeleton'

/** Gói .zip: AGENTS.md + CLAUDE.md (@AGENTS.md) + .gemini/settings.json – giải nén vào thư mục dự án là dùng được. */
export function buildAgentsZip(agentsMd: string): Uint8Array {
  const files: Record<string, Uint8Array> = { 'AGENTS.md': strToU8(agentsMd) }
  for (const [path, content] of Object.entries(COMPANION_FILES)) files[path] = strToU8(content)
  return zipSync(files)
}
