/** Tải một file về máy người dùng (không gửi đi đâu). */
export function downloadFile(name: string, data: string | Uint8Array, type: string): void {
  const part: BlobPart = typeof data === 'string' ? data : new Uint8Array(data)
  const url = URL.createObjectURL(new Blob([part], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
