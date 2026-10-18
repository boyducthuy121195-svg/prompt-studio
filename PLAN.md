# PLAN.md – Kế hoạch xây dựng bản đầu tiên (MVP)

> Mỗi task là một **lát cắt dọc**: làm xong là chạy được và bạn tự bấm thử được.
> AI làm **một task mỗi lần**. Xong task nào thì đánh dấu, commit và push task đó (theo `AGENTS.md`).
> Tài liệu liên quan: `PRD.md` (làm gì) · `ARCHITECTURE.md` (làm bằng gì) · `docs/05-MAN-HINH-VA-LUONG.md` (giao diện).

**Trạng thái:** ⬜ chưa làm · 🟨 đang làm · ✅ xong

## Prompt dùng cho mọi task

Copy prompt dưới đây, thay `[số]` bằng số task, rồi dán vào Claude Code:

```
Làm task [số] trong @PLAN.md.
- Đọc @AGENTS.md, @ARCHITECTURE.md và các tài liệu mà task nhắc tới trước khi bắt đầu.
- Nêu kế hoạch ngắn (các bước, file sẽ tạo/sửa) và chờ tôi duyệt rồi mới làm.
- Chỉ làm đúng phạm vi task. Thấy cần thêm thư viện hay đổi thiết kế thì hỏi tôi trước.
- Xong thì chạy lint, typecheck, test. Tất cả phải pass.
- Cập nhật bản mẫu giao diện (mockup) cho khớp với app thật (xem `docs/mockup/README.md`).
- Commit, push, đánh dấu ✅ trong PLAN.md.
- Báo cáo 3 phần bằng tiếng Việt dễ hiểu: (1) đã làm gì, (2) cách tôi tự kiểm tra, (3) task tiếp theo.
```

---

## Tổng quan

| # | Task | Tính năng PRD | Phụ thuộc | Trạng thái |
|---|---|---|---|---|
| 0 | Tài liệu dự án (PRD, AGENTS, thiết kế, kiến trúc, kế hoạch) | — | — | ✅ |
| 1 | Dựng khung dự án | — | 0 | ✅ |
| 2 | Khung giao diện: thanh bên, header, sáng/tối, các trang trống | A9, M11 | 1 | ✅ |
| 3 | Lưu trữ và quản lý dự án | A1 | 2 | ✅ |
| 4 | Dữ liệu cố định: loại prompt, gợi ý, quy trình, khung AGENTS.md | A2, A4, A5 | 1 | ✅ |
| 5 | Trình tạo prompt (chưa dùng AI) | A4, A6 | 3, 4 | ✅ |
| 6 | Thư viện, ghim, điền nhanh biến | A5, A9 | 5 | ✅ |
| 7 | Cài đặt và lớp AI (Claude + Gemini) | A7 | 3 | ✅ |
| 8 | ✨ Trau chuốt và hộp so sánh trước/sau | A3, A4 | 5, 7 | ✅ |
| 9 | AGENTS.md: chỉnh sửa theo mục, kiểm tra, xuất file | A2, A6 | 4, 3 | ✅ |
| 10 | AGENTS.md: Hỏi đáp, Nhập tự do, ✨ theo mục | A2 | 8, 9 | ⬜ |
| 11 | Màn hình Cải thiện | A3 | 8 | ⬜ |
| 12 | Sao lưu và khôi phục | A8 | 3, 7 | ⬜ |
| 13 | Tìm nhanh (Ctrl+K) và hoàn thiện phím tắt | A9 | 6, 9 | ⬜ |
| 14 | Hoàn thiện và kiểm thử toàn app | Tất cả | 1–13 | ⬜ |

Thứ tự trên đã tính sẵn: có thể làm lần lượt từ trên xuống. Các task 1–6 **chưa cần API key**.

---

## Chi tiết từng task

### Task 1 – Dựng khung dự án ✅
> Hoàn thành 18/10/2026. Ảnh chụp: `docs/screenshots/task-01.png`.
**Làm gì:**
- Tạo dự án Vite + React + TypeScript (strict). Cài Tailwind CSS v4, shadcn/ui, lucide-react.
- Cài oxlint (mặc định của Vite, thay cho ESLint), Prettier, Vitest + Testing Library, Playwright.
- Tạo đủ các lệnh trong mục 3 của `AGENTS.md`.
- Tạo cấu trúc thư mục theo `ARCHITECTURE.md` mục 3.
- Trang chủ tạm hiện chữ "Prompt Studio".
- Cập nhật `README.md`: cách cài Node.js và chạy app lần đầu trên Windows và macOS.

**Tự kiểm tra:**
- Chạy `npm install` rồi `npm run dev`, mở http://localhost:5173 thấy chữ "Prompt Studio".
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e` đều chạy được và pass. Mỗi loại có ít nhất 1 test mẫu.

### Task 2 – Khung giao diện ✅
> Hoàn thành 18/10/2026. Ảnh chụp: `docs/screenshots/task-02-*.png`. Tên mục trên thanh bên rút gọn thành "Mẫu Word/Excel" cho vừa nhãn "Sắp có".
**Tài liệu:** `docs/05` mục 1 và 5, bản mẫu giao diện.

**Làm gì:**
- Tạo bộ màu teal sáng/tối bằng biến CSS, font Be Vietnam Pro, mật độ gọn (chữ 13px, nút 36px).
- Thanh bên gồm: Dự án, Tạo prompt, AGENTS.md, Cải thiện, Thư viện, Điền mẫu Word/Excel (nhãn "Sắp có"), Cài đặt. Có khu "Đã ghim" (tạm để trống).
- Nút thu gọn ở cuối thanh bên, phím tắt `Ctrl+B`. Khi thu gọn, toàn bộ thanh bên chỉ còn biểu tượng.
- Header gồm: ô chọn dự án (tạm thời), ô tìm kiếm (giao diện), nút chuyển sáng/tối.
- Router cho 7 trang. Các trang để trống, chỉ có tiêu đề. Riêng trang M11 làm luôn bố cục "Sắp có" như bản mẫu.
- Thông báo nhỏ (toast). Toàn bộ chữ giao diện đặt trong `src/lib/i18n/vi.ts`.
- App nhớ chế độ sáng/tối và trạng thái thu gọn thanh bên. Tạm lưu ở localStorage, đến task 3 chuyển sang Settings.

**Tự kiểm tra:**
- Bấm qua tất cả các tab.
- Thu gọn và mở rộng thanh bên, bằng nút và bằng `Ctrl+B`.
- Đổi sáng/tối, tải lại trang vẫn giữ đúng lựa chọn.
- Thu nhỏ cửa sổ còn khoảng 360px, giao diện không bị vỡ.

### Task 3 – Lưu trữ và quản lý dự án ✅
> Hoàn thành 18/10/2026. Ảnh chụp: `docs/screenshots/task-03-*.png`. Thêm thư viện: dexie, @radix-ui/react-dialog (nền của shadcn/ui), fake-indexeddb (chỉ dùng khi test – đã được duyệt). Sáng/tối và thanh bên nay lưu trong bảng Settings, localStorage chỉ là bản sao để không bị nháy màu khi mở app.
**Làm gì:**
- Tạo schema Dexie phiên bản 1 (`ARCHITECTURE.md` mục 4) và các hàm đọc/ghi, kèm test.
- **M1:** bảng dự án (tên, mô tả, giai đoạn, AGENTS.md, số prompt, sửa lần cuối), nút "Dự án mới", trạng thái trống.
- **M2:** chi tiết dự án gồm form Hồ sơ dự án (`Ctrl+S` để lưu), thanh tiến độ 11 giai đoạn (bấm để đặt giai đoạn hiện tại), Nhân bản, Xóa (có hộp xác nhận).
- Ô chọn dự án ở header lấy dữ liệu thật. Lựa chọn được ghi nhớ.

**Tự kiểm tra:**
- Tạo 2 dự án, sửa hồ sơ, tải lại trang thì dữ liệu vẫn còn.
- Nhân bản một dự án, xóa bản nhân bản.

### Task 4 – Dữ liệu cố định ✅
> Hoàn thành 18/10/2026. 17 test kiểm tra dữ liệu trong `src/lib/prompts/data.test.ts`. Bảng thuật ngữ hiện có 54 mục.
**Tài liệu:** `docs/01`, `docs/02`, `docs/03`, `docs/04`.

**Làm gì:**
- Chuyển nội dung tài liệu thành dữ liệu trong `src/lib/prompts/`: `prompt-types.ts` (18 loại), `suggestions.ts` (RB/CL/DR/TC + bảng tích sẵn), `standard-process.ts` (11 giai đoạn **và** phần "Phát triển thêm cho dự án đã có": 3 lối đi Nhỏ/Vừa/Lớn + prompt Nghiên cứu kỹ thuật), `agents-skeleton.ts` (10 mục + câu hỏi Wizard), `glossary.ts`.
- Có kiểu TypeScript chặt cho tất cả dữ liệu.

**Tự kiểm tra (bằng test):**
- Đủ 18 loại prompt.
- Mọi mã gợi ý được tích sẵn đều tồn tại.
- Mỗi giai đoạn trỏ tới đúng một loại prompt.
- 4 mục bắt buộc của AGENTS.md có cờ ★.

Task này không có giao diện mới. AI báo kết quả test.

### Task 5 – Trình tạo prompt (chưa dùng AI) ✅
> Hoàn thành 18/10/2026. Bấm giai đoạn trên thanh tiến độ vẫn để đặt giai đoạn (task 3); bên dưới thanh có đường dẫn "Prompt mẫu của giai đoạn hiện tại" mở đúng loại prompt.
**Tài liệu:** `docs/02`, `docs/04`.

**Làm gì:**
- **M3:** chọn loại prompt theo 5 nhóm, kèm gợi ý loại phù hợp với giai đoạn hiện tại của dự án.
- **M4:** bố cục hai cột.
  - Cột trái là bảng nhập: Vai trò, Ngôn ngữ, Nhiệm vụ, các trường riêng của loại, Mục đích, 4 nhóm ô tích kèm câu đầy đủ. Mỗi nhóm có bộ đếm "x/y đã chọn". Trong nhóm Cách làm việc, ba mục CL-01/02/03 chỉ chọn được một.
  - Cột phải là phần xem trước, cập nhật ngay khi sửa, kèm số dòng và số token ước tính.
- Hàm `build-prompt.ts` ghép prompt theo khung 8 khối. Bối cảnh lấy từ Hồ sơ dự án. Dữ liệu dán vào được bọc trong thẻ. Có test.
- Nút Copy và phím tắt `Ctrl+Enter`.
- Bấm một giai đoạn trên thanh tiến độ (M2) sẽ mở đúng loại prompt.
- Các nút ✨ hiển thị nhưng chưa hoạt động. Bấm vào thì báo "Cần cài đặt AI – sẽ có ở task 8".

**Tự kiểm tra:**
- Chọn "Sửa lỗi": các ô đúng như `docs/04` đã được tích sẵn.
- Tích hoặc bỏ tích một ô, phần xem trước đổi theo.
- Copy, dán vào Notepad, thấy đúng nội dung.

### Task 6 – Thư viện, ghim, điền nhanh biến ✅
> Hoàn thành 18/10/2026.
**Làm gì:**
- Nút "Lưu vào thư viện" (`Ctrl+S`) ở M4. Prompt được lưu cùng trạng thái các ô, nên sau này "Mở trong bảng nhập" khôi phục đúng.
- **M8:** 3 tab (Quy trình chuẩn, Của dự án, Dùng chung) dạng bảng, lọc theo thẻ, Sửa, Xóa, Ghim/Bỏ ghim.
- Hỗ trợ biến `{{bien}}` và `{{bien|mặc định}}`. Hàm điền biến có test.
- **M9:** hộp "Điền nhanh" gồm ô nhập cho từng biến và phần xem trước nội dung sẽ copy.
- Mục "Đã ghim" trên thanh bên hoạt động theo `PRD.md` mục A9. Prompt không có biến thì copy ngay toàn bộ. Prompt có biến thì mở M9 và hiện nhãn "Điền". Khi thu gọn thanh bên, mỗi prompt ghim hiện thành ô chữ cái đầu.

**Tự kiểm tra:**
- Lưu một prompt có biến rồi ghim nó.
- Bấm trên thanh bên, điền biến rồi Copy.
- Tải lại trang, prompt ghim vẫn còn.

### Task 7 – Cài đặt và lớp AI ✅
> Hoàn thành 18/10/2026. Chưa thử với key thật (môi trường làm việc không có key) – adapter được kiểm tra bằng SDK giả. Chủ dự án cần bấm "Kiểm tra" với key thật trên máy của mình.
**Tài liệu:** `ARCHITECTURE.md` mục 6.

**Làm gì:**
- **M10:**
  - API key Claude và Gemini (ẩn/hiện, nút "Kiểm tra").
  - Chọn AI mặc định, model Claude (mặc định `claude-opus-5-5`) và model Gemini (danh sách lấy từ Google, ưu tiên 3.8 Flash).
  - Ngôn ngữ mặc định, chế độ sáng/tối, bảng phím tắt.
- `AIProvider` cùng 2 adapter `claude.ts` và `gemini.ts` (streaming, JSON có cấu trúc, dừng giữa chừng), `MockProvider` cho test, `errors.ts` với thông báo tiếng Việt.
- Claude: bật `fallbacks: "default"` và đặt effort theo bảng 6.2.
- Chỉ báo AI đang dùng trên header (ví dụ "AI: Claude · opus-5-5") hiển thị dữ liệu thật.

**Tự kiểm tra:**
- Nhập key thật, bấm Kiểm tra, thấy "hợp lệ" và danh sách model.
- Nhập key sai thì thấy thông báo lỗi tiếng Việt.

**Cần bạn:** có sẵn API key Claude và Gemini.

### Task 8 – ✨ Trau chuốt và hộp so sánh ✅
> Hoàn thành 18/10/2026. Kiểm tra bằng AI giả; cần thử với key thật trên máy chủ dự án.
**Làm gì:**
- Nút ✨ cạnh ô Nhiệm vụ và các ô tự do (`polishField`): chữ hiện dần, có nút "Dừng".
- Nút "✨ Trau chuốt toàn bộ" (`polishPrompt`) trả JSON gồm bản cải thiện, danh sách thay đổi và câu hỏi cho bạn.
- **M5:** hộp so sánh trước/sau (tô màu bằng thư viện diff), khu "AI cần bạn trả lời thêm", hai nút Chấp nhận / Bỏ qua.
- Meta-prompt dùng bảng thuật ngữ và tuân thủ quy tắc "không tự thêm yêu cầu mới".
- AI chỉ chạy khi bấm nút.

**Tự kiểm tra:**
- Gõ "khi bấm lưu thì màn hình trắng", bấm ✨, thấy câu được viết lại đúng thuật ngữ.
- Chấp nhận thay đổi, nội dung trong ô được cập nhật.

### Task 9 – AGENTS.md: chỉnh sửa theo mục, kiểm tra, xuất file ✅
> Hoàn thành 18/10/2026. Kéo thả để đổi thứ tự, kèm nút lên/xuống cho người dùng bàn phím.
**Tài liệu:** `docs/03`.

**Làm gì:**
- **M6, chế độ Chỉnh sửa theo mục:**
  - Danh sách 10 mục: bật/tắt mục không bắt buộc, kéo thả thứ tự, thêm mục tùy chỉnh.
  - Soạn bằng CodeMirror và xem trước bằng react-markdown.
- Kiểm tra cục bộ, không tốn tiền AI: đủ 4 mục ★ chưa, lệnh có nằm trong khối code không, độ dài (cảnh báo khi quá 150 hoặc 300 dòng), câu mơ hồ theo danh sách mẫu, chuỗi giống API key.
- Xuất file:
  - Tải `AGENTS.md`.
  - Tải gói `.zip` gồm AGENTS.md, CLAUDE.md (`@AGENTS.md`) và `.gemini/settings.json`.
  - Copy.
- Mỗi lần lưu tạo một bản ghi trong bảng `revisions`, dành sẵn cho tính năng B1.

**Tự kiểm tra:**
- Tạo AGENTS.md cho một dự án, tắt một mục, tải `.zip` về và giải nén, thấy đủ 3 file.

### Task 10 – AGENTS.md: Hỏi đáp, Nhập tự do, ✨ theo mục ⬜
**Làm gì:**
- **Hỏi đáp:** đi qua 10 câu (ô tích lựa chọn nhanh + ô tự do, Bỏ qua, Quay lại). Bấm "✨ Tạo AGENTS.md" (`agentsGenerate`) thì nội dung hiện dần vào chế độ chỉnh sửa.
- **Nhập tự do:** dán nội dung rồi bấm ✨ (`agentsClassify`) để AI xếp vào 10 mục và báo mục còn thiếu.
- Nút ✨ Viết lại / Ngắn gọn hơn / Thêm ví dụ cho từng mục. Kết quả đi qua hộp so sánh M5.
- Nút "✨ Kiểm tra lại bằng AI" (`agentsCheck`).

**Tự kiểm tra:**
- Đi hết Wizard cho dự án Prompt Studio, so kết quả với `AGENTS.md` thật của dự án.

### Task 11 – Màn hình Cải thiện ⬜
**Làm gì:**
- **M7:** dán nội dung hoặc tải file `.md`, chọn loại (Prompt / AGENTS.md).
- Bấm "✨ Phân tích" (`improveAnalyze`) để thấy điểm theo 5 tiêu chí và bảng vấn đề theo mức độ.
- "Xem bản đề xuất" mở hộp M5. Chấp nhận xong có thể lưu vào Thư viện hoặc vào AGENTS.md của dự án.

**Tự kiểm tra:**
- Dán prompt mẫu "Bạn là lập trình viên giỏi, viết code sạch...", thấy AI chỉ ra các câu mơ hồ.

### Task 12 – Sao lưu và khôi phục ⬜
**Làm gì:**
- Tải file sao lưu `.json`. Ô tích "Kèm API key" mặc định tắt, có cảnh báo.
- Khôi phục từ file: kiểm tra bằng Zod, xem trước số dự án và prompt, xác nhận trước khi ghi đè.
- Banner nhắc khi đã quá 7 ngày chưa sao lưu.
- Nút "Xóa toàn bộ dữ liệu" phải xác nhận 2 lần.

**Tự kiểm tra:**
- Sao lưu, xóa toàn bộ, khôi phục, mọi thứ quay lại đủ.
- Thử nhập một file hỏng, thấy thông báo lỗi dễ hiểu.

### Task 13 – Tìm nhanh và hoàn thiện phím tắt ⬜
**Làm gì:**
- `Ctrl+K` mở hộp tìm nhanh: tìm dự án, prompt, loại prompt. Bấm Enter để mở.
- Ô tìm kiếm trên header cũng mở hộp này.
- Rà lại toàn bộ phím tắt: `Ctrl+K`, `Ctrl+Enter`, `Ctrl+S`, `Ctrl+B`, `Esc`.
- Bảng phím tắt trong Cài đặt khớp với thực tế.

**Tự kiểm tra:**
- Dùng app chỉ bằng bàn phím cho luồng "tìm prompt → điền → copy".

### Task 14 – Hoàn thiện và kiểm thử toàn app ⬜
**Làm gì:**
- Viết E2E cho 3 luồng chính trong `docs/05` và luồng sao lưu/khôi phục.
- Rà các trạng thái trống, đang tải, lỗi trên mọi màn hình.
- Rà responsive (360px → 1440px), cả chế độ tối, và truy cập bằng bàn phím.
- Review bảo mật (key, file sao lưu, nội dung từ AI).
- Cập nhật `README.md` và `AGENTS.md` theo thực tế. Đặt dự án Prompt Studio sang giai đoạn "Kiểm thử".

**Tự kiểm tra:**
- Làm theo checklist trong báo cáo cuối mà AI gửi.

---

## Sau MVP
- **Phiên bản 1.1 (mức B trong PRD):** lịch sử phiên bản, mẫu khởi đầu, so sánh Claude và Gemini, ước tính chi phí.
- **Giai đoạn 2 (mức D):** module Điền mẫu Word/Excel. Sẽ nghiên cứu và lập PLAN riêng.
