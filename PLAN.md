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
| 10 | AGENTS.md: Hỏi đáp, Nhập tự do, ✨ theo mục | A2 | 8, 9 | ✅ |
| 11 | Màn hình Cải thiện | A3 | 8 | ✅ |
| 12 | Sao lưu và khôi phục | A8 | 3, 7 | ✅ |
| 12A | ✨ AI theo ngữ cảnh: gợi ý bổ sung, Cải thiện 2 bước | A2, A3, A4 | 8, 10, 11 | ✅ |
| 13 | Tìm nhanh (Ctrl+K) và hoàn thiện phím tắt | A9 | 6, 9 | ✅ |
| 14 | Hoàn thiện và kiểm thử toàn app | Tất cả | 1–13 | ✅ |
| 15 | Lưu dữ liệu ra thư mục trên máy | A8 (mở rộng) | 12 | ✅ |
| 16 | Nâng chất lượng prompt (học từ "Trợ lý tạo prompt") | A4, A7 | 5, 7 | ✅ |
| 17 | Mẫu Word/Excel – B1: phân tích mẫu trên máy, lập hồ sơ mẫu | D | 15 | ⬜ (nháp) |
| 18 | Mẫu Word/Excel – B2: bàn giao cho AI lập trình kèm skill | D | 17 | ⬜ (nháp) |
| 19 | Mẫu Word/Excel – A: điền biến `{{...}}` và xuất file (bản đơn giản) | D | 17 | ⬜ (nháp) |

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

### Task 10 – AGENTS.md: Hỏi đáp, Nhập tự do, ✨ theo mục ✅
> Hoàn thành 18/10/2026. "Tạo AGENTS.md" dùng JSON có cấu trúc (mỗi mục một phần) thay vì chữ hiện dần, để xếp đúng nội dung vào từng mục. Kiểm tra bằng AI giả.
**Làm gì:**
- **Hỏi đáp:** đi qua 10 câu (ô tích lựa chọn nhanh + ô tự do, Bỏ qua, Quay lại). Bấm "✨ Tạo AGENTS.md" (`agentsGenerate`) thì nội dung hiện dần vào chế độ chỉnh sửa.
- **Nhập tự do:** dán nội dung rồi bấm ✨ (`agentsClassify`) để AI xếp vào 10 mục và báo mục còn thiếu.
- Nút ✨ Viết lại / Ngắn gọn hơn / Thêm ví dụ cho từng mục. Kết quả đi qua hộp so sánh M5.
- Nút "✨ Kiểm tra lại bằng AI" (`agentsCheck`).

**Tự kiểm tra:**
- Đi hết Wizard cho dự án Prompt Studio, so kết quả với `AGENTS.md` thật của dự án.

### Task 11 – Màn hình Cải thiện ✅
> Hoàn thành 18/10/2026. Tải file tên AGENTS/CLAUDE/GEMINI thì tự chọn loại AGENTS.md. "Dùng làm AGENTS.md" tách nội dung theo tiêu đề `##` vào 10 mục, bản cũ vẫn còn trong lịch sử. Kiểm tra bằng AI giả.
**Làm gì:**
- **M7:** dán nội dung hoặc tải file `.md`, chọn loại (Prompt / AGENTS.md).
- Bấm "✨ Phân tích" (`improveAnalyze`) để thấy điểm theo 5 tiêu chí và bảng vấn đề theo mức độ.
- "Xem bản đề xuất" mở hộp M5. Chấp nhận xong có thể lưu vào Thư viện hoặc vào AGENTS.md của dự án.

**Tự kiểm tra:**
- Dán prompt mẫu "Bạn là lập trình viên giỏi, viết code sạch...", thấy AI chỉ ra các câu mơ hồ.

### Task 12 – Sao lưu và khôi phục ✅
> Hoàn thành 18/10/2026. File sao lưu không kèm key thì khi khôi phục giữ nguyên key đang có trên máy. Chưa sao lưu lần nào thì tính 7 ngày từ lúc tạo dự án đầu tiên.
**Làm gì:**
- Tải file sao lưu `.json`. Ô tích "Kèm API key" mặc định tắt, có cảnh báo.
- Khôi phục từ file: kiểm tra bằng Zod, xem trước số dự án và prompt, xác nhận trước khi ghi đè.
- Banner nhắc khi đã quá 7 ngày chưa sao lưu.
- Nút "Xóa toàn bộ dữ liệu" phải xác nhận 2 lần.

**Tự kiểm tra:**
- Sao lưu, xóa toàn bộ, khôi phục, mọi thứ quay lại đủ.
- Thử nhập một file hỏng, thấy thông báo lỗi dễ hiểu.

### Task 12A – ✨ AI theo ngữ cảnh ✅
> Thêm theo yêu cầu của chủ dự án ngày 18/10/2026: kết quả ✨ đang theo một khuôn chung, chưa sát từng phần.
**Làm gì:**
- Mỗi lần bấm ✨, AI nhận thêm: loại prompt (mô tả, vai trò, lưu ý riêng, trọng tâm cố định), hồ sơ dự án, giai đoạn hiện tại, các ô / các mục khác đã điền.
- Trọng tâm cố định cho từng loại prompt và từng ô hay gặp (`src/lib/prompts/polish-focus.ts`).
- Hộp so sánh có khu **gợi ý bổ sung** để tích chọn: ✨ một ô → ý thêm vào cuối ô; ✨ toàn bộ → ràng buộc / tiêu chí chèn vào đúng khối (ưu tiên lấy từ bộ gợi ý cố định chưa tích); ✨ một mục AGENTS.md → quy tắc thêm vào cuối mục.
- Cải thiện 2 bước: ✨ Phân tích (điểm + vấn đề kèm cách sửa, tiêu chí riêng cho prompt / AGENTS.md) → tích vấn đề cần sửa (mặc định mức Cao và TB) → ✨ Viết lại theo vấn đề đã chọn.
- Đổi ✨ một ô và ✨ một mục AGENTS.md từ chữ hiện dần sang JSON có cấu trúc để tách bản viết lại và gợi ý.

**Tự kiểm tra:**
- Chọn dự án có hồ sơ, mở "Sửa lỗi", bấm ✨ ở ô Nhiệm vụ: gợi ý nhắc tới đúng công nghệ của dự án.
- Ở Cải thiện, bỏ tích bớt vấn đề rồi viết lại: AI chỉ sửa các vấn đề còn tích.

### Task 13 – Tìm nhanh và hoàn thiện phím tắt ✅
> Hoàn thành 18/10/2026. Tìm được khi gõ không dấu. Enter trên một prompt: có biến thì mở Điền nhanh, không có biến thì copy ngay. Sửa lỗi: khi đang mở hộp thoại, Ctrl+Enter / Ctrl+S của trang bên dưới không chạy nữa.
**Làm gì:**
- `Ctrl+K` mở hộp tìm nhanh: tìm dự án, prompt, loại prompt. Bấm Enter để mở.
- Ô tìm kiếm trên header cũng mở hộp này.
- Rà lại toàn bộ phím tắt: `Ctrl+K`, `Ctrl+Enter`, `Ctrl+S`, `Ctrl+B`, `Esc`.
- Bảng phím tắt trong Cài đặt khớp với thực tế.

**Tự kiểm tra:**
- Dùng app chỉ bằng bàn phím cho luồng "tìm prompt → điền → copy".

### Task 14 – Hoàn thiện và kiểm thử toàn app ✅
> Hoàn thành 18/10/2026.
> - E2E cho 3 luồng chính (`tests/e2e/main-flows.spec.ts`, `library.spec.ts`) và sao lưu (`backup.spec.ts`); AI giả lập bằng `tests/e2e/fake-claude.ts`.
> - Rà 360px / 1440px × sáng / tối cho mọi trang (`layout.spec.ts`). Sửa 3 lỗi tràn ngang trên điện thoại (Tạo prompt, Dự án, AGENTS.md).
> - Thêm thông báo khi trình duyệt không đọc được dữ liệu; Thư viện có trạng thái "Đang tải".
> - Bảo mật: thêm Content-Security-Policy chỉ cho kết nối tới Anthropic / Google; đã rà không in key, không chèn HTML thô từ AI.
> - Tách gói: thư viện AI và CodeMirror chỉ tải khi cần (file chính 2,2 MB → khoảng 470 kB).
> - Checklist tự kiểm tra: `docs/06-CHECKLIST-KIEM-TRA.md`. Việc đặt dự án Prompt Studio sang giai đoạn "Kiểm thử" là dữ liệu trong trình duyệt của chủ dự án, cần tự bấm (checklist mục 1).
**Làm gì:**
- Viết E2E cho 3 luồng chính trong `docs/05` và luồng sao lưu/khôi phục.
- Rà các trạng thái trống, đang tải, lỗi trên mọi màn hình.
- Rà responsive (360px → 1440px), cả chế độ tối, và truy cập bằng bàn phím.
- Review bảo mật (key, file sao lưu, nội dung từ AI).
- Cập nhật `README.md` và `AGENTS.md` theo thực tế. Đặt dự án Prompt Studio sang giai đoạn "Kiểm thử".

**Tự kiểm tra:**
- Làm theo checklist trong báo cáo cuối mà AI gửi.

### Task 15 – Lưu dữ liệu ra thư mục trên máy ✅
> Thêm sau MVP theo yêu cầu của chủ dự án (đã duyệt thiết kế ngày 19/10/2026). Hoàn thành 19/10/2026.
> - Chỉ chạy trên **Chrome / Edge** (File System Access API). Trình duyệt khác thấy thông báo "chưa hỗ trợ".
> - Thư mục đã chọn được nhớ trong một cơ sở dữ liệu riêng của trình duyệt (`prompt-studio-folders`), **không đổi** cấu trúc dữ liệu cũ và không nằm trong file sao lưu.
> - Mở lại trình duyệt, Chrome có thể hỏi lại quyền ghi: app hiện thanh nhắc "Cho phép ghi" ở đầu mọi trang.
> - Chọn thư mục đã có file khác (không phải dữ liệu Prompt Studio) thì app từ chối, để không ghi đè.
> - Xóa dần hết dự án và prompt thì app coi là "trống" và không ghi nữa: thư mục giữ bản cuối cùng.
**Làm gì:**
- Cài đặt có khối "Lưu ra thư mục trên máy": nút "Chọn thư mục lưu dữ liệu…", "Nạp từ thư mục…", "Ngừng ghi ra thư mục" và dòng trạng thái lần ghi gần nhất.
- Sau mỗi lần sửa, app tự ghi **một chiều** ra thư mục: `du-lieu-prompt-studio.json` (không kèm API key), `du-an/<ten>/ho-so.md`, `AGENTS.md`, `CLAUDE.md`, `prompts/*.md`, `dung-chung/prompts/*.md`, kèm `README.md`. Sửa tay các file đó thì app không đọc lại.
- "Nạp từ thư mục" để lấy lại dữ liệu khi đổi máy. Thư mục đã có dữ liệu thì hỏi trước (xem trước số dự án, prompt), không ghi đè. Không ghi khi app đang trống. "Xóa toàn bộ dữ liệu" thì ngừng ghi ra thư mục.
- Mỗi dự án (M2) có khối "Thư mục code": ghi thẳng AGENTS.md / CLAUDE.md vào đó. Nếu ở đó đã có file khác nội dung thì giữ bản cũ thành `AGENTS.backup-<ngày>.md` trước khi ghi.
- API key không bao giờ ghi ra thư mục. Test đơn vị (`src/lib/folder/*.test.ts`, `src/features/folder/folder.test.tsx`) và e2e (`tests/e2e/folder.spec.ts`).

**Tự kiểm tra (trên Chrome hoặc Edge):**
- Cài đặt → "Chọn thư mục lưu dữ liệu…" → tạo một thư mục trống mới (ví dụ `Documents\Prompt Studio`) → bấm "Cho phép". Mở thư mục bằng File Explorer: thấy `du-lieu-prompt-studio.json` và thư mục `du-an`.
- Sửa hồ sơ một dự án, bấm Ctrl+S, mở lại `du-an/<ten>/ho-so.md` thấy nội dung mới. Mở file `.json` bằng Notepad, tìm "sk-ant" không thấy.
- Trang dự án → "Chọn thư mục code…" → chọn thư mục code thật của dự án. Sửa AGENTS.md trong app: file AGENTS.md trong thư mục code đổi theo; nếu trước đó đã có AGENTS.md khác thì thấy thêm `AGENTS.backup-<ngày>.md`.
- Đổi máy: cài app, mở Cài đặt → "Nạp từ thư mục…" → chọn đúng thư mục (ví dụ qua OneDrive) → "Nạp dữ liệu". Nhập lại API key.

### Task 16 – Nâng chất lượng prompt ✅
> Thêm theo đề xuất trong `docs/07` (mục 3, nhóm 1), chủ dự án duyệt ngày 19/10/2026. Hoàn thành 19/10/2026.
> Chưa làm "tự chuyển sang model Gemini dự phòng" (cần đổi thiết kế Cài đặt) – thông báo lỗi gợi ý đổi model thay vào đó.
**Làm gì:**
- CL-02 "Lên kế hoạch → chờ duyệt" viết chặt hơn: chờ trả lời "Đồng ý", bị yêu cầu chỉnh thì sửa kế hoạch và chờ lại, chỉ làm đúng phạm vi đã duyệt.
- Gợi ý mới CL-08 "Báo cáo trung thực" (không đọc được AGENTS.md thì báo; tách việc đã kiểm tra thật với điều suy luận). Tích sẵn cho Tính năng, Sửa lỗi, Refactor, Viết test, Kiểm thử. `docs/04` đã cập nhật.
- Ô "Khi trống / lỗi / đang tải" (có ✨) cho loại Xây tính năng mới và Thiết kế giao diện.
- Thanh "Độ hoàn thiện" trên phần xem trước: % các ô chữ quan trọng đã điền và danh sách ô còn thiếu (`src/lib/prompts/completeness.ts`, không gọi AI).
- Gemini tự thử lại tối đa 2 lần (sau 1 giây, 2 giây) khi quá tải / gửi quá nhanh; hết hạn mức trong ngày thì báo riêng và gợi ý đổi model (`src/lib/ai/retry.ts`).

**Tự kiểm tra:**
- Mở Tạo prompt → "Xây tính năng mới": thanh Độ hoàn thiện 0%, gõ Nhiệm vụ thì tăng; thấy ô "Khi trống / lỗi / đang tải".
- Phần xem trước có câu "Dừng lại chờ tôi trả lời "Đồng ý"" và "không giả vờ đã đọc".

### Module Mẫu Word/Excel (task 17–19) – BẢN NHÁP, chưa duyệt
> Chủ dự án chọn hướng ngày 19/10/2026: **B trước** (phân tích mẫu + bàn giao cho AI kèm skill `office-template-portable`), **sau đó A bản đơn giản**.
> Đang chờ chủ dự án: (1) 1–3 file mẫu Word/Excel đã thay dữ liệu giả; (2) mỗi mẫu điền 1 bản hay nhiều bản từ danh sách;
> (3) dữ liệu nhập từ đâu (gõ form / dán / file Excel nguồn); (4) có được gửi chữ trong mẫu cho Claude/Gemini không;
> (5) có cho chép skill `office-template-portable` vào kho không. Trả lời xong sẽ chốt chi tiết và trình duyệt từng task.

**Task 17 – B1: phân tích mẫu trên máy (dự kiến)**
- M11: tải file .docx / .xlsx (không gửi đi đâu), tính SHA-256, đọc cấu trúc bằng `fflate` + `DOMParser` (không thêm thư viện).
- Word: danh sách đoạn, bảng / dòng / ô kèm vị trí (XPath). Excel: sheet, ô có chữ, ô gộp, vùng in.
- Người dùng đánh dấu ô / đoạn nào là "trường cần điền" (mã trường, nhãn, kiểu) → app lập hồ sơ FILE_TEMPLATE_SPEC 1.0 (trạng thái `draft`), lưu theo dự án. Không lưu nội dung file gốc nếu chưa được đồng ý.
- Test đơn vị với file mẫu giả trong `src/test/fixtures/`, e2e cho luồng tải → đánh dấu → lưu.

**Task 18 – B2: bàn giao cho AI (dự kiến)**
- 3 loại prompt mới theo skill: Phân tích / kiểm tra hồ sơ mẫu → Tạo giao diện nhập → Điền và xuất file; ô hồ sơ mẫu điền sẵn từ task 17.
- Tải gói .zip bàn giao: hồ sơ mẫu + skill + prompt của bước đang chọn (file mẫu chỉ kèm khi người dùng tích).
- Có thể ghi thẳng vào "thư mục code" của dự án (task 15).

**Task 19 – A: điền và xuất bản đơn giản (dự kiến)**
- Mẫu có biến `{{ten}}` hoặc trường đã đánh dấu ở task 17 → form nhập → xuất bản sao cùng định dạng, chỉ thay đúng vị trí đã duyệt.
- Xử lý Word tách một chữ thành nhiều đoạn định dạng; chưa làm dòng lặp, nhiều file một lần (để sau).
- Kiểm tra sau xuất: so cấu trúc với mẫu, báo chỗ khác ngoài các vị trí đã điền.

---

## Sau MVP
- **Task 15** (ở trên): lưu dữ liệu ra thư mục trên máy.
- **Đề xuất học hỏi từ "Trợ lý tạo prompt"** (chưa duyệt): xem `docs/07-SO-SANH-TRO-LY-TAO-PROMPT.md` mục 3.
- **Phiên bản 1.1 (mức B trong PRD):** lịch sử phiên bản, mẫu khởi đầu, so sánh Claude và Gemini, ước tính chi phí.
- **Giai đoạn 2 (mức D):** module Điền mẫu Word/Excel. Sẽ nghiên cứu và lập PLAN riêng.
