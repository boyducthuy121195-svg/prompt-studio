import type { FieldDef, PromptTypeCode } from './types'

/**
 * Trọng tâm khi AI trau chuốt / gợi ý cho từng loại prompt (dữ liệu cố định).
 * Gửi kèm mỗi lần bấm ✨ để kết quả sát với loại việc, không theo một khuôn chung.
 */
export const TYPE_FOCUS: Readonly<Record<PromptTypeCode, string>> = {
  Y_TUONG:
    'Làm rõ vấn đề cần giải quyết, người dùng mục tiêu, điều khác biệt và phạm vi bản đầu tiên. Khuyến khích AI hỏi lại thay vì tự đoán.',
  PRD: 'Tính năng phải có user story và acceptance criteria kiểm tra được; phân biệt rõ Must/Should/Could; ghi rõ những gì KHÔNG làm.',
  THIET_KE_UI:
    'Liệt kê đủ màn hình và luồng đi giữa chúng; mỗi màn hình có trạng thái rỗng / đang tải / lỗi; nêu thiết bị và kích thước màn hình.',
  KIEN_TRUC:
    'Nêu ràng buộc thật (ngân sách, nơi chạy, số người dùng); yêu cầu so sánh phương án kèm đánh đổi; tránh chọn công nghệ chỉ vì phổ biến.',
  THIET_KE_DU_LIEU:
    'Mỗi đối tượng dữ liệu có trường, kiểu, quan hệ, ràng buộc; nghĩ tới dữ liệu cũ khi đổi cấu trúc (migration).',
  KE_HOACH:
    'Mỗi task nhỏ, làm xong trong một phiên, có cách tự kiểm tra và thứ tự phụ thuộc; không gộp nhiều tính năng vào một task.',
  KHOI_TAO:
    'Ghi đúng phiên bản công cụ, lệnh chạy dev/build/test/lint phải chạy được ngay; chỉ cài những gì cần cho bước đầu.',
  TINH_NANG:
    'Mô tả hành vi theo góc nhìn người dùng, acceptance criteria kiểm tra được, các trường hợp đặc biệt (rỗng, lỗi, dữ liệu lớn) và phần code bị ảnh hưởng.',
  SUA_LOI:
    'Có các bước tái hiện cụ thể, hiện tượng thực tế khác kết quả mong muốn thế nào, thông báo lỗi nguyên văn, môi trường xảy ra; yêu cầu tìm nguyên nhân gốc.',
  REFACTOR:
    'Ghi rõ phạm vi file/thư mục, mục tiêu đo được (bớt trùng lặp, tách hàm…), cam kết không đổi hành vi và test cũ phải pass.',
  VIET_TEST:
    'Nêu đối tượng test, các trường hợp bình thường / biên / lỗi, công cụ test của dự án; test phải thất bại được khi code sai.',
  REVIEW:
    'Nêu phạm vi cần review, tiêu chí (đúng, bảo mật, dễ đọc, hiệu năng), cách trình bày phát hiện theo mức độ nghiêm trọng.',
  KIEM_THU:
    'Kịch bản kiểm thử theo luồng chính của người dùng, kết quả mong đợi ở từng bước, cách ghi lại lỗi tìm thấy.',
  TRIEN_KHAI:
    'Nêu nơi chạy, biến môi trường cần có (không ghi giá trị bí mật), các bước kiểm tra sau khi chạy và cách quay lại bản cũ.',
  TAI_LIEU:
    'Xác định người đọc và trình độ, nội dung cần có, ví dụ chạy được; ngắn gọn, đúng với code hiện tại.',
  GIAI_THICH:
    'Nêu rõ cần giải thích phần nào, trình độ người nghe, hình thức (ví dụ, sơ đồ, so sánh đời thường); tránh thuật ngữ không giải thích.',
  CAI_TIEN:
    'Gom phản hồi thành vấn đề cụ thể, ưu tiên theo tác động, đề xuất bước nhỏ có thể kiểm tra được.',
  TU_DO:
    'Làm rõ việc cần làm, bối cảnh, kết quả mong muốn và cách biết là đã xong; mỗi yêu cầu kiểm tra được.',
}

/** Trọng tâm riêng cho từng ô hay gặp. Ô không có trong danh sách dùng `fieldFocus` mặc định. */
const FIELD_FOCUS: Readonly<Record<string, string>> = {
  task: 'Một câu nêu đúng một việc chính và kết quả cụ thể mong muốn; tránh từ mơ hồ như "đẹp", "tốt", "chuẩn".',
  purpose: 'Vì sao cần làm việc này và ai được lợi; giúp AI chọn cách làm phù hợp.',
  idea: 'Vấn đề gặp phải, ai gặp, hiện đang giải quyết thế nào, ý tưởng khác ở điểm nào.',
  entities: 'Liệt kê từng đối tượng dữ liệu với các trường chính và quan hệ giữa chúng.',
  behavior: 'Người dùng làm gì → app phản hồi gì, theo từng bước; nêu cả khi thao tác sai.',
  criteria: 'Mỗi tiêu chí một dòng, dạng "Khi … thì …", kiểm tra được bằng mắt hoặc bằng test.',
  steps:
    'Các bước đánh số, đủ cụ thể để người khác làm lại được (bấm gì, nhập gì, ở màn hình nào).',
  actual: 'Mô tả đúng những gì nhìn thấy, chép nguyên văn thông báo lỗi nếu có.',
  expected: 'Kết quả đúng phải trông thế nào.',
  subject: 'Chỉ rõ file, hàm hoặc khái niệm cần giải thích.',
  feedback: 'Mỗi phản hồi một dòng: ai gặp, gặp ở đâu, mức độ ảnh hưởng.',
  scope: 'Chỉ rõ file / thư mục / phần nào nằm trong phạm vi, phần nào không.',
  target: 'Chỉ rõ file hoặc hàm cần test.',
  states:
    'Với từng màn hình / khu vực: chưa có dữ liệu thì hiện gì, lỗi (mạng, dữ liệu sai) thì báo gì và cho làm gì tiếp, đang tải thì hiện gì; nội dung quá dài hiển thị ra sao.',
}

export function fieldFocus(key: string, field?: Pick<FieldDef, 'label' | 'placeholder'>): string {
  const known = FIELD_FOCUS[key]
  if (known) return known
  const label = field?.label ?? key
  return field?.placeholder
    ? `Làm rõ "${label}", cụ thể như ví dụ: ${field.placeholder}.`
    : `Làm rõ "${label}" cho cụ thể, kiểm tra được.`
}
