import type { PromptForm } from './build-prompt'
import type { PromptTypeDef } from './types'

/**
 * Độ hoàn thiện của bảng nhập: tỉ lệ các ô quan trọng đã điền (Nhiệm vụ, các ô chữ riêng của loại, Mục đích).
 * Chạy trên máy, không gọi AI.
 */
export function completeness(
  form: PromptForm,
  type: Pick<PromptTypeDef, 'fields'>,
  labels: { task: string; purpose: string },
): { percent: number; missing: string[] } {
  const items: [string, string][] = [
    [labels.task, form.task],
    ...type.fields
      .filter((f) => f.kind === 'textarea')
      .map((f): [string, string] => {
        const v = form.fields[f.key]
        return [f.label, typeof v === 'string' ? v : '']
      }),
    [labels.purpose, form.purpose],
  ]
  const missing = items.filter(([, v]) => !v.trim()).map(([label]) => label)
  return {
    percent: Math.round(((items.length - missing.length) / items.length) * 100),
    missing,
  }
}
