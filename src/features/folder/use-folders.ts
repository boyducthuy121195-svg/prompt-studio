import { liveQuery } from 'dexie'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { db } from '@/lib/db/schema'
import { folderSupported } from '@/lib/folder/fs'
import { listFolders, onFoldersChanged, type FolderRecord } from '@/lib/folder/store'
import { getFolderStatus, onFolderStatus, requestSync } from '@/lib/folder/sync'

/** Các thư mục đã chọn; `null` khi đang đọc. Tự cập nhật khi chọn / bỏ thư mục. */
export function useFolders(): FolderRecord[] | null {
  const [list, setList] = useState<FolderRecord[] | null>(null)
  useEffect(() => {
    let alive = true
    const load = () => void listFolders().then((l) => alive && setList(l))
    load()
    const off = onFoldersChanged(load)
    return () => {
      alive = false
      off()
    }
  }, [])
  return list
}

export function useFolder(key: string): FolderRecord | undefined | null {
  const list = useFolders()
  return list === null ? null : list.find((r) => r.key === key)
}

export function useFolderStatus(key: string) {
  return useSyncExternalStore(onFolderStatus, () => getFolderStatus(key))
}

/** Thời gian chờ sau lần sửa cuối rồi mới ghi, để gõ liên tục không ghi liên tục. */
const DEBOUNCE_MS = 600

/** Đặt một lần ở khung app: mỗi khi dữ liệu đổi thì ghi ra các thư mục đã chọn. */
export function useFolderSync() {
  useEffect(() => {
    if (!folderSupported()) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const schedule = () => {
      clearTimeout(timer)
      timer = setTimeout(() => void requestSync(), DEBOUNCE_MS)
    }
    const sub = liveQuery(() => Promise.all(db.tables.map((t) => t.toArray()))).subscribe({
      next: schedule,
    })
    const off = onFoldersChanged(schedule)
    return () => {
      clearTimeout(timer)
      sub.unsubscribe()
      off()
    }
  }, [])
}
