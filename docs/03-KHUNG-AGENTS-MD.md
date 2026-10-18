# Thiết kế: Bộ khung AGENTS.md chuẩn

## 1. Cơ sở tham khảo

| Nguồn | Điểm rút ra |
|---|---|
| Đặc tả AGENTS.md ([github.com/agentsmd/agents.md](https://github.com/agentsmd/agents.md)) | Chỉ là Markdown, không bắt buộc mục nào. **File AGENTS.md gần file đang sửa nhất được ưu tiên**; yêu cầu trong chat ghi đè tất cả. Agent sẽ tự chạy các lệnh kiểm tra được liệt kê trong file. |
| GitHub Blog – phân tích hơn 2.500 file agents.md | File tốt có: **lệnh chính xác đặt ở đầu**, ranh giới rõ theo 3 mức (**Luôn làm / Hỏi trước / Không bao giờ**), ví dụ code thật thay vì mô tả, phạm vi cụ thể. |
| Nghiên cứu ETH Zurich 2026 (138 repo) | File viết kiểu README dài dòng **làm giảm** hiệu quả và tốn token. Hữu ích nhất là các chỉ dẫn mà AI **không tự suy ra được**: lệnh build/test, "bẫy", cách tự kiểm tra. |
| AGENTS.md của [apache/airflow](https://github.com/apache/airflow/blob/main/AGENTS.md) | Cấu trúc: Environment Setup → Commands → Repository Structure → Architecture Boundaries → Security → Coding/Testing Standards → Commits & PRs → Boundaries (Ask first / Never). |
| AGENTS.md của [vercel/next.js](https://github.com/vercel/next.js/blob/canary/AGENTS.md) | Có mục **Anti-patterns / Gotchas** (các bẫy hay gặp), mục **Secrets & Env Safety** và quy trình xử lý CI fail. |

**Nguyên tắc rút ra (app sẽ tự kiểm tra và cảnh báo):**
1. Ngắn gọn: mục tiêu **dưới 150 dòng**, cảnh báo nếu vượt 300 dòng.
2. Ghi **lệnh copy là chạy được**, không mô tả chung chung.
3. Chỉ ghi những điều AI **không tự đọc ra từ code**.
4. Mỗi quy tắc là **một câu, có thể kiểm tra được** ("Dùng `pnpm`, không dùng `npm`").
5. Luôn có mục **Ranh giới** gồm 3 mức.
6. Dùng ví dụ code thật (✅ nên / ❌ không nên) cho các quy ước quan trọng.
7. Là tài liệu sống: mỗi lần AI mắc lỗi thì thêm một quy tắc.

## 2. Khung chuẩn (10 mục)

Mục có dấu ★ là bắt buộc. Các mục khác có thể bật/tắt tùy dự án.

```markdown
# AGENTS.md – {{ten_du_an}}

## 1. Tổng quan dự án ★
{{1–3 câu: app làm gì, cho ai}}
- Tech stack: {{framework, ngôn ngữ, phiên bản chính}}
- Trạng thái: {{MVP / đang phát triển / production}}

## 2. Lệnh ★
- Cài đặt: `{{lenh_cai_dat}}`
- Chạy dev: `{{lenh_dev}}`
- Build: `{{lenh_build}}`
- Test tất cả: `{{lenh_test}}` · Test 1 file: `{{lenh_test_1_file}}`
- Lint / format / type-check: `{{lenh_lint}}`

## 3. Cấu trúc thư mục
- `src/components/` – {{…}}
- `src/lib/` – {{…}}
- Không sửa tay: {{thư mục sinh tự động, ví dụ dist/, generated/}}

## 4. Quy ước code ★
- {{Quy tắc ngắn, kiểm tra được}}
- Ví dụ:
  ✅ `{{code nên viết}}`
  ❌ `{{code không nên viết}}`

## 5. Kiểm thử
- Framework: {{…}}; test đặt ở {{…}}
- Code mới/sửa đổi phải có test. Chạy `{{lenh_test}}` trước khi báo hoàn thành.

## 6. Git & Pull Request
- Tên nhánh: `{{feat/…, fix/…}}` · Commit: {{Conventional Commits}}
- Trước khi commit: chạy lint + test.

## 7. Bảo mật & bí mật
- Không bao giờ commit secret/API key. Biến môi trường đặt trong `{{.env.local}}`.
- {{Dữ liệu nhạy cảm cần lưu ý}}

## 8. Bẫy thường gặp (Gotchas)
- {{Điều dễ sai mà AI không tự biết, ví dụ: "Phải build lại package X trước khi test"}}

## 9. Ranh giới ★
- ✅ **Luôn làm:** {{chạy test trước khi báo xong; tuân thủ quy ước ở mục 4}}
- ⚠️ **Hỏi trước:** {{thêm dependency; đổi schema dữ liệu; refactor lớn; xóa file}}
- 🚫 **Không bao giờ:** {{commit secret; sửa file sinh tự động; git push --force}}

## 10. Cách làm việc với tôi
- Ngôn ngữ trả lời: {{tiếng Việt}}. Tôi {{không biết code}} → giải thích đơn giản.
- {{Lập kế hoạch và chờ duyệt trước khi làm task lớn}}
```

## 3. Ba cách tạo và chỉnh sửa (dùng chung một khung)

| Chế độ | Cách hoạt động |
|---|---|
| **Hỏi đáp (Wizard)** | Đi lần lượt qua 10 mục. Mỗi mục có câu hỏi gợi ý và lựa chọn sẵn. Có thể **bỏ qua** mục không bắt buộc. Cuối cùng AI viết thành file hoàn chỉnh. |
| **Nhập tự do** | Dán ghi chú lộn xộn, README hoặc file quy tắc cũ. AI **phân loại** nội dung vào 10 mục và chỉ ra mục còn thiếu. |
| **Chỉnh sửa theo mục** | Màn hình chia hai bên: trái là danh sách 10 mục (bật/tắt, kéo thả thứ tự), phải là trình soạn thảo. Mỗi mục có nút ✨ *Viết lại / Ngắn gọn hơn / Thêm ví dụ / Kiểm tra*. Có thể thêm **mục tùy chỉnh**. |

**Câu hỏi gợi ý của Wizard cho từng mục:**

| Mục | Câu hỏi | Lựa chọn nhanh |
|---|---|---|
| 1 | App làm gì, cho ai? Đang ở giai đoạn nào? | MVP · Đang phát triển · Production |
| 2 | Dùng lệnh gì để cài đặt, chạy, test? | Bộ lệnh npm · pnpm · bun · Python (pip/uv) · "Chưa biết, để AI đề xuất" |
| 3 | Thư mục quan trọng nào? Có thư mục nào không được sửa? | Lấy từ Hồ sơ dự án |
| 4 | Quy ước code? | TypeScript strict · Functional components · Đặt tên camelCase/kebab-case · Không dùng `any` · Comment tiếng Việt/Anh |
| 5 | Test thế nào? | Vitest · Jest · Playwright · Pytest · Bắt buộc test cho code mới |
| 6 | Quy tắc git? | Conventional Commits · Nhánh feat/fix · Không commit thẳng vào main |
| 7 | Có dữ liệu nhạy cảm nào? | API key · Dữ liệu cá nhân · Không có |
| 8 | AI từng mắc lỗi gì lặp lại? | Tự do |
| 9 | Việc gì AI phải hỏi trước / tuyệt đối không làm? | Danh sách gợi ý theo 3 mức (tích chọn) |
| 10 | Bạn muốn AI làm việc với bạn thế nào? | Tiếng Việt · Giải thích đơn giản · Lên kế hoạch trước · Tự làm hết |

## 4. Kiểm tra chất lượng (nút "Kiểm tra AGENTS.md")
App chấm điểm theo các tiêu chí sau, rồi đưa ra gợi ý sửa cụ thể:
- Có đủ các mục ★ hay chưa.
- Các lệnh có nằm trong khối `code` hay không.
- Độ dài (số dòng, ước tính số token).
- Có câu mơ hồ không ("viết code sạch", "cẩn thận"). Gợi ý thay bằng quy tắc kiểm tra được.
- Có quy tắc mâu thuẫn nhau không.
- Có lộ secret (chuỗi trông giống API key) không.

## 5. Xuất file và tương thích với các công cụ
- **AGENTS.md** là nguồn chính. Codex, Cursor, Copilot, Jules, Aider và nhiều công cụ khác đọc file này trực tiếp.
- **CLAUDE.md** (cho Claude Code): xuất kèm file 1 dòng `@AGENTS.md`, để Claude Code nạp nội dung AGENTS.md.
- **Gemini CLI**: xuất kèm file `.gemini/settings.json` với nội dung `{"context": {"fileName": "AGENTS.md"}}`.
- **Monorepo**: hỗ trợ nhiều file AGENTS.md theo thư mục con (`packages/api/AGENTS.md`). Nhắc người dùng rằng file gần nhất sẽ được ưu tiên.
- Tải về dạng `.zip` gồm đúng cấu trúc thư mục, giải nén vào dự án là dùng được ngay.
