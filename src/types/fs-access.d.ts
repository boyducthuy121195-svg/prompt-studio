/**
 * Phần File System Access API mà TypeScript chưa khai báo sẵn (Chrome / Edge).
 * https://developer.mozilla.org/docs/Web/API/Window/showDirectoryPicker
 */
type FsPermissionMode = { mode?: 'read' | 'readwrite' }

interface FileSystemHandle {
  queryPermission?(descriptor?: FsPermissionMode): Promise<PermissionState>
  requestPermission?(descriptor?: FsPermissionMode): Promise<PermissionState>
}

interface Window {
  showDirectoryPicker?(options?: FsPermissionMode & { id?: string }): Promise<FileSystemDirectoryHandle>
}
