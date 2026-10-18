/** Khung AGENTS.md chuẩn 10 mục – nguồn: docs/03-KHUNG-AGENTS-MD.md. */

export interface AgentsSectionDef {
  key: string
  title: string
  /** Mục ★ bắt buộc, không tắt được */
  required: boolean
  /** Gợi ý cách viết, hiện dưới ô soạn thảo */
  hint: string
  /** Nội dung mẫu, có biến {{...}} */
  template: string
  /** Câu hỏi của chế độ Hỏi đáp (Wizard) */
  question: string
  quickOptions: readonly string[]
}

export const AGENTS_SECTIONS: readonly AgentsSectionDef[] = [
  {
    key: 'overview',
    title: 'Tổng quan dự án',
    required: true,
    hint: 'App làm gì, cho ai, tech stack chính. 1–3 câu là đủ.',
    template: `{{1–3 câu: app làm gì, cho ai}}
- Tech stack: {{framework, ngôn ngữ, phiên bản chính}}
- Trạng thái: {{MVP / đang phát triển / production}}`,
    question: 'App làm gì, cho ai? Đang ở giai đoạn nào?',
    quickOptions: ['MVP', 'Đang phát triển', 'Production'],
  },
  {
    key: 'commands',
    title: 'Lệnh',
    required: true,
    hint: 'Lệnh phải copy là chạy được. Đặt trong khối code.',
    template: `- Cài đặt: \`{{lenh_cai_dat}}\`
- Chạy dev: \`{{lenh_dev}}\`
- Build: \`{{lenh_build}}\`
- Test tất cả: \`{{lenh_test}}\` · Test 1 file: \`{{lenh_test_1_file}}\`
- Lint / format / type-check: \`{{lenh_lint}}\``,
    question: 'Dùng lệnh gì để cài đặt, chạy, test?',
    quickOptions: ['npm', 'pnpm', 'bun', 'Python (pip/uv)', 'Chưa biết, để AI đề xuất'],
  },
  {
    key: 'structure',
    title: 'Cấu trúc thư mục',
    required: false,
    hint: 'Chỉ ghi thư mục quan trọng và thư mục không được sửa tay.',
    template: `- \`src/components/\` – {{…}}
- \`src/lib/\` – {{…}}
- Không sửa tay: {{thư mục sinh tự động, ví dụ dist/, generated/}}`,
    question: 'Thư mục nào quan trọng? Có thư mục nào không được sửa?',
    quickOptions: ['Lấy từ Hồ sơ dự án', 'Để AI tự đọc cấu trúc'],
  },
  {
    key: 'conventions',
    title: 'Quy ước code',
    required: true,
    hint: 'Mỗi quy tắc một câu, kiểm tra được. Nên có ví dụ nên / không nên.',
    template: `- {{Quy tắc ngắn, kiểm tra được}}
- Ví dụ:
  ✅ \`{{code nên viết}}\`
  ❌ \`{{code không nên viết}}\``,
    question: 'Quy ước code?',
    quickOptions: [
      'TypeScript strict',
      'Functional components',
      'Đặt tên camelCase/kebab-case',
      'Không dùng `any`',
      'Comment tiếng Việt',
      'Comment tiếng Anh',
    ],
  },
  {
    key: 'testing',
    title: 'Kiểm thử',
    required: false,
    hint: 'Framework test, nơi đặt test, khi nào bắt buộc có test.',
    template: `- Framework: {{…}}; test đặt ở {{…}}
- Code mới/sửa đổi phải có test. Chạy \`{{lenh_test}}\` trước khi báo hoàn thành.`,
    question: 'Test thế nào?',
    quickOptions: ['Vitest', 'Jest', 'Playwright', 'Pytest', 'Bắt buộc test cho code mới'],
  },
  {
    key: 'git',
    title: 'Git & Pull Request',
    required: false,
    hint: 'Tên nhánh, kiểu commit, việc phải làm trước khi commit.',
    template: `- Tên nhánh: \`{{feat/…, fix/…}}\` · Commit: {{Conventional Commits}}
- Trước khi commit: chạy lint + test.`,
    question: 'Quy tắc git?',
    quickOptions: [
      'Conventional Commits',
      'Nhánh feat/fix',
      'Không commit thẳng vào main',
      'Tự push sau mỗi bước',
    ],
  },
  {
    key: 'security',
    title: 'Bảo mật & bí mật',
    required: false,
    hint: 'Secret để ở đâu, dữ liệu nào nhạy cảm.',
    template: `- Không bao giờ commit secret/API key. Biến môi trường đặt trong \`{{.env.local}}\`.
- {{Dữ liệu nhạy cảm cần lưu ý}}`,
    question: 'Có dữ liệu nhạy cảm nào?',
    quickOptions: ['API key', 'Dữ liệu cá nhân', 'Không có'],
  },
  {
    key: 'gotchas',
    title: 'Bẫy thường gặp',
    required: false,
    hint: 'Điều AI dễ làm sai mà không tự đọc ra từ code.',
    template:
      '- {{Điều dễ sai mà AI không tự biết, ví dụ: "Phải build lại package X trước khi test"}}',
    question: 'AI từng mắc lỗi gì lặp lại?',
    quickOptions: [
      'Tự thêm tính năng',
      'Quên chạy test',
      'Sửa lan sang chỗ khác',
      'Viết giao diện tiếng Anh',
    ],
  },
  {
    key: 'boundaries',
    title: 'Ranh giới',
    required: true,
    hint: 'Ba mức: Luôn làm / Hỏi trước / Không bao giờ.',
    template: `- ✅ **Luôn làm:** {{chạy test trước khi báo xong; tuân thủ quy ước ở mục 4}}
- ⚠️ **Hỏi trước:** {{thêm dependency; đổi schema dữ liệu; refactor lớn; xóa file}}
- 🚫 **Không bao giờ:** {{commit secret; sửa file sinh tự động; git push --force}}`,
    question: 'Việc gì AI phải hỏi trước / tuyệt đối không làm?',
    quickOptions: [
      'Hỏi trước khi thêm thư viện',
      'Hỏi trước khi xóa file',
      'Không commit secret',
      'Không force push',
    ],
  },
  {
    key: 'collaboration',
    title: 'Cách làm việc với tôi',
    required: false,
    hint: 'Ngôn ngữ, cách giải thích, mức tự chủ.',
    template: `- Ngôn ngữ trả lời: {{tiếng Việt}}. Tôi {{không biết code}} → giải thích đơn giản.
- {{Lập kế hoạch và chờ duyệt trước khi làm task lớn}}`,
    question: 'Bạn muốn AI làm việc với bạn thế nào?',
    quickOptions: ['Tiếng Việt', 'Giải thích đơn giản', 'Lên kế hoạch trước', 'Tự làm hết'],
  },
]

/** Ngưỡng độ dài (docs/03 nguyên tắc 1). */
export const AGENTS_LENGTH = { target: 150, warn: 300 } as const

/**
 * Cụm từ mơ hồ, không kiểm tra được – dùng cho kiểm tra cục bộ không tốn tiền AI.
 * So khớp không phân biệt hoa thường.
 */
export const VAGUE_PHRASES: readonly string[] = [
  'code sạch',
  'clean code',
  'cẩn thận',
  'tốt nhất có thể',
  'chất lượng cao',
  'tối ưu',
  'hợp lý',
  'khi cần thiết',
  'nếu có thể',
  'best practice',
  'đẹp',
]

/** File xuất kèm để mọi công cụ cùng đọc AGENTS.md (docs/03 mục 5). */
export const COMPANION_FILES = {
  'CLAUDE.md': '@AGENTS.md\n',
  '.gemini/settings.json': JSON.stringify({ context: { fileName: 'AGENTS.md' } }, null, 2) + '\n',
} as const

export function getAgentsSection(key: string): AgentsSectionDef | undefined {
  return AGENTS_SECTIONS.find((s) => s.key === key)
}
