# Prompt Studio

Web app cá nhân giúp tạo, cải thiện và quản lý prompt và file quy tắc AGENTS.md cho AI lập trình, sắp xếp theo từng dự án.

| File / thư mục | Nội dung |
|---|---|
| `PRD.md` | Yêu cầu sản phẩm: app làm gì |
| `AGENTS.md` | Quy tắc cho AI lập trình làm việc trên dự án này (`CLAUDE.md` trỏ về file này) |
| `docs/` | Tài liệu thiết kế chi tiết: quy trình, trình tạo prompt, khung AGENTS.md, thư viện gợi ý |
| `ARCHITECTURE.md` | Kiến trúc và công nghệ |
| `PLAN.md` | Kế hoạch thực hiện từng bước (14 task) |

---

## Lấy lại toàn bộ dự án trên máy mới

Mọi file của dự án nằm trên GitHub. Sang máy nào, bạn chỉ cần "clone" (tải bản sao) về là có đủ thư mục như cũ.
Chọn **một** trong ba cách dưới đây.

### Cách 1 – Không cài gì: Claude Code trên web (dễ nhất)
1. Mở **claude.ai/code** và đăng nhập.
2. Chọn kho **prompt-studio** rồi bắt đầu phiên mới. Claude tự tải toàn bộ dự án về.
3. Gõ: *"Đọc AGENTS.md và PLAN.md, cho tôi biết dự án đang ở bước nào."*

### Cách 2 – Dùng GitHub Desktop (có giao diện bấm chuột)
1. Tải và cài **GitHub Desktop** từ desktop.github.com, sau đó đăng nhập tài khoản GitHub.
2. Bấm **File → Clone repository**, chọn `prompt-studio`, chọn thư mục muốn lưu, rồi bấm **Clone**.
3. Từ giờ, để lấy bản mới nhất thì bấm **Fetch origin → Pull origin**.

### Cách 3 – Dùng Claude Code trên máy
1. Cài **Git** (git-scm.com), **Node.js bản LTS** (nodejs.org) và **Claude Code**.
2. Mở Terminal, gõ: `git clone https://github.com/boyducthuy121195-svg/prompt-studio.git`
3. Gõ `cd prompt-studio` rồi `claude`, sau đó yêu cầu Claude như ở Cách 1.

---

## Chạy app trên máy của bạn

### Lần đầu trên mỗi máy (làm một lần)
1. **Cài Node.js bản LTS** (bản 22 trở lên) từ https://nodejs.org. Bấm nút tải bản "LTS", sau đó cài như phần mềm bình thường (Next → Next → Finish).
2. **Lấy code về máy**, dùng một trong ba cách ở phần trên.
3. **Mở cửa sổ lệnh tại thư mục `prompt-studio`:**
   - **Windows:** mở thư mục `prompt-studio` trong File Explorer, bấm vào thanh địa chỉ, gõ `cmd` rồi Enter.
   - **macOS:** chuột phải vào thư mục `prompt-studio` → **Dịch vụ → Terminal mới tại thư mục**.
4. Gõ lệnh dưới đây rồi Enter, đợi khoảng 1–2 phút:
   ```bash
   npm install
   ```

### Mỗi lần dùng app
1. Mở cửa sổ lệnh tại thư mục `prompt-studio` như bước 3 ở trên.
2. Gõ `npm run dev` rồi Enter.
3. Mở trình duyệt, vào **http://localhost:5173**.
4. Dùng xong thì quay lại cửa sổ lệnh, bấm `Ctrl+C` để tắt app.

### Các lệnh khác (dành cho AI lập trình)
```bash
npm run build        # đóng gói bản chính thức
npm run lint         # kiểm tra cách viết code (oxlint)
npm run typecheck    # kiểm tra kiểu dữ liệu
npm test             # kiểm thử đơn vị (Vitest)
npm run test:e2e     # kiểm thử luồng chính (Playwright)
npm run format       # tự định dạng code (Prettier)
```
Trước lần đầu chạy `npm run test:e2e` trên một máy, cần chạy thêm `npx playwright install chromium`.

### ⚠️ Dữ liệu trong app KHÔNG nằm trên GitHub
Dự án, prompt và API key bạn tạo **trong app** được lưu trong trình duyệt của từng máy.
Trước khi đổi máy, vào **Cài đặt → Sao lưu** để tải file `.json` về. Sang máy mới, vào **Cài đặt → Khôi phục** để nạp lại.
Có thể lưu file sao lưu lên Google Drive cho an toàn. **Không** đưa file này lên GitHub vì trong đó có API key.
