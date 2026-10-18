/** 11 giai đoạn của quy trình chuẩn (docs/01-QUY-TRINH-XAY-DUNG-APP.md). Chỉ số = Project.currentPhase. */
export const PHASES = [
  'Chuẩn bị',
  'Ý tưởng',
  'PRD',
  'Thiết kế',
  'Kiến trúc',
  'Kế hoạch',
  'Dựng khung',
  'Xây tính năng',
  'Kiểm thử',
  'Triển khai',
  'Cải tiến',
] as const

export const LAST_PHASE = PHASES.length - 1

export function phaseLabel(index: number): string {
  const i = Math.min(Math.max(Math.trunc(index), 0), LAST_PHASE)
  return `${i} · ${PHASES[i]}`
}
