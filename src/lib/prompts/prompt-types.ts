import type { PromptGroupKey, PromptTypeCode, PromptTypeDef } from './types'

/** Nguồn: docs/02-TRINH-TAO-PROMPT.md (trường) và docs/04-THU-VIEN-GOI-Y.md mục 2–3 (gợi ý tích sẵn, mẹo). */

export const ROLES = [
  'Product Manager',
  'UX/UI Designer',
  'Software Architect',
  'Tech Lead',
  'Senior Frontend Developer',
  'Senior Backend Developer',
  'Senior Full-stack Developer',
  'QA Engineer',
  'Security Reviewer',
  'DevOps Engineer',
  'Technical Writer',
  'Data Engineer',
] as const

/** Các lựa chọn "Đầu vào đính kèm" dùng chung cho mọi loại prompt. */
export const ATTACHMENT_OPTIONS = [
  '@PRD.md',
  '@PLAN.md',
  '@AGENTS.md',
  '@ARCHITECTURE.md',
  'Ảnh chụp màn hình',
  'Log lỗi',
  'Đoạn code',
] as const

export const LENGTH_OPTIONS = ['Ngắn gọn', 'Vừa phải', 'Chi tiết'] as const

export const LANGUAGES = [
  {
    value: 'vi-en',
    label: 'Tiếng Việt, giữ thuật ngữ tiếng Anh',
    instruction: 'Trả lời bằng tiếng Việt, giữ nguyên thuật ngữ kỹ thuật tiếng Anh.',
  },
  { value: 'vi', label: 'Tiếng Việt hoàn toàn', instruction: 'Trả lời hoàn toàn bằng tiếng Việt.' },
  { value: 'en', label: 'Tiếng Anh', instruction: 'Respond in English.' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['value']
export const DEFAULT_LANGUAGE: LanguageCode = 'vi-en'

export const PROMPT_GROUPS: readonly { key: PromptGroupKey; name: string }[] = [
  { key: 'product', name: 'Sản phẩm & thiết kế' },
  { key: 'tech', name: 'Kỹ thuật & kế hoạch' },
  { key: 'code', name: 'Viết code' },
  { key: 'quality', name: 'Chất lượng & vận hành' },
  { key: 'free', name: 'Tự do' },
]

const none = [] as const

export const PROMPT_TYPES: readonly PromptTypeDef[] = [
  // ── A. Sản phẩm & thiết kế ──────────────────────────────────────────────
  {
    code: 'Y_TUONG',
    group: 'product',
    name: 'Khám phá ý tưởng',
    desc: 'AI phỏng vấn bạn để làm rõ ý tưởng, rồi viết bản tóm tắt (Idea Brief).',
    role: 'Product Manager',
    taskPlaceholder: 'Ví dụ: Làm rõ ý tưởng app quản lý chi tiêu gia đình',
    fields: [
      { key: 'idea', label: 'Mô tả ý tưởng', kind: 'textarea', polish: true },
      {
        key: 'users',
        label: 'Người dùng mục tiêu',
        kind: 'text',
        placeholder: 'Ví dụ: vợ chồng trẻ, không rành công nghệ',
      },
      {
        key: 'productType',
        label: 'Loại sản phẩm',
        kind: 'select',
        options: [
          'Web app',
          'Mobile app',
          'Tiện ích trình duyệt',
          'Công cụ dòng lệnh',
          'API/dịch vụ',
          'Tự động hóa',
        ],
      },
      {
        key: 'maxQuestions',
        label: 'Số câu hỏi tối đa',
        kind: 'select',
        options: ['5', '10', '15'],
      },
      {
        key: 'analysis',
        label: 'Phân tích thêm',
        kind: 'multiselect',
        options: ['Đối thủ', 'Rủi ro', 'Mô hình kiếm tiền', 'Chỉ số thành công'],
      },
    ],
    defaults: { rb: none, cl: ['CL-01', 'CL-07'], dr: ['DR-02'], tc: none },
    tip: 'Hỏi từng câu một và chờ tôi trả lời rồi mới hỏi câu tiếp theo.',
  },
  {
    code: 'PRD',
    group: 'product',
    name: 'Tài liệu yêu cầu (PRD)',
    desc: 'Viết PRD: tính năng, user stories, acceptance criteria.',
    role: 'Product Manager',
    taskPlaceholder: 'Ví dụ: Viết PRD cho bản MVP',
    fields: [
      {
        key: 'scope',
        label: 'Phạm vi',
        kind: 'select',
        options: ['Toàn bộ sản phẩm', 'Một tính năng', 'Một phiên bản'],
      },
      {
        key: 'method',
        label: 'Phương pháp ưu tiên',
        kind: 'select',
        options: ['MoSCoW', 'RICE', 'Kano'],
      },
      {
        key: 'maxMust',
        label: 'Số tính năng Must tối đa',
        kind: 'select',
        options: ['3', '5', '7'],
      },
      {
        key: 'sections',
        label: 'Mục cần có',
        kind: 'multiselect',
        options: [
          'User stories',
          'Acceptance criteria',
          'Chỉ số thành công',
          'Ngoài phạm vi',
          'Rủi ro',
        ],
      },
    ],
    defaults: { rb: none, cl: ['CL-01', 'CL-07'], dr: ['DR-04'], tc: ['TC-04'] },
  },
  {
    code: 'THIET_KE_UI',
    group: 'product',
    name: 'Thiết kế giao diện',
    desc: 'Danh sách màn hình, user flow, wireframe hoặc mockup.',
    role: 'UX/UI Designer',
    taskPlaceholder: 'Ví dụ: Thiết kế các màn hình cho bản MVP',
    fields: [
      {
        key: 'outputs',
        label: 'Đầu ra',
        kind: 'multiselect',
        options: [
          'Danh sách màn hình',
          'User flow (Mermaid)',
          'Wireframe',
          'Mockup HTML',
          'Design tokens',
        ],
      },
      {
        key: 'style',
        label: 'Phong cách',
        kind: 'select',
        options: ['Tối giản', 'Hiện đại/bo tròn', 'Doanh nghiệp', 'Material', 'Glassmorphism'],
      },
      {
        key: 'devices',
        label: 'Thiết bị',
        kind: 'multiselect',
        options: ['Laptop', 'Máy tính bảng', 'Điện thoại'],
      },
      {
        key: 'uiLib',
        label: 'Thư viện UI',
        kind: 'select',
        options: ['Tailwind CSS', 'shadcn/ui', 'MUI', 'Ant Design', 'Không dùng'],
      },
      {
        key: 'extras',
        label: 'Yêu cầu thêm',
        kind: 'multiselect',
        options: ['Dark mode', 'Accessibility (WCAG AA)', 'Đa ngôn ngữ'],
      },
    ],
    defaults: { rb: ['RB-11'], cl: ['CL-02'], dr: ['DR-03', 'DR-04'], tc: ['TC-03'] },
    tip: 'Tạo bố cục có chủ đích, tránh giao diện mặc định nhàm chán. Chú ý khoảng cách, phân cấp chữ và trạng thái rỗng/lỗi/đang tải.',
  },
  // ── B. Kỹ thuật & kế hoạch ──────────────────────────────────────────────
  {
    code: 'KIEN_TRUC',
    group: 'tech',
    name: 'Kiến trúc & công nghệ',
    desc: 'Chọn tech stack, mô hình dữ liệu, ước tính chi phí.',
    role: 'Software Architect',
    taskPlaceholder: 'Ví dụ: Đề xuất tech stack cho app',
    fields: [
      {
        key: 'appType',
        label: 'Loại ứng dụng',
        kind: 'select',
        options: ['SPA chỉ frontend', 'Full-stack', 'Có backend API riêng', 'Serverless'],
      },
      {
        key: 'budget',
        label: 'Ngân sách',
        kind: 'select',
        options: ['Miễn phí', 'Dưới 10$/tháng', 'Dưới 50$/tháng'],
      },
      {
        key: 'storage',
        label: 'Lưu dữ liệu',
        kind: 'select',
        options: ['Trình duyệt (IndexedDB)', 'SQLite', 'PostgreSQL', 'Supabase', 'Firebase'],
      },
      {
        key: 'hosting',
        label: 'Hosting',
        kind: 'select',
        options: ['Chạy local', 'Vercel', 'Netlify', 'Cloudflare Pages', 'GitHub Pages', 'VPS'],
      },
      {
        key: 'priorities',
        label: 'Ưu tiên',
        kind: 'multiselect',
        options: ['Dễ bảo trì', 'Hiệu năng', 'Chi phí thấp', 'Bảo mật', 'Mở rộng'],
      },
    ],
    defaults: { rb: none, cl: ['CL-02', 'CL-07'], dr: ['DR-07', 'DR-03', 'DR-04'], tc: none },
    tip: 'Ưu tiên công nghệ phổ biến, tài liệu tốt, dễ bảo trì bởi AI. Nêu chi phí hằng tháng ước tính.',
  },
  {
    code: 'THIET_KE_DU_LIEU',
    group: 'tech',
    name: 'Database / API',
    desc: 'Thiết kế schema, kiểu dữ liệu, danh sách endpoint.',
    role: 'Software Architect',
    taskPlaceholder: 'Ví dụ: Thiết kế data schema cho dự án và prompt',
    fields: [
      {
        key: 'entities',
        label: 'Đối tượng dữ liệu',
        kind: 'textarea',
        placeholder: 'Ví dụ: Dự án, Prompt, Thẻ…',
        polish: true,
      },
      {
        key: 'apiStyle',
        label: 'Kiểu API',
        kind: 'select',
        options: ['REST', 'GraphQL', 'tRPC', 'Không có API'],
      },
      {
        key: 'outputs',
        label: 'Đầu ra',
        kind: 'multiselect',
        options: [
          'Sơ đồ ERD',
          'Schema/kiểu TypeScript',
          'Danh sách endpoint',
          'Migration',
          'Dữ liệu mẫu',
        ],
      },
    ],
    defaults: { rb: ['RB-05'], cl: ['CL-02'], dr: ['DR-03', 'DR-02'], tc: none },
  },
  {
    code: 'KE_HOACH',
    group: 'tech',
    name: 'Lập kế hoạch',
    desc: 'Chia việc thành các task nhỏ, mỗi task có cách kiểm tra.',
    role: 'Tech Lead',
    taskPlaceholder: 'Ví dụ: Chia MVP thành các task',
    fields: [
      {
        key: 'split',
        label: 'Cách chia',
        kind: 'select',
        options: ['Vertical slice (khuyến nghị)', 'Theo tầng (UI/logic/data)', 'Theo màn hình'],
      },
      {
        key: 'size',
        label: 'Cỡ task',
        kind: 'select',
        options: ['Rất nhỏ (<1 giờ AI)', 'Nhỏ', 'Vừa'],
      },
      {
        key: 'columns',
        label: 'Cột trong bảng',
        kind: 'multiselect',
        options: ['Phụ thuộc', 'Cách kiểm tra', 'Ước lượng', 'Rủi ro'],
      },
    ],
    defaults: { rb: ['RB-07'], cl: ['CL-02'], dr: ['DR-02', 'DR-04'], tc: none },
  },
  {
    code: 'KHOI_TAO',
    group: 'tech',
    name: 'Dựng khung dự án',
    desc: 'Khởi tạo dự án, cài công cụ, commit đầu tiên.',
    role: 'Senior Full-stack Developer',
    taskPlaceholder: 'Ví dụ: Khởi tạo dự án theo ARCHITECTURE.md',
    fields: [
      {
        key: 'framework',
        label: 'Framework',
        kind: 'select',
        options: ['React + Vite', 'Next.js', 'Vue + Vite', 'SvelteKit', 'Python FastAPI'],
      },
      {
        key: 'language',
        label: 'Ngôn ngữ',
        kind: 'select',
        options: ['TypeScript', 'JavaScript', 'Python'],
      },
      {
        key: 'tools',
        label: 'Công cụ đi kèm',
        kind: 'multiselect',
        options: [
          'ESLint/oxlint',
          'Prettier',
          'Vitest',
          'Playwright',
          'Husky (pre-commit)',
          'CI GitHub Actions',
        ],
      },
      { key: 'pkg', label: 'Trình quản lý gói', kind: 'select', options: ['npm', 'pnpm', 'bun'] },
    ],
    defaults: {
      rb: ['RB-09', 'RB-10'],
      cl: ['CL-03', 'CL-05'],
      dr: ['DR-01'],
      tc: ['TC-01', 'TC-03', 'TC-06'],
    },
  },
  // ── C. Viết code ────────────────────────────────────────────────────────
  {
    code: 'TINH_NANG',
    group: 'code',
    name: 'Xây tính năng mới',
    desc: 'Làm một tính năng theo PLAN.md, có test.',
    role: 'Senior Full-stack Developer',
    taskPlaceholder: 'Ví dụ: Làm task 4 trong PLAN.md – Thư viện prompt',
    fields: [
      {
        key: 'behavior',
        label: 'Mô tả hành vi mong muốn',
        kind: 'textarea',
        placeholder: 'Người dùng bấm... thì thấy...',
        polish: true,
      },
      {
        key: 'criteria',
        label: 'Acceptance criteria',
        kind: 'textarea',
        placeholder: 'Mỗi tiêu chí một dòng',
        polish: true,
      },
      {
        key: 'areas',
        label: 'Phần bị ảnh hưởng',
        kind: 'multiselect',
        options: ['Giao diện', 'Logic xử lý', 'Dữ liệu/lưu trữ', 'Gọi API ngoài'],
      },
      {
        key: 'edgeCases',
        label: 'Trường hợp đặc biệt',
        kind: 'multiselect',
        options: [
          'Dữ liệu rỗng',
          'Lỗi mạng',
          'Dữ liệu quá lớn',
          'Người dùng thao tác nhanh/lặp lại',
        ],
      },
      {
        key: 'tests',
        label: 'Loại test',
        kind: 'multiselect',
        options: ['Unit test', 'Integration test', 'E2E test', 'Không cần'],
      },
    ],
    defaults: {
      rb: ['RB-01', 'RB-02', 'RB-07', 'RB-08', 'RB-12'],
      cl: ['CL-02', 'CL-04', 'CL-06'],
      dr: ['DR-01'],
      tc: ['TC-01', 'TC-02', 'TC-03', 'TC-04', 'TC-06', 'TC-07'],
    },
    tip: 'Làm theo vertical slice: giao diện, logic và lưu trữ của tính năng phải chạy được end-to-end trước khi trau chuốt.',
  },
  {
    code: 'SUA_LOI',
    group: 'code',
    name: 'Sửa lỗi',
    desc: 'Mô tả lỗi, AI tìm nguyên nhân gốc và sửa.',
    role: 'Senior Full-stack Developer',
    taskPlaceholder: 'Ví dụ: khi bấm nút lưu thì màn hình trắng',
    fields: [
      {
        key: 'steps',
        label: 'Thao tác gây lỗi',
        kind: 'textarea',
        placeholder: 'Mở dự án → sửa mô tả → bấm Lưu',
        polish: true,
      },
      {
        key: 'actual',
        label: 'Hiện tượng thực tế',
        kind: 'textarea',
        placeholder: 'Màn hình trắng',
        polish: true,
      },
      {
        key: 'expected',
        label: 'Kết quả mong muốn',
        kind: 'text',
        placeholder: 'Lưu được và hiện "Đã lưu"',
      },
      {
        key: 'evidence',
        label: 'Bằng chứng',
        kind: 'multiselect',
        options: ['Ảnh chụp', 'Log console', 'Thông báo lỗi', 'Link'],
      },
      {
        key: 'frequency',
        label: 'Tần suất',
        kind: 'select',
        options: ['Luôn luôn', 'Thỉnh thoảng', 'Chỉ một lần'],
      },
      {
        key: 'env',
        label: 'Môi trường',
        kind: 'multiselect',
        options: ['Máy tính', 'Điện thoại', 'Chrome', 'Safari', 'Bản deploy', 'Bản chạy trên máy'],
      },
      {
        key: 'asks',
        label: 'Yêu cầu',
        kind: 'multiselect',
        options: [
          'Tìm nguyên nhân gốc (root cause)',
          'Viết test tái hiện lỗi trước khi sửa',
          'Giải thích nguyên nhân',
        ],
      },
    ],
    defaults: {
      rb: ['RB-01', 'RB-06', 'RB-07'],
      cl: ['CL-04', 'CL-06'],
      dr: ['DR-01'],
      tc: ['TC-01', 'TC-02', 'TC-03', 'TC-06'],
    },
    tip: 'Làm theo thứ tự: (1) tái hiện lỗi, (2) tìm root cause và giải thích, (3) viết test thất bại tái hiện lỗi, (4) sửa, (5) chạy lại test. Không chỉ sửa triệu chứng.',
  },
  {
    code: 'REFACTOR',
    group: 'code',
    name: 'Cải tổ code (refactor)',
    desc: 'Làm code gọn, dễ đọc mà không đổi hành vi.',
    role: 'Senior Full-stack Developer',
    taskPlaceholder: 'Ví dụ: Tách component trang Thư viện',
    fields: [
      {
        key: 'scope',
        label: 'Phạm vi',
        kind: 'text',
        placeholder: 'File hoặc thư mục, ví dụ src/features/library/',
      },
      {
        key: 'goals',
        label: 'Mục tiêu',
        kind: 'multiselect',
        options: [
          'Dễ đọc hơn',
          'Bỏ trùng lặp',
          'Hiệu năng',
          'Giảm kích thước bundle',
          'Tách component',
        ],
      },
      {
        key: 'limits',
        label: 'Giới hạn',
        kind: 'multiselect',
        options: ['Không đổi hành vi', 'Giữ nguyên API', 'Test cũ phải pass'],
      },
    ],
    defaults: {
      rb: ['RB-02', 'RB-04', 'RB-07'],
      cl: ['CL-02', 'CL-04'],
      dr: ['DR-01'],
      tc: ['TC-01', 'TC-06'],
    },
    tip: 'Chia thành các bước nhỏ, chạy test sau mỗi bước.',
  },
  {
    code: 'VIET_TEST',
    group: 'code',
    name: 'Viết test',
    desc: 'Bổ sung unit / e2e test cho phần đã có.',
    role: 'QA Engineer',
    taskPlaceholder: 'Ví dụ: Viết test cho hàm ghép prompt',
    fields: [
      {
        key: 'target',
        label: 'Đối tượng test',
        kind: 'text',
        placeholder: 'Ví dụ: src/lib/prompts/build-prompt.ts',
      },
      {
        key: 'kinds',
        label: 'Loại',
        kind: 'multiselect',
        options: ['Unit', 'Integration', 'E2E', 'Snapshot'],
      },
      {
        key: 'tool',
        label: 'Công cụ',
        kind: 'select',
        options: ['Vitest', 'Jest', 'Playwright', 'Pytest'],
      },
      {
        key: 'coverage',
        label: 'Mức bao phủ',
        kind: 'select',
        options: ['Happy path', 'Happy path + edge cases', 'Toàn diện'],
      },
    ],
    defaults: { rb: ['RB-06'], cl: ['CL-04'], dr: ['DR-01'], tc: ['TC-01'] },
  },
  // ── D. Chất lượng & vận hành ────────────────────────────────────────────
  {
    code: 'REVIEW',
    group: 'quality',
    name: 'Review code / bảo mật',
    desc: 'Rà soát thay đổi, tìm lỗi và lỗ hổng.',
    role: 'Security Reviewer',
    taskPlaceholder: 'Ví dụ: Review các thay đổi chưa commit',
    fields: [
      {
        key: 'scope',
        label: 'Phạm vi',
        kind: 'select',
        options: ['Thay đổi chưa commit', 'Một PR', 'Toàn bộ dự án'],
      },
      {
        key: 'criteria',
        label: 'Tiêu chí',
        kind: 'multiselect',
        options: [
          'Đúng logic',
          'Bảo mật',
          'Hiệu năng',
          'Dễ đọc',
          'Accessibility',
          'Tuân thủ AGENTS.md',
        ],
      },
      {
        key: 'action',
        label: 'Hành động',
        kind: 'select',
        options: ['Chỉ báo cáo', 'Báo cáo rồi sửa lỗi nghiêm trọng', 'Sửa tất cả'],
      },
    ],
    defaults: { rb: none, cl: ['CL-04', 'CL-07'], dr: ['DR-06'], tc: none },
    tip: 'Chỉ báo các vấn đề có bằng chứng cụ thể trong code (file:dòng). Không báo vấn đề suy đoán.',
  },
  {
    code: 'KIEM_THU',
    group: 'quality',
    name: 'Kiểm thử toàn app (QA)',
    desc: 'Thử như người dùng thật, liệt kê lỗi theo mức độ.',
    role: 'QA Engineer',
    taskPlaceholder: 'Ví dụ: Kiểm thử toàn bộ luồng chính',
    fields: [
      {
        key: 'scenarios',
        label: 'Kịch bản',
        kind: 'multiselect',
        options: ['Happy path', 'Edge cases', 'Responsive', 'Mất mạng', 'Dữ liệu lớn'],
      },
      {
        key: 'output',
        label: 'Đầu ra',
        kind: 'select',
        options: ['Bảng lỗi theo mức độ', 'Checklist kiểm thử'],
      },
    ],
    defaults: { rb: none, cl: ['CL-04'], dr: ['DR-06'], tc: none },
  },
  {
    code: 'TRIEN_KHAI',
    group: 'quality',
    name: 'Triển khai / môi trường',
    desc: 'Cài đặt, chạy app, cấu hình môi trường hoặc deploy.',
    role: 'DevOps Engineer',
    taskPlaceholder: 'Ví dụ: Hướng dẫn chạy app trên máy mới',
    fields: [
      {
        key: 'platform',
        label: 'Nền tảng',
        kind: 'select',
        options: ['Chạy local', 'Vercel', 'Netlify', 'Cloudflare Pages', 'GitHub Pages'],
      },
      {
        key: 'setup',
        label: 'Thiết lập',
        kind: 'multiselect',
        options: [
          'Tự động deploy khi push',
          'Preview cho mỗi PR',
          'Tên miền riêng',
          'Biến môi trường',
        ],
      },
    ],
    defaults: {
      rb: ['RB-08', 'RB-09'],
      cl: ['CL-02', 'CL-05', 'CL-07'],
      dr: ['DR-01'],
      tc: ['TC-03'],
    },
  },
  {
    code: 'TAI_LIEU',
    group: 'quality',
    name: 'Viết tài liệu',
    desc: 'README, hướng dẫn sử dụng, CHANGELOG, tài liệu API.',
    role: 'Technical Writer',
    taskPlaceholder: 'Ví dụ: Viết hướng dẫn sử dụng cho người mới',
    fields: [
      {
        key: 'docType',
        label: 'Loại tài liệu',
        kind: 'select',
        options: ['README', 'Hướng dẫn sử dụng', 'CHANGELOG', 'Tài liệu API', 'Comment trong code'],
      },
      {
        key: 'reader',
        label: 'Người đọc',
        kind: 'select',
        options: ['Bản thân', 'Người dùng cuối', 'Lập trình viên khác', 'AI agent'],
      },
    ],
    defaults: { rb: none, cl: ['CL-04'], dr: ['DR-04'], tc: none },
  },
  {
    code: 'GIAI_THICH',
    group: 'quality',
    name: 'Giải thích code / khái niệm',
    desc: 'Giải thích code, thông báo lỗi hay khái niệm cho dễ hiểu.',
    role: 'Senior Full-stack Developer',
    taskPlaceholder: 'Ví dụ: Giải thích file src/lib/db/schema.ts',
    fields: [
      {
        key: 'subject',
        label: 'Nội dung cần giải thích',
        kind: 'textarea',
        placeholder: 'File, đoạn code, thông báo lỗi, khái niệm',
      },
      {
        key: 'level',
        label: 'Trình độ',
        kind: 'select',
        options: ['Không biết code', 'Mới học', 'Đã biết cơ bản'],
      },
      {
        key: 'form',
        label: 'Hình thức',
        kind: 'multiselect',
        options: ['Ví dụ đời thường', 'Sơ đồ', 'Từng bước'],
      },
    ],
    defaults: { rb: none, cl: ['CL-04', 'CL-07'], dr: none, tc: none },
  },
  {
    code: 'CAI_TIEN',
    group: 'quality',
    name: 'Phân tích phản hồi',
    desc: 'Phân loại phản hồi, lên kế hoạch phiên bản mới.',
    role: 'Product Manager',
    taskPlaceholder: 'Ví dụ: Lên kế hoạch phiên bản 1.1',
    fields: [
      {
        key: 'feedback',
        label: 'Phản hồi / lỗi ghi nhận',
        kind: 'textarea',
        placeholder: 'Dán danh sách vào đây',
      },
      {
        key: 'priority',
        label: 'Cách ưu tiên',
        kind: 'select',
        options: ['Tác động/Công sức', 'RICE', 'MoSCoW'],
      },
    ],
    defaults: { rb: none, cl: ['CL-07'], dr: ['DR-02', 'DR-04'], tc: none },
  },
  // ── E. Tự do ────────────────────────────────────────────────────────────
  {
    code: 'TU_DO',
    group: 'free',
    name: 'Prompt tự do',
    desc: 'Khung 8 khối, chỉ có các trường dùng chung.',
    role: 'Senior Full-stack Developer',
    taskPlaceholder: 'Mô tả việc bạn muốn AI làm',
    fields: [],
    defaults: { rb: ['RB-07'], cl: ['CL-01'], dr: ['DR-01'], tc: none },
  },
]

const BY_CODE = new Map(PROMPT_TYPES.map((t) => [t.code, t]))

export function getPromptType(code: PromptTypeCode): PromptTypeDef {
  const t = BY_CODE.get(code)
  if (!t) throw new Error(`Không có loại prompt ${code}`)
  return t
}

export function promptTypesByGroup(group: PromptGroupKey): PromptTypeDef[] {
  return PROMPT_TYPES.filter((t) => t.group === group)
}

/** Tập gợi ý được tích sẵn khi chọn một loại prompt. */
export function defaultSelection(code: PromptTypeCode): Set<string> {
  const d = getPromptType(code).defaults
  return new Set([...d.rb, ...d.cl, ...d.dr, ...d.tc])
}
