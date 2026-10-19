# So sánh Prompt Studio với "Trợ lý tạo prompt" (bản Windows 4174)

> Viết ngày 19/10/2026. Dự án so sánh nằm ở `D:\PHAN MEM QUAN LY\Tro-ly-tao-prompt-Windows-4174` – **chỉ đọc, không sửa**.
> Đã đọc: `AGENTS.md`, `README-Cai-dat.txt`, `Start.bat`, `server.mjs`, `public/index.html`, `public/app.js`, phần đầu `office-analysis.js` / `office-parser.js` và `public/office-skill/SKILL.md`.
> Chưa chạy thử app kia; nhận xét dựa trên đọc code.

## 1. Tóm tắt nhanh

| | **Prompt Studio** (dự án này) | **Trợ lý tạo prompt** (dự án kia) |
|---|---|---|
| Ý tưởng chính | Xưởng prompt + AGENTS.md theo **nhiều dự án**, có AI trau chuốt và chấm điểm | Trợ lý soạn prompt cho **một dự án**, kèm cẩm nang từng chặng và phân tích mẫu Word/Excel |
| Điểm mạnh nhất | Dữ liệu có cấu trúc, nhiều loại prompt, AGENTS.md theo mục, sao lưu, test đầy đủ | Prompt có "cổng duyệt" rất chặt, cẩm nang dạy cách làm việc với AI, phân tích file Office ngay trên máy |
| Điểm yếu nhất | Dữ liệu chỉ nằm trong trình duyệt (đang làm Task 15 để ghi ra thư mục) | localStorage một khóa, một dự án, không sao lưu, không có test |

## 2. Bảng so sánh chi tiết

### 2.1 Tính năng

| Tính năng | Prompt Studio | Trợ lý tạo prompt |
|---|---|---|
| Nhiều dự án | ✅ Danh sách dự án, hồ sơ 7 ô, 11 giai đoạn, nhân bản/xóa | ❌ Chỉ một ô "Tên dự án" |
| Loại prompt | ✅ 18 loại, 5 nhóm, mỗi loại có ô riêng | 🟨 10 loại công việc, **cùng 4 ô** C-T-C-R cho mọi loại |
| Khung prompt | 8 khối: Vai trò, Bối cảnh, Nhiệm vụ, Mục đích, Đầu vào, Ví dụ, Ràng buộc, Cách làm việc, Định dạng, Tiêu chí, Ngôn ngữ | Context – Task – Confirm – Restriction + Hàng rào an toàn + Nguyên tắc + Offline-first + "Bắt đầu" |
| Gợi ý cố định | ✅ 33 câu RB/CL/DR/TC, tích sẵn theo loại | 🟨 5 ô "hàng rào an toàn" + chip gợi ý lấy từ prompt mẫu của chặng |
| ✨ AI theo từng ô | ✅ Claude/Gemini, so sánh trước/sau, gợi ý bổ sung tách riêng | ✅ Gemini, nút "Thay nội dung / Thêm vào"; có nút riêng **"Dịch thuật ngữ UI/UX"** |
| ✨ Trau chuốt cả prompt, chấm điểm, cải thiện 2 bước | ✅ | ❌ |
| AGENTS.md | ✅ 10 mục, Hỏi đáp 10 câu, Nhập tự do, kiểm tra cục bộ, xuất .zip (AGENTS + CLAUDE + .gemini) | 🟨 Một ô soạn tự do + **14 nguyên tắc mẫu bấm để thêm** + "Mẫu của tôi"; tải AGENTS.md |
| Thư viện | ✅ 3 tab, thẻ, ghim, biến `{{bien}}`, Điền nhanh | 🟨 Danh sách đã lưu, mở / xóa |
| Cẩm nang quy trình | 🟨 11 giai đoạn, mỗi giai đoạn trỏ tới một loại prompt | ✅ **13 chặng dạng bài học**: mục tiêu, việc bạn làm, prompt mẫu, giải thích từng phần, cách trao đổi với AI, điều kiện sang chặng sau |
| Thanh "độ hoàn thiện" | ❌ (chỉ có số dòng/token) | ✅ % ô đã điền + lời nhắc |
| Trang chủ "Bạn muốn làm gì hôm nay?" | ❌ | ✅ Gõ ý tưởng → mở Tạo prompt |
| Tìm nhanh Ctrl+K, phím tắt | ✅ | ❌ |
| Sao lưu / khôi phục | ✅ JSON, kiểm tra Zod, nhắc 7 ngày | ❌ |
| Mẫu Word/Excel | ⬜ "Sắp có" (giai đoạn 2) | ✅ Đọc .docx/.xlsx **ngay trên máy** (JSZip), tạo FILE_TEMPLATE_SPEC, dấu vân tay SHA-256, prompt bàn giao 3 bước (phân tích → giao diện nhập → xuất file), kèm bộ "skill" hướng dẫn |

### 2.2 Giao diện

| | Prompt Studio | Trợ lý tạo prompt |
|---|---|---|
| Công nghệ | React 19 + Tailwind, thành phần tái dùng | HTML + JS thuần, một file `app.js` ~1.200 dòng |
| Bố cục | Thanh bên thu gọn, header chọn dự án, sáng/tối | Thanh bên thu gọn, breadcrumb; chỉ có giao diện sáng |
| Tạo prompt | Hai cột: bảng nhập / xem trước | Hai cột: 4 thẻ ô nhập có chữ cái màu (C/T/C/R) / xem trước + thanh % |
| Điện thoại | Kiểm tra tự động ở 360px | Có menu trượt, không có kiểm tra tự động |
| Hướng dẫn trên màn hình | Gọn, ít chữ | Nhiều chữ dẫn dắt (ví dụ, lời nhắc "Đừng nhập mật khẩu"), thân thiện với người mới |

### 2.3 Cách lưu dữ liệu

| | Prompt Studio | Trợ lý tạo prompt |
|---|---|---|
| Nơi lưu | IndexedDB (Dexie), nhiều bảng, có migration | localStorage, **một khóa JSON** `prompt-atelier-state-v1` (+ một khóa cho mẫu Office) |
| Dung lượng | Lớn (hàng trăm MB) | Khoảng 5 MB, dễ đầy khi lưu nhiều mẫu Office |
| Lịch sử bản sửa | ✅ Bảng `revisions` cho AGENTS.md | ❌ |
| Bản nháp đang soạn | Theo trang | ✅ Tự lưu bản nháp 4 ô, mở lại vẫn còn |
| API key | Lưu trong IndexedDB trên máy; sao lưu mặc định không kèm | **Chỉ giữ trong bộ nhớ của server Node**, tắt app là mất – an toàn hơn nhưng phải nhập lại |
| Đổi máy | File sao lưu (Task 15 sẽ thêm thư mục) | Không có cách mang dữ liệu đi |
| Cần chạy gì | `npm run dev` (Vite) | `Start.bat` → `node server.mjs`, không cần `npm install` |

### 2.4 Chất lượng prompt tạo ra

| Tiêu chí | Prompt Studio | Trợ lý tạo prompt |
|---|---|---|
| Vai trò rõ ràng | ✅ Mỗi loại có vai trò riêng | ❌ Không có khối vai trò; mở đầu bằng "Tôi là Product Owner…" |
| Bối cảnh dự án | ✅ Tự chèn hồ sơ dự án (tech stack, lệnh, cấu trúc…) + `@AGENTS.md` | 🟨 Chỉ tên dự án; chèn **nguyên văn** bộ nguyên tắc vào prompt (trùng với AGENTS.md AI đã đọc, làm prompt dài) |
| Cổng duyệt trước khi sửa | 🟨 CL-02 "Lên kế hoạch → chờ duyệt" (1 câu) | ✅ Rất chặt: kế hoạch **đúng 3 bước**, chờ chữ "Đồng ý", nếu bị từ chối thì sửa kế hoạch và chờ lại, chỉ làm đúng phạm vi đã duyệt |
| Trường hợp rỗng / lỗi | 🟨 Tùy loại prompt | ✅ Ô "Confirm" bắt buộc nghĩ tới: có dữ liệu / thiếu dữ liệu / không tìm thấy |
| Bảo vệ dữ liệu liên kết | 🟨 RB-05 (migration) | ✅ Ô "Restriction" nhắc khóa liên kết, dữ liệu chỉ đọc |
| Trung thực khi báo cáo | 🟨 DR-01 báo cáo 3 phần | ✅ "Báo rõ nếu không đọc được AGENTS.md", "tách điều đã kiểm tra thực tế khỏi điều mới suy luận", "nêu phần chưa xác minh" |
| Dữ liệu dán vào | ✅ Bọc trong thẻ `<log>`, `<code>`… để AI không nhầm với chỉ dẫn | ❌ Không bọc |
| Tiêu chí hoàn thành | ✅ Danh sách `[ ]` kiểm được (lint/test, ảnh chụp…) | 🟨 Gộp trong Confirm |
| Ô trống | ✅ Không in khối trống | ❌ In chỗ giữ chỗ `[Bổ sung …]` vào prompt nếu quên điền |
| Meta-prompt của ✨ | ✅ Mỗi lệnh một file, có bảng thuật ngữ, ngữ cảnh dự án, JSON kiểm tra bằng Zod, có test | 🟨 Chuỗi ghép tay trong code, không có bảng thuật ngữ, JSON không kiểm tra cấu trúc |
| Gọi AI ổn định | 🟨 Claude có `fallbacks`; Gemini báo lỗi | ✅ Tự thử lại 2 lần (chờ tăng dần) rồi chuyển model Gemini dự phòng, phân biệt "quá tải tạm thời" và "hết hạn mức ngày" |

## 3. Đề xuất nên học hỏi

Xếp theo thứ tự: lợi ích cao, công sức thấp lên trước. **Chưa làm gì cả** – mỗi mục cần chủ dự án duyệt (một số đổi thiết kế đã chốt, theo AGENTS.md mục 9).

| # | Học gì | Vì sao đáng học | Cách đưa vào Prompt Studio | Công sức |
|---|---|---|---|---|
| 1 | **Cổng duyệt chặt hơn** | Chủ dự án không biết code; cần chắc chắn AI không tự sửa trước khi được đồng ý | Viết lại CL-02 theo kiểu bản kia: kế hoạch ngắn → chờ "Đồng ý" → bị từ chối thì sửa và chờ lại → chỉ làm đúng phạm vi đã duyệt. Là dữ liệu cố định trong `suggestions.ts` (cần cập nhật `docs/04`) | Nhỏ |
| 2 | **Câu trung thực khi báo cáo** | Giảm việc AI "giả vờ đã kiểm tra" | Thêm 1–2 câu gợi ý: "Nếu không đọc được AGENTS.md thì báo rõ", "Tách việc đã kiểm tra thật khỏi điều mới suy luận; nêu phần chưa xác minh" | Nhỏ |
| 3 | **Ô "Trường hợp rỗng / lỗi"** cho loại Tính năng mới, Giao diện | Đây là lỗi hay gặp nhất khi AI làm tính năng | Thêm một trường riêng trong `prompt-types.ts` cho các loại liên quan, kèm ví dụ gợi ý | Nhỏ |
| 4 | **Thanh độ hoàn thiện** ở Tạo prompt | Người mới biết còn thiếu gì trước khi copy | Tính % theo các ô quan trọng của loại prompt (Nhiệm vụ, Mục đích, ô bắt buộc…) và nhắc ô còn trống. Chạy trên máy, không tốn AI | Nhỏ |
| 5 | **Thử lại + model dự phòng cho Gemini** | Gemini miễn phí hay quá tải (lỗi 429/503) | Trong `gemini.ts`: thử lại tối đa 2 lần khi lỗi tạm thời, rồi gợi ý/chuyển sang model Flash khác; báo riêng khi hết hạn mức ngày | Vừa |
| 6 | **Nguyên tắc mẫu bấm-để-thêm** trong AGENTS.md | Nhanh hơn Hỏi đáp khi chỉ cần thêm vài quy tắc | Ở mục "Ranh giới" / "Quy ước": danh sách quy tắc mẫu (dùng lại RB/CL), bấm để chèn; có "Mẫu của tôi" lưu trong Dexie (**đổi cấu trúc dữ liệu → cần migration**) | Vừa |
| 7 | **Cẩm nang dạng bài học** cho 11 giai đoạn | Dạy chủ dự án cách trao đổi với AI, biết khi nào xong một giai đoạn | Bổ sung cho mỗi giai đoạn trong `standard-process.ts`: "Bạn làm từng bước", "Cách trao đổi với AI", "Trước khi sang giai đoạn sau". Hiện ở trang chi tiết dự án | Vừa |
| 8 | **Ô "Bạn muốn làm gì hôm nay?"** ở trang Dự án | Lối vào nhanh cho người mới | Gõ một câu → gợi ý loại prompt (theo từ khóa, không gọi AI) → mở Tạo prompt với Nhiệm vụ đã điền | Vừa |
| 9 | **Phân tích mẫu Word/Excel ngay trên máy** | Chính là module giai đoạn 2 (M11) mà PRD đã giữ chỗ | Khi lập PLAN giai đoạn 2, tham khảo cách bản kia: đọc file bằng thư viện zip (dự án này đã có `fflate`), tạo FILE_TEMPLATE_SPEC, dấu vân tay SHA-256, quy trình 3 bước phân tích → giao diện nhập → xuất file, và bộ skill hướng dẫn | Lớn |
| 10 | (Cân nhắc) **Không lưu API key lâu dài** | An toàn hơn nếu máy dùng chung | Thêm tùy chọn "Chỉ nhớ key trong phiên này" (sessionStorage). Đổi thiết kế đã chốt → cần duyệt | Nhỏ |

### Không nên học

- **Chèn nguyên văn bộ nguyên tắc vào mỗi prompt:** làm prompt dài và trùng với `AGENTS.md` mà Claude Code / Gemini CLI đã tự đọc. Prompt Studio đang làm đúng: chỉ nhắc `@AGENTS.md`.
- **Dùng chung 4 ô cho mọi loại việc:** Prompt Studio có ô riêng theo loại nên prompt sát việc hơn.
- **Lưu tất cả vào một khóa localStorage:** dễ đầy và dễ hỏng; Dexie + sao lưu + (Task 15) thư mục tốt hơn.
- **In chỗ giữ chỗ `[Bổ sung…]` khi ô trống:** AI có thể hiểu nhầm là chỉ dẫn; Prompt Studio bỏ khối trống là đúng.
- **Server Node riêng để gọi AI:** trái với thiết kế "không có server" của dự án này.
