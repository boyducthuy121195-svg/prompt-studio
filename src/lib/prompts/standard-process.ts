import type { PromptTypeCode } from './types'

/**
 * Bộ sưu tập "Quy trình chuẩn xây dựng app" – nguồn: docs/01-QUY-TRINH-XAY-DUNG-APP.md.
 * Nạp sẵn vào Thư viện (chỉ đọc). Biến dạng {{ten_bien}} hoặc {{ten_bien|mặc định}}.
 */

export interface ProcessPrompt {
  /** Mã ổn định, dùng để ghim: 'std:<id>' */
  id: string
  title: string
  desc: string
  typeCode: PromptTypeCode
  body: string
}

export interface ProcessPhase {
  /** Trùng chỉ số với PHASES trong lib/phases.ts */
  index: number
  name: string
  output: string
  /** Giai đoạn 0 (Chuẩn bị) không có prompt mẫu */
  prompt: ProcessPrompt | null
}

export const STANDARD_PHASES: readonly ProcessPhase[] = [
  {
    index: 0,
    name: 'Chuẩn bị',
    output: 'Thư mục dự án, kho GitHub, Hồ sơ dự án trong Prompt Studio',
    prompt: null,
  },
  {
    index: 1,
    name: 'Ý tưởng',
    output: 'Bản tóm tắt ý tưởng (Idea Brief)',
    prompt: {
      id: 'phase-1',
      title: 'GĐ 1 – Khám phá ý tưởng',
      typeCode: 'Y_TUONG',
      desc: 'AI phỏng vấn từng câu, viết Idea Brief.',
      body: `[Vai trò] Bạn là chuyên gia sản phẩm (Product Manager) nhiều kinh nghiệm.
[Bối cảnh] Tôi muốn làm: {{mo_ta_y_tuong}}. Người dùng chính: {{nguoi_dung}}.
[Nhiệm vụ] Phỏng vấn tôi để làm rõ ý tưởng, sau đó viết Idea Brief.
[Cách làm việc] Hỏi từng câu một, tối đa {{so_cau_hoi|10}} câu, giải thích vì sao hỏi.
[Định dạng đầu ra] Idea Brief gồm: vấn đề, người dùng mục tiêu, giá trị cốt lõi,
  3 đối thủ / giải pháp thay thế kèm điểm khác biệt, rủi ro lớn nhất.`,
    },
  },
  {
    index: 2,
    name: 'PRD',
    output: 'PRD.md',
    prompt: {
      id: 'phase-2',
      title: 'GĐ 2 – Yêu cầu sản phẩm (PRD)',
      typeCode: 'PRD',
      desc: 'MoSCoW, user stories, acceptance criteria. Lưu PRD.md.',
      body: `[Vai trò] Bạn là Product Manager.
[Đầu vào] Idea Brief: {{idea_brief}}
[Nhiệm vụ] Viết PRD cho phiên bản {{phien_ban|MVP}}.
[Định dạng đầu ra] Mục tiêu và chỉ số thành công; đối tượng; tính năng chia theo MoSCoW
  (Must/Should/Could/Won't); user stories "Là…, tôi muốn…, để…";
  tiêu chí chấp nhận (acceptance criteria) cho từng story; ngoài phạm vi.
[Ràng buộc] MVP tối đa {{so_tinh_nang|5}} tính năng Must. Dùng ngôn ngữ dễ hiểu.
[Tiêu chí hoàn thành] Mọi Must đều có acceptance criteria kiểm tra được. Lưu file PRD.md.`,
    },
  },
  {
    index: 3,
    name: 'Thiết kế',
    output: 'Danh sách màn hình, user flow, mockup HTML',
    prompt: {
      id: 'phase-3',
      title: 'GĐ 3 – Thiết kế trải nghiệm',
      typeCode: 'THIET_KE_UI',
      desc: 'Danh sách màn hình, user flow Mermaid, mockup HTML.',
      body: `[Vai trò] Bạn là UX/UI Designer.
[Đầu vào] @PRD.md
[Nhiệm vụ] (1) Liệt kê màn hình và thành phần chính của từng màn hình;
  (2) vẽ user flow chính bằng Mermaid; (3) tạo mockup HTML tĩnh để xem trước.
[Ràng buộc] Phong cách {{phong_cach|tối giản}}, màu chủ đạo {{mau_chu_dao}},
  responsive cho {{thiet_bi|laptop và điện thoại}}, giao diện tiếng Việt.
[Tiêu chí hoàn thành] Mọi user story Must đều có màn hình tương ứng.`,
    },
  },
  {
    index: 4,
    name: 'Kiến trúc',
    output: 'ARCHITECTURE.md',
    prompt: {
      id: 'phase-4',
      title: 'GĐ 4 – Kiến trúc và công nghệ',
      typeCode: 'KIEN_TRUC',
      desc: 'Một phương án khuyến nghị, data model, chi phí.',
      body: `[Vai trò] Bạn là Software Architect.
[Đầu vào] @PRD.md
[Nhiệm vụ] Đề xuất tech stack và kiến trúc. Đưa ra 1 phương án khuyến nghị kèm lý do.
[Ràng buộc] Ngân sách {{ngan_sach|miễn phí}}; nơi triển khai {{hosting}};
  người dùng không biết code nên ưu tiên công nghệ phổ biến, dễ bảo trì.
[Định dạng đầu ra] Sơ đồ thành phần; mô hình dữ liệu (data model); danh sách
  thư viện chính; ước tính chi phí hằng tháng; rủi ro kỹ thuật.
  Giải thích từng phần bằng ngôn ngữ đời thường.`,
    },
  },
  {
    index: 5,
    name: 'Kế hoạch',
    output: 'PLAN.md, AGENTS.md bản đầu',
    prompt: {
      id: 'phase-5',
      title: 'GĐ 5 – Lập kế hoạch',
      typeCode: 'KE_HOACH',
      desc: 'Chia vertical slice, lưu PLAN.md và AGENTS.md.',
      body: `[Vai trò] Bạn là Tech Lead.
[Đầu vào] @PRD.md @ARCHITECTURE.md
[Nhiệm vụ] Chia MVP thành các task nhỏ, mỗi task là một "lát cắt dọc" (vertical slice):
  làm xong là chạy và nhìn thấy kết quả được.
[Định dạng đầu ra] Bảng: STT | Task | Phụ thuộc | Cách kiểm tra | Ước lượng.
  Lưu file PLAN.md. Đồng thời tạo AGENTS.md theo khung chuẩn 10 mục.`,
    },
  },
  {
    index: 6,
    name: 'Dựng khung',
    output: 'Dự án chạy được, commit đầu tiên',
    prompt: {
      id: 'phase-6',
      title: 'GĐ 6 – Dựng khung dự án',
      typeCode: 'KHOI_TAO',
      desc: 'Cài đặt, lint/test, commit đầu tiên.',
      body: `[Nhiệm vụ] Khởi tạo dự án theo @ARCHITECTURE.md: cài dependency, cấu hình lint/format/test,
  tạo trang chủ trống, khởi tạo git và commit.
[Tiêu chí hoàn thành] Lệnh dev, build và test đều chạy thành công; có ảnh chụp trang chủ;
  ghi các lệnh này vào mục "Lệnh" của AGENTS.md.`,
    },
  },
  {
    index: 7,
    name: 'Xây tính năng',
    output: 'Code + test + commit',
    prompt: {
      id: 'phase-7',
      title: 'GĐ 7 – Xây tính năng',
      typeCode: 'TINH_NANG',
      desc: 'Một task trong PLAN.md: kế hoạch → làm → test → commit.',
      body: `[Nhiệm vụ] Thực hiện task {{so_task}} trong @PLAN.md: {{ten_tinh_nang}}.
[Đầu vào] Yêu cầu chi tiết: {{mo_ta}}. Acceptance criteria: {{tieu_chi}}.
[Ràng buộc] Tuân thủ AGENTS.md. Không sửa ngoài phạm vi task.
[Cách làm việc] Đọc code liên quan → nêu kế hoạch ngắn → làm → chạy test → tự kiểm tra.
  Nếu có điểm chưa rõ, hỏi tôi trước khi làm.
[Tiêu chí hoàn thành] Test pass, có ảnh chụp/hướng dẫn tự kiểm tra, đã commit,
  đánh dấu xong trong PLAN.md.`,
    },
  },
  {
    index: 8,
    name: 'Kiểm thử',
    output: 'Báo cáo lỗi, các bản sửa',
    prompt: {
      id: 'phase-8',
      title: 'GĐ 8 – Kiểm thử và rà soát',
      typeCode: 'KIEM_THU',
      desc: 'Edge cases, responsive, bảo mật; bảng lỗi theo mức độ.',
      body: `[Vai trò] Bạn là QA Engineer kiêm Security Reviewer.
[Nhiệm vụ] Rà soát toàn bộ app: happy path, edge cases (dữ liệu rỗng/quá dài/ký tự đặc biệt,
  mất mạng), responsive, accessibility cơ bản, bảo mật (lộ secret, XSS, dữ liệu người dùng).
[Định dạng đầu ra] Bảng: Mức độ (Nghiêm trọng/Cao/Trung bình/Thấp) | Vấn đề | Cách tái hiện | Đề xuất.
[Cách làm việc] Sửa ngay các lỗi Nghiêm trọng và Cao; các lỗi còn lại chờ tôi duyệt.`,
    },
  },
  {
    index: 9,
    name: 'Triển khai',
    output: 'App chạy trên môi trường thật',
    prompt: {
      id: 'phase-9',
      title: 'GĐ 9 – Triển khai',
      typeCode: 'TRIEN_KHAI',
      desc: 'Chạy app trên môi trường thật, từng bước cụ thể.',
      body: `[Nhiệm vụ] Triển khai app lên {{nen_tang|Vercel}}, thiết lập tự động deploy khi push lên nhánh chính.
[Cách làm việc] Phần nào bạn tự làm được thì làm luôn. Phần cần tôi thao tác thì
  liệt kê từng bước: vào trang nào, bấm nút gì.
[Tiêu chí hoàn thành] Mở được link; các chức năng chính chạy được trên môi trường thật.`,
    },
  },
  {
    index: 10,
    name: 'Cải tiến',
    output: 'PLAN.md cho phiên bản tiếp theo, CHANGELOG',
    prompt: {
      id: 'phase-10',
      title: 'GĐ 10 – Vận hành và cải tiến',
      typeCode: 'CAI_TIEN',
      desc: 'Phân loại phản hồi, cập nhật PLAN.md.',
      body: `[Đầu vào] Phản hồi và lỗi ghi nhận được: {{phan_hoi}}
[Nhiệm vụ] Phân loại (lỗi / cải tiến / tính năng mới), ưu tiên theo tác động và công sức,
  cập nhật PLAN.md cho phiên bản {{phien_ban_moi}}, cập nhật AGENTS.md nếu có quy tắc mới rút ra.`,
    },
  },
]

/** Prompt dùng trong mọi giai đoạn (docs/01 – bảng cuối). */
export const EVERYDAY_PROMPTS: readonly ProcessPrompt[] = [
  {
    id: 'explain',
    title: 'Không hiểu kết quả',
    desc: 'Giải thích lại cho người không biết code.',
    typeCode: 'GIAI_THICH',
    body: 'Giải thích lại cho người không biết code, dùng ví dụ đời thường.',
  },
  {
    id: 'wrong-way',
    title: 'AI làm sai hướng',
    desc: 'Dừng lại, hoàn tác và làm lại đúng mục tiêu.',
    typeCode: 'TU_DO',
    body: 'Dừng lại. Mục tiêu đúng là {{muc_tieu}}. Hoàn tác thay đổi vừa rồi rồi làm lại.',
  },
  {
    id: 'bug',
    title: 'Gặp lỗi',
    desc: 'Mô tả thao tác, hiện tượng, kết quả đúng.',
    typeCode: 'SUA_LOI',
    body: 'Khi tôi {{thao_tac}} thì thấy {{hien_tuong}}. Mong muốn là {{ket_qua_dung}}. Tìm nguyên nhân gốc, sửa, giải thích.',
  },
  {
    id: 'lesson',
    title: 'Rút kinh nghiệm',
    desc: 'Đề xuất 1 quy tắc ngắn cho AGENTS.md.',
    typeCode: 'TU_DO',
    body: 'Từ lỗi vừa rồi, đề xuất 1 quy tắc ngắn để thêm vào AGENTS.md, giúp không lặp lại lỗi này.',
  },
  {
    id: 'wrap-up',
    title: 'Kết thúc phiên làm việc',
    desc: 'Tóm tắt, cập nhật PLAN.md, commit.',
    typeCode: 'TU_DO',
    body: 'Tóm tắt việc đã làm, việc còn dở, cập nhật PLAN.md và commit.',
  },
]

/** "Phát triển thêm cho dự án đã có" – chọn lối đi theo độ lớn thay đổi (docs/01). */
export interface ExtensionPath {
  size: 'small' | 'medium' | 'large'
  name: string
  example: string
  /** Chỉ số giai đoạn cần làm; 'spike' = bước Nghiên cứu kỹ thuật */
  steps: readonly (number | 'spike')[]
  skip: readonly number[]
}

export const EXTENSION_PATHS: readonly ExtensionPath[] = [
  {
    size: 'small',
    name: 'Nhỏ: sửa lỗi, chỉnh chi tiết',
    example: 'Đổi màu nút, sửa lỗi lưu',
    steps: [7, 8],
    skip: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    size: 'medium',
    name: 'Vừa: thêm tính năng dùng công nghệ sẵn có',
    example: 'Thêm nút "Nhân bản prompt"',
    steps: [2, 3, 5, 7, 8],
    skip: [0, 1, 4, 6],
  },
  {
    size: 'large',
    name: 'Lớn: module mới, có công nghệ hoặc dữ liệu mới',
    example: 'Module Điền mẫu Word/Excel',
    steps: [1, 2, 'spike', 3, 4, 5, 7, 8, 10],
    skip: [0, 6],
  },
]

export const SPIKE_PROMPT: ProcessPrompt = {
  id: 'spike',
  title: 'Nghiên cứu kỹ thuật (spike)',
  typeCode: 'KIEN_TRUC',
  desc: 'Làm thử nhanh để chứng minh cách làm khả thi trước khi thiết kế chi tiết.',
  body: `[Vai trò] Bạn là Software Architect.
[Bối cảnh] Dự án @AGENTS.md đã chạy ổn. Tôi muốn thêm module: {{ten_module}}.
[Nhiệm vụ] Làm thử nghiệm kỹ thuật (spike) để trả lời: {{cau_hoi_ky_thuat}}.
  Thử với các file mẫu thật trong {{thu_muc_file_mau}}.
[Ràng buộc] Code thử nghiệm để trong thư mục spike/, không đụng vào code chính.
[Định dạng đầu ra] Báo cáo: cách làm, kết quả thử với từng file mẫu, giới hạn, rủi ro,
  thư viện cần thêm, phương án khuyến nghị.
[Tiêu chí hoàn thành] Có bằng chứng (file kết quả) cho thấy cách làm đạt hoặc không đạt yêu cầu.`,
}

/** Toàn bộ prompt chỉ đọc của bộ sưu tập Quy trình chuẩn, theo thứ tự hiển thị. */
export function standardProcessPrompts(): ProcessPrompt[] {
  return [
    ...STANDARD_PHASES.flatMap((p) => (p.prompt ? [p.prompt] : [])),
    SPIKE_PROMPT,
    ...EVERYDAY_PROMPTS,
  ]
}
