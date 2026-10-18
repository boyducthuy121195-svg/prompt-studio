const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** "Vừa xong", "5 phút trước", "Hôm nay 14:05", "Hôm qua", "3 ngày trước", "12/09/2026". */
export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const diff = now - timestamp
  if (diff < MINUTE) return 'Vừa xong'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} phút trước`

  const date = new Date(timestamp)
  const today = startOfDay(now)
  const pad = (n: number) => String(n).padStart(2, '0')
  if (timestamp >= today) return `Hôm nay ${pad(date.getHours())}:${pad(date.getMinutes())}`
  if (timestamp >= today - DAY) return 'Hôm qua'

  const days = Math.round((today - startOfDay(timestamp)) / DAY)
  if (days < 7) return `${days} ngày trước`
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

function startOfDay(timestamp: number): number {
  const d = new Date(timestamp)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
