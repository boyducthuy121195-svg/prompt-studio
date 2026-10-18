import type { Suggestion, SuggestionGroup } from './types'

/** Bộ gợi ý cố định – nguồn: docs/04-THU-VIEN-GOI-Y.md mục 1. Không có giao diện để sửa (AGENTS.md mục 6). */
export const SUGGESTIONS: Readonly<Record<SuggestionGroup, readonly Suggestion[]>> = {
  rb: [
    {
      code: 'RB-01',
      label: 'Chỉ làm đúng yêu cầu',
      text: 'Chỉ thay đổi những gì được yêu cầu hoặc thực sự cần thiết. Không thêm feature, không refactor, không "cải thiện" ngoài phạm vi.',
    },
    {
      code: 'RB-02',
      label: 'Giữ giải pháp đơn giản',
      text: 'Giữ giải pháp ở mức đơn giản nhất. Không tạo abstraction/helper cho thao tác chỉ dùng một lần, không thiết kế cho yêu cầu giả định trong tương lai.',
    },
    {
      code: 'RB-03',
      label: 'Không thêm thư viện',
      text: 'Không thêm dependency mới. Nếu thật sự cần, dừng lại và hỏi tôi, kèm lý do và phương án thay thế.',
    },
    {
      code: 'RB-04',
      label: 'Không đổi hành vi',
      text: 'Không thay đổi hành vi hiện có của app. Toàn bộ test cũ phải tiếp tục pass.',
    },
    {
      code: 'RB-05',
      label: 'Giữ dữ liệu cũ',
      text: 'Không làm mất dữ liệu đã lưu. Mọi thay đổi data schema phải kèm migration.',
    },
    {
      code: 'RB-06',
      label: 'Không hardcode, không lách test',
      text: 'Viết giải pháp tổng quát, đúng với mọi input hợp lệ. Không hardcode giá trị và không viết code chỉ để test pass. Nếu test sai thì báo tôi, không tự lách.',
    },
    {
      code: 'RB-07',
      label: 'Tuân thủ AGENTS.md',
      text: 'Tuân thủ toàn bộ quy tắc trong @AGENTS.md. Nếu yêu cầu này mâu thuẫn với AGENTS.md thì hỏi tôi.',
    },
    {
      code: 'RB-08',
      label: 'Hỏi trước thao tác khó hoàn tác',
      text: 'Được tự làm các thao tác cục bộ, hoàn tác được (sửa file, chạy test). Phải hỏi trước khi xóa file/branch, `git push --force`, `git reset --hard`, đổi cấu hình dùng chung.',
    },
    {
      code: 'RB-09',
      label: 'Không lộ bí mật',
      text: 'Không in ra, không commit API key, file `.env` hay bất kỳ secret nào.',
    },
    {
      code: 'RB-10',
      label: 'Dọn file tạm',
      text: 'Nếu tạo file/script tạm để thử nghiệm thì xóa chúng khi xong việc.',
    },
    {
      code: 'RB-11',
      label: 'Giao diện tiếng Việt, responsive',
      text: 'Mọi chữ hiển thị cho người dùng bằng tiếng Việt. Giao diện dùng được từ chiều rộng 360px (điện thoại).',
    },
    {
      code: 'RB-12',
      label: 'Bảo mật đầu vào',
      text: 'Kiểm tra (validate) mọi dữ liệu từ bên ngoài: input người dùng, file nhập vào, response của API.',
    },
  ],
  cl: [
    {
      code: 'CL-01',
      label: 'Hỏi trước khi làm',
      text: 'Nếu yêu cầu chưa rõ, hỏi tôi tối đa 3 câu trước khi bắt đầu. Không tự đoán ý tôi.',
    },
    {
      code: 'CL-02',
      label: 'Lên kế hoạch → chờ duyệt',
      text: 'Trước tiên đọc code liên quan và trình bày kế hoạch ngắn (các bước, file sẽ sửa, rủi ro). Chờ tôi duyệt rồi mới làm.',
    },
    {
      code: 'CL-03',
      label: 'Tự làm đến cùng',
      text: 'Làm liên tục cho đến khi hoàn thành. Gặp điểm chưa chắc chắn thì chọn phương án hợp lý nhất, ghi lại giả định và báo cáo ở cuối. Riêng các thao tác khó hoàn tác vẫn phải hỏi.',
    },
    {
      code: 'CL-04',
      label: 'Tìm hiểu trước khi kết luận',
      text: 'Không suy đoán về code chưa mở. Đọc các file liên quan trước khi trả lời hoặc sửa.',
    },
    {
      code: 'CL-05',
      label: 'Báo tiến độ',
      text: 'Mở đầu bằng việc nhắc lại mục tiêu trong 1 câu và nêu kế hoạch. Trong lúc làm, báo ngắn từng bước. Kết thúc bằng tóm tắt.',
    },
    {
      code: 'CL-06',
      label: 'Tự rà soát trước khi nộp',
      text: 'Trước khi báo xong, tự rà lại kết quả theo từng tiêu chí hoàn thành và sửa chỗ chưa đạt.',
    },
    {
      code: 'CL-07',
      label: 'Giải thích cho người không biết code',
      text: 'Tôi không biết lập trình. Giải thích bằng ngôn ngữ đời thường. Nếu phải dùng thuật ngữ thì giải thích ngắn kèm theo.',
    },
  ],
  dr: [
    {
      code: 'DR-01',
      label: 'Báo cáo 3 phần',
      text: 'Kết thúc bằng báo cáo 3 phần: (1) Đã làm gì, (2) Cách tôi tự kiểm tra, (3) Việc tiếp theo đề xuất.',
    },
    {
      code: 'DR-02',
      label: 'Bảng Markdown',
      text: 'Trình bày kết quả chính dưới dạng bảng Markdown.',
    },
    { code: 'DR-03', label: 'Sơ đồ Mermaid', text: 'Vẽ sơ đồ bằng Mermaid.' },
    { code: 'DR-04', label: 'Lưu thành file', text: 'Lưu kết quả vào file {{ten_file}}.' },
    {
      code: 'DR-05',
      label: 'Code + giải thích ngắn',
      text: 'Đưa ra code hoàn chỉnh, kèm giải thích ngắn (dưới 5 dòng) cho từng thay đổi chính.',
    },
    {
      code: 'DR-06',
      label: 'Danh sách vấn đề theo mức độ',
      text: 'Liệt kê vấn đề theo mức độ (Nghiêm trọng / Cao / Trung bình / Thấp), mỗi vấn đề có: mô tả, vị trí, cách tái hiện, đề xuất sửa.',
    },
    {
      code: 'DR-07',
      label: 'Có phương án khuyến nghị',
      text: 'Đưa ra tối đa 3 phương án, so sánh ưu và nhược, và chỉ rõ 1 phương án khuyến nghị kèm lý do.',
    },
  ],
  tc: [
    {
      code: 'TC-01',
      label: 'Lint / typecheck / test pass',
      text: 'Các lệnh kiểm tra trong @AGENTS.md (lint, typecheck, test) đều pass.',
    },
    { code: 'TC-02', label: 'Có test cho thay đổi', text: 'Code mới hoặc sửa đổi có test đi kèm.' },
    {
      code: 'TC-03',
      label: 'Có bằng chứng chạy được',
      text: 'Có ảnh chụp màn hình hoặc các bước để tôi tự kiểm tra trên trình duyệt.',
    },
    {
      code: 'TC-04',
      label: 'Đạt từng acceptance criteria',
      text: 'Liệt kê từng acceptance criteria và xác nhận đạt hay chưa đạt.',
    },
    {
      code: 'TC-05',
      label: 'Không lỗi console',
      text: 'Không còn error/warning mới trong console trình duyệt.',
    },
    { code: 'TC-06', label: 'Đã commit', text: 'Đã commit với message dạng Conventional Commits.' },
    {
      code: 'TC-07',
      label: 'Cập nhật PLAN.md',
      text: 'Đã đánh dấu task hoàn thành trong @PLAN.md.',
    },
  ],
}

export const SUGGESTION_GROUPS: readonly { key: SuggestionGroup; title: string; hint: string }[] = [
  { key: 'rb', title: 'Ràng buộc', hint: 'Giới hạn để AI không làm quá tay' },
  { key: 'cl', title: 'Cách làm việc', hint: 'Chọn 1 trong 3 mục đầu, các mục khác tùy ý' },
  { key: 'dr', title: 'Định dạng đầu ra', hint: 'Hình thức kết quả' },
  { key: 'tc', title: 'Tiêu chí hoàn thành', hint: 'Khi nào được coi là xong' },
]

/** Chỉ được chọn một trong ba mức tự chủ này (docs/04: "chọn một trong CL-01 đến CL-03"). */
export const EXCLUSIVE_AUTONOMY = ['CL-01', 'CL-02', 'CL-03'] as const

const BY_CODE = new Map(
  Object.values(SUGGESTIONS).flatMap((list) => list.map((s) => [s.code, s] as const)),
)

export function getSuggestion(code: string): Suggestion | undefined {
  return BY_CODE.get(code)
}

/**
 * Bật/tắt một gợi ý trong tập đang chọn. Bật một mục trong nhóm mức tự chủ (CL-01/02/03)
 * thì tự tắt hai mục còn lại.
 */
export function toggleSuggestion(selected: ReadonlySet<string>, code: string): Set<string> {
  const next = new Set(selected)
  if (next.has(code)) {
    next.delete(code)
    return next
  }
  if ((EXCLUSIVE_AUTONOMY as readonly string[]).includes(code)) {
    for (const c of EXCLUSIVE_AUTONOMY) next.delete(c)
  }
  next.add(code)
  return next
}
