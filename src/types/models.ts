/** Kiểu dữ liệu lưu trong IndexedDB – xem ARCHITECTURE.md mục 4. */

export interface ProjectProfile {
  goal: string
  techStack: string
  commands: string
  structure: string
  conventions: string
  donts: string
  notes: string
}

export interface Project {
  id: string
  name: string
  description: string
  profile: ProjectProfile
  /** 0–10, vị trí trên thanh tiến độ theo quy trình chuẩn */
  currentPhase: number
  createdAt: number
  updatedAt: number
}

/** Prompt đã lưu trong thư viện. projectId = null nghĩa là "Dùng chung". Dùng từ task 6. */
export interface SavedPrompt {
  id: string
  projectId: string | null
  title: string
  typeCode: string
  body: string
  formState?: unknown
  tags: string[]
  createdAt: number
  updatedAt: number
}

export interface AgentsSection {
  key: string
  title: string
  enabled: boolean
  order: number
  content: string
  custom: boolean
}

/** AGENTS.md của một dự án. Dùng từ task 9. */
export interface AgentsDoc {
  id: string
  projectId: string
  sections: AgentsSection[]
  updatedAt: number
}

/** Lịch sử phiên bản – dành sẵn cho tính năng B1. */
export interface Revision {
  id: string
  docId: string
  kind: 'agents' | 'prompt'
  content: string
  createdAt: number
}

/** Cài đặt: chỉ có một bản ghi, id = 'app'. Các trường AI/sao lưu được thêm ở task 7 và 12. */
export interface Settings {
  id: 'app'
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  /** null = "Không chọn dự án (dùng chung)" */
  currentProjectId: string | null
  pins: string[]
}
