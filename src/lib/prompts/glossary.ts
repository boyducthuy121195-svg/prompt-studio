/**
 * Bảng thuật ngữ Việt ↔ Anh cố định (docs/04 mục 4). AI dùng bảng này khi bấm ✨ Trau chuốt
 * để chuyển cách nói đời thường sang thuật ngữ chuẩn, nhất quán.
 */
export interface GlossaryEntry {
  /** Cách người dùng hay gõ (tiếng Việt) */
  vi: string
  /** Thuật ngữ chuẩn được giữ trong prompt */
  term: string
}

export const GLOSSARY: readonly GlossaryEntry[] = [
  // Quy trình
  { vi: 'kiểm thử, chạy thử', term: 'test, unit test, e2e test' },
  { vi: 'đưa lên mạng', term: 'deploy' },
  { vi: 'sửa lỗi', term: 'bug fix' },
  { vi: 'sắp xếp lại code, dọn code', term: 'refactor' },
  { vi: 'xem lại code', term: 'code review' },
  { vi: 'tiêu chí chấp nhận, điều kiện xong', term: 'acceptance criteria' },
  { vi: 'câu chuyện người dùng', term: 'user story' },
  { vi: 'bản đầu tiên tối thiểu', term: 'MVP' },
  { vi: 'tài liệu yêu cầu', term: 'PRD' },
  { vi: 'làm thử nhanh để kiểm chứng', term: 'spike, proof of concept' },
  { vi: 'lát cắt dọc, làm trọn một tính năng', term: 'vertical slice' },
  { vi: 'nguyên nhân gốc', term: 'root cause' },
  { vi: 'tái hiện lỗi', term: 'reproduce' },
  { vi: 'lỗi cũ quay lại', term: 'regression' },
  // Giao diện
  { vi: 'giao diện', term: 'UI, component' },
  { vi: 'trải nghiệm người dùng', term: 'UX' },
  { vi: 'luồng người dùng', term: 'user flow' },
  { vi: 'bản phác giao diện', term: 'wireframe, mockup' },
  { vi: 'hộp thoại, cửa sổ bật lên', term: 'dialog, modal' },
  { vi: 'thông báo nhỏ góc màn hình', term: 'toast' },
  { vi: 'ô nhập, biểu mẫu', term: 'input, form' },
  { vi: 'ô tích', term: 'checkbox' },
  { vi: 'danh sách thả xuống', term: 'dropdown, select' },
  { vi: 'thanh bên', term: 'sidebar' },
  { vi: 'giao diện tối', term: 'dark mode' },
  { vi: 'tự co giãn theo màn hình', term: 'responsive' },
  { vi: 'dùng được bằng bàn phím, trình đọc màn hình', term: 'accessibility (a11y)' },
  { vi: 'trạng thái trống', term: 'empty state' },
  { vi: 'bị treo, quay mãi', term: 'loading state không kết thúc / request timeout' },
  { vi: 'màn hình trắng', term: 'blank screen / runtime error' },
  { vi: 'bấm không ăn', term: 'event handler không chạy' },
  // Dữ liệu & kỹ thuật
  { vi: 'thư viện', term: 'library / dependency' },
  { vi: 'cơ sở dữ liệu', term: 'database, schema' },
  { vi: 'lưu tạm trên trình duyệt', term: 'localStorage / IndexedDB' },
  { vi: 'chuyển dữ liệu sang cấu trúc mới', term: 'migration' },
  { vi: 'biến môi trường', term: 'environment variable (.env)' },
  { vi: 'khóa bí mật', term: 'secret, API key' },
  { vi: 'kiểm tra dữ liệu đầu vào', term: 'validation' },
  { vi: 'gọi máy chủ', term: 'API request' },
  { vi: 'kết quả máy chủ trả về', term: 'response' },
  { vi: 'chữ hiện ra dần', term: 'streaming' },
  { vi: 'kiểu dữ liệu', term: 'type, interface' },
  { vi: 'gói cài đặt', term: 'package (npm)' },
  { vi: 'đóng gói bản chính thức', term: 'build' },
  { vi: 'chạy thử trên máy', term: 'dev server, localhost' },
  { vi: 'nhật ký lỗi', term: 'log, console' },
  { vi: 'hiệu năng, chạy nhanh', term: 'performance' },
  // Git
  { vi: 'nhánh', term: 'branch' },
  { vi: 'lưu phiên bản', term: 'commit' },
  { vi: 'đẩy code lên', term: 'push' },
  { vi: 'kéo code về', term: 'pull' },
  { vi: 'yêu cầu gộp code', term: 'pull request (PR)' },
  { vi: 'kho code', term: 'repository (repo)' },
  { vi: 'quay lại bản trước', term: 'revert, rollback' },
]
