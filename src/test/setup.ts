import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
import { memoryFolderBackend, setFolderBackend } from '@/lib/folder/store'

// Thư mục giả (src/test/fake-fs.ts) không cất được vào IndexedDB như thư mục thật, nên test giữ chúng trong bộ nhớ
setFolderBackend(memoryFolderBackend())
