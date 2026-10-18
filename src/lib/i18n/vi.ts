/** Toàn bộ chữ hiển thị trên giao diện (tiếng Việt). */
export const vi = {
  app: {
    name: 'Prompt Studio',
    tagline: 'Tạo, cải thiện và quản lý prompt, AGENTS.md theo từng dự án.',
    localUrl: 'localhost:5173',
  },
  nav: {
    projects: 'Dự án',
    prompt: 'Tạo prompt',
    agents: 'AGENTS.md',
    improve: 'Cải thiện',
    library: 'Thư viện',
    templates: 'Mẫu Word/Excel',
    settings: 'Cài đặt',
    comingSoon: 'Sắp có',
    pinned: 'Đã ghim',
    noPinned: 'Chưa ghim prompt nào. Vào Thư viện để ghim.',
    collapse: 'Thu gọn thanh bên',
    expand: 'Mở rộng thanh bên',
    mainLabel: 'Điều hướng chính',
  },
  header: {
    project: 'Dự án',
    noProjectYet: 'Chưa có dự án',
    sharedScope: 'Không chọn dự án (dùng chung)',
    aiNotSet: 'AI: chưa cài đặt',
    search: 'Tìm kiếm',
    searchPlaceholder: 'Tìm dự án, prompt...',
    searchSoon: 'Tìm nhanh sẽ có ở task 13.',
    toDark: 'Chuyển sang giao diện tối',
    toLight: 'Chuyển sang giao diện sáng',
    dark: 'Tối',
    light: 'Sáng',
  },
  pages: {
    projects: {
      title: 'Dự án',
      desc: 'Mỗi dự án có hồ sơ, prompt và AGENTS.md riêng.',
      soon: 'Danh sách và hồ sơ dự án sẽ có ở task 3.',
    },
    prompt: {
      title: 'Tạo prompt',
      desc: 'Chọn loại việc giao cho AI. Mỗi loại có bảng nhập và gợi ý riêng.',
      soon: 'Trình tạo prompt sẽ có ở task 5.',
    },
    agents: {
      title: 'AGENTS.md',
      desc: 'Khung chuẩn 10 mục, dùng chung cho Claude Code, Gemini CLI, Codex, Cursor...',
      soon: 'Trình soạn AGENTS.md sẽ có ở task 9 và 10.',
    },
    improve: {
      title: 'Cải thiện',
      desc: 'Dán prompt hoặc file quy tắc có sẵn. AI chấm điểm, chỉ ra vấn đề và đề xuất bản tốt hơn.',
      soon: 'Màn hình Cải thiện sẽ có ở task 11.',
    },
    library: {
      title: 'Thư viện',
      desc: 'Prompt mẫu theo quy trình chuẩn, prompt của dự án và prompt dùng chung.',
      soon: 'Thư viện và ghim prompt sẽ có ở task 6.',
    },
    settings: {
      title: 'Cài đặt',
      desc: 'API key, model AI, giao diện, sao lưu và khôi phục.',
      soon: 'Cài đặt AI sẽ có ở task 7, sao lưu ở task 12.',
    },
    notFound: {
      title: 'Không tìm thấy trang',
      desc: 'Địa chỉ này không có trong app.',
      back: 'Về trang Dự án',
    },
  },
  templates: {
    title: 'Điền mẫu Word / Excel',
    desc: 'Tạo file giống 100% file mẫu (định dạng, bảng, công thức, ô gộp...), chỉ thay nội dung ở những vị trí thay đổi.',
    badge: 'Giai đoạn 2 · Sắp có',
    notice:
      'Module này đã có trong kế hoạch (PRD mục D) và sẽ được làm sau khi xong các phần chính. Màn hình dưới đây là bố cục dự kiến, các nút chưa hoạt động.',
    stepsTitle: 'Quy trình 4 bước',
    steps: [
      {
        title: 'Tải file mẫu',
        desc: 'File .docx hoặc .xlsx bạn đang dùng. Xử lý ngay trong trình duyệt, không gửi lên mạng.',
      },
      {
        title: 'Đánh dấu vị trí thay đổi',
        desc: 'AI đề xuất các vị trí biến (tên, ngày, số tiền, dòng bảng lặp). Bạn xác nhận hoặc sửa.',
      },
      {
        title: 'Điền dữ liệu',
        desc: 'Điền bằng form, dán dữ liệu, hoặc điền hàng loạt từ một bảng Excel để tạo nhiều file.',
      },
      {
        title: 'Kiểm tra và xuất file',
        desc: 'So sánh với file mẫu, báo những chỗ khác ngoài vị trí biến, rồi tải về.',
      },
    ],
    uploadTitle: 'Bước 1 · Tải file mẫu',
    uploadHint: 'Kéo thả file .docx hoặc .xlsx vào đây',
    uploadPrivacy: 'File được xử lý ngay trong trình duyệt, không gửi lên mạng.',
    chooseFile: 'Chọn file...',
    varsTitle: 'Bước 2 · Vị trí thay đổi',
    example: 'Ví dụ minh họa',
    aiFind: '✨ AI tìm vị trí biến',
    varsCols: ['Biến', 'Vị trí trong file mẫu', 'Kiểu', 'Giá trị trong mẫu'],
    vars: [
      {
        name: '{{ten_khach_hang}}',
        where: 'Word · Trang 1, đoạn 2',
        kind: 'Văn bản',
        sample: 'Công ty ABC',
      },
      {
        name: '{{ngay_ky}}',
        where: 'Word · Trang 1, dòng tiêu đề',
        kind: 'Ngày (dd/mm/yyyy)',
        sample: '18/10/2026',
      },
      {
        name: '{{so_tien}}',
        where: 'Excel · Sheet "Báo giá", ô F12',
        kind: 'Số tiền',
        sample: '12.500.000',
      },
      {
        name: '{{#hang_hoa}} … {{/hang_hoa}}',
        where: 'Excel · Sheet "Báo giá", dòng 8–10',
        kind: 'Bảng lặp (nhiều dòng)',
        sample: '3 dòng hàng hóa',
      },
    ],
    savedTitle: 'Mẫu đã lưu',
    newTemplate: '+ Mẫu mới',
    noSaved: 'Chưa có mẫu nào. Mỗi mẫu sẽ gắn với một dự án và dùng lại được nhiều lần.',
  },
  common: {
    comingSoonBadge: 'Đang xây dựng',
  },
} as const
