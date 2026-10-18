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

/** Cài đặt: chỉ có một bản ghi, id = 'app'. Thêm trường mới thì thêm mặc định trong DEFAULT_SETTINGS (không cần migration vì không đánh index). */
export interface Settings {
  id: 'app'
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  /** null = "Không chọn dự án (dùng chung)" */
  currentProjectId: string | null
  pins: string[]
  // ── AI (task 7) – key chỉ lưu trong trình duyệt này
  claudeKey: string
  geminiKey: string
  defaultProvider: 'claude' | 'gemini'
  claudeModel: string
  geminiModel: string
  /** Danh sách model Gemini lấy về khi bấm "Kiểm tra key" */
  geminiModels: string[]
  /** Ngôn ngữ mặc định của prompt tạo ra */
  language: 'vi-en' | 'vi' | 'en'
  // ── Sao lưu (task 12)
  lastBackupAt: number | null
}
