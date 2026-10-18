/** Kiểu dữ liệu cho phần dữ liệu cố định của Trình tạo prompt (docs/02, docs/04). */

export const PROMPT_TYPE_CODES = [
  'Y_TUONG',
  'PRD',
  'THIET_KE_UI',
  'KIEN_TRUC',
  'THIET_KE_DU_LIEU',
  'KE_HOACH',
  'KHOI_TAO',
  'TINH_NANG',
  'SUA_LOI',
  'REFACTOR',
  'VIET_TEST',
  'REVIEW',
  'KIEM_THU',
  'TRIEN_KHAI',
  'TAI_LIEU',
  'GIAI_THICH',
  'CAI_TIEN',
  'TU_DO',
] as const

export type PromptTypeCode = (typeof PROMPT_TYPE_CODES)[number]

/** 4 nhóm gợi ý: Ràng buộc, Cách làm việc, Định dạng đầu ra, Tiêu chí hoàn thành */
export type SuggestionGroup = 'rb' | 'cl' | 'dr' | 'tc'

export interface Suggestion {
  /** Ví dụ 'RB-01' */
  code: string
  /** Nhãn ngắn hiện trên ô tích */
  label: string
  /** Câu chuẩn được chèn vào prompt (tiếng Việt, giữ thuật ngữ tiếng Anh) */
  text: string
}

export type FieldKind = 'text' | 'textarea' | 'select' | 'multiselect' | 'number'

/** Trường riêng của một loại prompt. `options` dùng cho select/multiselect; luôn có thêm "Khác…" khi hiển thị. */
export interface FieldDef {
  key: string
  label: string
  kind: FieldKind
  placeholder?: string
  options?: readonly string[]
  /** Hiện nút ✨ để AI trau chuốt riêng ô này */
  polish?: boolean
}

export type PromptGroupKey = 'product' | 'tech' | 'code' | 'quality' | 'free'

export interface PromptTypeDef {
  code: PromptTypeCode
  group: PromptGroupKey
  name: string
  desc: string
  /** Vai trò AI mặc định */
  role: string
  taskPlaceholder: string
  fields: readonly FieldDef[]
  /** Các gợi ý được tích sẵn khi chọn loại này (docs/04 mục 2) */
  defaults: Readonly<Record<SuggestionGroup, readonly string[]>>
  /** Mẹo riêng tự chèn vào khối Cách làm việc (docs/04 mục 3) */
  tip?: string
}
