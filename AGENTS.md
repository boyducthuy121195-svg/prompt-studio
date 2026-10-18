# AGENTS.md – Prompt Studio

> File quy tắc cho mọi AI lập trình (Claude Code, Gemini CLI, Codex, Cursor...) làm việc trên dự án này.
> **Cách đọc file này:**
> - Dòng có **❓** là câu hỏi **chưa chốt**. AI gặp dòng này thì phải hỏi chủ dự án, không được tự quyết.
> - Mục **✍️ Bổ sung của bạn** là chỗ chủ dự án tự viết thêm quy tắc bằng tay. AI phải tuân theo như các quy tắc khác.
> - Yêu cầu sản phẩm chi tiết nằm trong `PRD.md`. Kế hoạch thực hiện nằm trong `PLAN.md`.

## 1. Tổng quan dự án

Prompt Studio là web app cá nhân dùng để tạo, cải thiện và quản lý prompt và file quy tắc (AGENTS.md) theo từng dự án.
App gọi Claude (Anthropic API) và Gemini (Google AI API) **trực tiếp từ trình duyệt**. Không có server riêng, không có đăng nhập.
Toàn bộ dữ liệu lưu trong IndexedDB của trình duyệt.

**Chủ dự án không biết lập trình.** Mọi giải thích gửi chủ dự án phải bằng tiếng Việt, dễ hiểu, tránh thuật ngữ. Nếu buộc phải dùng thuật ngữ thì giải thích ngắn kèm theo.

✍️ Bổ sung của bạn:
- (ví dụ: tên chính thức của app, mục tiêu cá nhân...)

## 2. Công nghệ (stack)

- **React 19 + TypeScript (strict)**, build bằng **Vite**
- **Tailwind CSS v4** để làm giao diện, thêm **shadcn/ui** cho các thành phần có sẵn (nút, hộp thoại, tab...)
- **Dexie.js** (lớp bọc IndexedDB) để lưu dữ liệu
- **React Router** để chuyển trang
- Soạn và xem trước Markdown: **CodeMirror 6** + **react-markdown**
- AI: SDK chính thức `@anthropic-ai/sdk` và `@google/genai`
- Đã được duyệt thêm: **Zod** (kiểm tra dữ liệu), **diff** (so sánh trước/sau), **fflate** (nén .zip), **lucide-react** (biểu tượng)
- Kiến trúc chi tiết: `ARCHITECTURE.md`
- Kiểm thử: **Vitest** + **Testing Library**. Kiểm thử luồng chính bằng **Playwright**
- Quản lý gói: **npm**
- Kiểm tra cách viết code: **oxlint** (mặc định của Vite) + **Prettier**. Dùng alias `@/` cho `src/`
- Playwright: trên máy mới cần chạy `npx playwright install chromium` một lần. Môi trường có Chromium riêng thì đặt biến `PLAYWRIGHT_CHROMIUM_PATH`

- Nơi lưu code chính: **GitHub** (kho `prompt-studio`). Chủ dự án làm việc trên nhiều máy và lấy code về bằng `git clone`. Mọi thứ cần để chạy lại dự án phải nằm trong kho này.
- **Chưa làm** chế độ offline/PWA.

- App **chỉ chạy trên máy** (link local `http://localhost:5173`), không đưa lên hosting online. Không thêm cấu hình deploy.

✍️ Bổ sung của bạn:
-

## 3. Lệnh thường dùng

```bash
npm install          # cài thư viện
npm run dev          # chạy thử trên máy (http://localhost:5173)
npm run build        # đóng gói bản chính thức
npm run lint         # kiểm tra lỗi cách viết code (oxlint)
npm run format       # tự định dạng code (Prettier)
npm run typecheck    # kiểm tra lỗi kiểu dữ liệu (tsc --noEmit)
npm test             # chạy kiểm thử đơn vị (vitest run)
npm run test:e2e     # chạy kiểm thử luồng chính (playwright test)
```

Trước khi báo "xong", **phải chạy** `npm run lint && npm run typecheck && npm test` và tất cả phải đạt.

## 4. Cấu trúc thư mục

```
src/
  app/            # khung app, router, layout
  features/       # mỗi tính năng một thư mục: projects/, wizard/, improve/, task-prompt/, library/, settings/, backup/, templates/ (giữ chỗ cho module Word/Excel)
  components/     # thành phần giao diện dùng chung
  lib/
    ai/           # gọi Claude/Gemini, tất cả đi qua một interface chung (AIProvider)
    db/           # schema Dexie và các hàm đọc/ghi
    prompts/      # meta-prompt mà app dùng để sinh/cải thiện nội dung
  types/          # kiểu dữ liệu dùng chung
tests/e2e/        # kiểm thử Playwright
```

Mỗi tính năng tự chứa trong `src/features/<tên>/`. Code dùng chung mới được đưa vào `components/` hoặc `lib/`.

## 5. Quy ước viết code

- Chỉ dùng function component và hook. Không dùng class component.
- Đặt tên file component theo kiểu `PascalCase.tsx`, các file khác theo kiểu `kebab-case.ts`.
- Không dùng `any`. Dữ liệu từ bên ngoài (phản hồi của AI, file sao lưu nhập vào) phải kiểm tra bằng **Zod**.
- **Mọi chữ hiển thị cho người dùng đều bằng tiếng Việt.** Gom các chuỗi này vào `src/lib/i18n/vi.ts` để sau này dễ sửa.
- Thông báo lỗi phải nói rõ **chuyện gì xảy ra và cần làm gì**, ví dụ: "API key Claude không hợp lệ. Vào Cài đặt để kiểm tra lại."
- Giao diện phải dùng được ở chiều rộng 360px (điện thoại) trở lên.

Ví dụ phong cách mong muốn:

```tsx
export function ProjectCard({ project }: { project: Project }) {
  const { t } = useI18n();
  return (
    <Card>
      <CardTitle>{project.name}</CardTitle>
      <p className="text-sm text-muted-foreground">{t.project.updatedAt(project.updatedAt)}</p>
    </Card>
  );
}
```

✍️ Bổ sung của bạn:
-

## 6. Quy tắc riêng cho phần gọi AI

- Tất cả lời gọi AI đi qua interface `AIProvider` trong `src/lib/ai/`. Mỗi nhà cung cấp viết một adapter riêng: `claude.ts`, `gemini.ts`.
- Tên model **không được viết cứng** trong code. Danh sách model mặc định lưu ở `src/lib/ai/models.ts`, người dùng có thể đổi trong Cài đặt.
  - Mặc định cho Claude: `claude-opus-5-5`. Danh sách chọn thêm: `claude-sonnet-5-5`, `claude-haiku-5-5`.
  - Mặc định cho Gemini: **Gemini 3.8 Flash**, theo lựa chọn của chủ dự án. Tên model chính xác phải lấy từ danh sách model mà Google trả về khi kiểm tra key. Nếu danh sách không có model này thì chọn bản Flash mới nhất và báo người dùng.
  - Sao lưu mặc định **không kèm API key**. Có ô tích "Kèm API key" kèm cảnh báo.
- Gọi Claude từ trình duyệt phải bật `dangerouslyAllowBrowser: true`. Việc này chấp nhận được vì đây là app cá nhân và key do người dùng tự nhập.
- Ưu tiên **streaming**: chữ hiện ra dần, kèm nút "Dừng".
- Các meta-prompt nằm trong `src/lib/prompts/`. Mỗi prompt là một file riêng và có test kiểm tra rằng nó được ghép đúng với dữ liệu dự án.
- Khi kiểm thử **không gọi API thật**. Dùng mock.

- Nội dung app tạo ra (prompt, file quy tắc) mặc định viết bằng **tiếng Việt, giữ thuật ngữ tiếng Anh**. Người dùng đổi được ngôn ngữ cho từng lần tạo.
- **Chỉ gọi AI khi người dùng bấm nút** (✨ Trau chuốt, Tạo, Kiểm tra). Không tự gọi AI khi người dùng đang gõ hay lúc tải trang.
- Danh sách gợi ý của Trình tạo prompt là **dữ liệu cố định** lấy từ `docs/04-THU-VIEN-GOI-Y.md`, lưu trong `src/lib/prompts/`. Không làm giao diện để sửa danh sách này.

## 7. Kiểm thử

- Mỗi hàm trong `lib/` phải có test đơn vị.
- Mỗi tính năng trong PLAN.md phải có ít nhất một test e2e cho luồng chính.
- Sửa lỗi thì viết thêm test tái hiện lỗi đó trước, rồi mới sửa.

## 8. Git và quy trình làm việc

- Mỗi lần chỉ làm **một bước** trong `PLAN.md`. Làm xong bước nào thì commit bước đó.
- Commit message bằng tiếng Anh, theo dạng Conventional Commits: `feat: ...`, `fix: ...`, `docs: ...`.
- Xong mỗi bước, báo cho chủ dự án bằng tiếng Việt:
  (1) đã làm gì, (2) ảnh chụp màn hình hoặc cách tự kiểm tra, (3) việc tiếp theo.
- Mỗi khi hoàn thành một bước, cập nhật trạng thái trong `PLAN.md`.

- Sau mỗi bước, AI **tự commit và push lên GitHub**. Máy đang dùng có thể là máy tạm, nên việc chưa push thì coi như chưa lưu.
- Không dùng `git push --force` lên nhánh `main`.

## 9. Ranh giới

### ✅ Luôn làm
- Chạy lint, typecheck và test trước khi báo xong.
- Hỏi lại khi yêu cầu chưa rõ, thay vì tự đoán.
- Giữ giao diện tiếng Việt và thông báo lỗi dễ hiểu.

### ⚠️ Hỏi chủ dự án trước khi làm
- Thêm thư viện (dependency) mới.
- Đổi cấu trúc dữ liệu trong Dexie. Thay đổi kiểu này cần có migration để không mất dữ liệu cũ.
- Làm tính năng nằm ngoài `PRD.md` hoặc đổi thiết kế đã chốt.
- Xóa file hoặc xóa một lượng lớn code.

### 🚫 Không bao giờ
- Commit hoặc in ra API key, file `.env`, hay bất kỳ bí mật nào.
- Gửi API key hoặc dữ liệu người dùng đến bất kỳ đâu ngoài Anthropic và Google.
- Thêm server, cơ sở dữ liệu trên mạng, theo dõi người dùng (analytics) hay quảng cáo.
- Tắt hoặc bỏ qua test để "cho qua".
- Sửa những file do hệ thống tự sinh như `package-lock.json` hay `dist/` bằng tay.

✍️ Bổ sung của bạn (điều cấm hoặc yêu cầu thêm):
-

## 10. Ghi chú khác của chủ dự án

✍️ Bổ sung của bạn:
-
