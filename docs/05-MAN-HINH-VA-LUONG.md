# Thiết kế: Màn hình và luồng sử dụng (Bước 3)

## 1. Bố cục chung

```
┌──────────────┬─────────────────────────────────────────────┐
│ Prompt Studio│  [Dự án đang chọn ▾]            [🔍 Tìm]     │
│              ├─────────────────────────────────────────────┤
│ 📁 Dự án     │                                             │
│ ✨ Tạo prompt│              Nội dung màn hình              │
│ 📄 AGENTS.md │                                             │
│ 🔧 Cải thiện │                                             │
│ 📚 Thư viện  │                                             │
│ ⚙️ Cài đặt   │                                             │
└──────────────┴─────────────────────────────────────────────┘
```
- Thanh bên trái dùng để chuyển chức năng. Trên điện thoại, thanh này chuyển thành menu ☰.
- **Ô chọn dự án** ở trên cùng: mọi chức năng đều làm việc theo dự án đang chọn.
  Có thêm lựa chọn "Không chọn dự án (dùng chung)".

## 2. Danh sách màn hình

| # | Màn hình | Thành phần chính | Tính năng PRD |
|---|---|---|---|
| M1 | **Dự án** (trang chủ) | Lưới thẻ dự án (tên, mô tả, giai đoạn hiện tại, lần sửa cuối) · Nút "+ Dự án mới" · Ô tìm kiếm · Banner nhắc sao lưu | A1, A8 |
| M2 | **Chi tiết dự án** | Thanh tiến độ 11 giai đoạn (bấm vào một giai đoạn để mở prompt mẫu tương ứng) · Hồ sơ dự án (form) · Các tài liệu đã tạo (AGENTS.md, prompt đã lưu) · Nút Nhân bản / Xóa | A1, A5 |
| M3 | **Tạo prompt – chọn loại** | 5 nhóm thẻ loại prompt · Ô tìm kiếm · Gợi ý "Giai đoạn hiện tại của dự án nên dùng: …" | A4 |
| M4 | **Tạo prompt – bảng nhập** | Bên trái: bảng nhập (các khối, gợi ý dạng nút chọn, nút ✨ ở từng ô) · Bên phải: xem trước prompt hoàn chỉnh · Thanh dưới: Ngôn ngữ · ✨ Trau chuốt toàn bộ · 💾 Lưu vào thư viện · 📋 Copy | A4 |
| M5 | **Trau chuốt – so sánh** (hộp thoại) | Bản cũ / bản mới đặt cạnh nhau, tô màu chỗ thay đổi · Câu hỏi AI cần bạn trả lời (nếu có) · Chấp nhận / Bỏ qua | A3, A4 |
| M6 | **AGENTS.md** | Chọn chế độ: Hỏi đáp / Nhập tự do / Chỉnh sửa · Danh sách 10 mục (bật/tắt, kéo thả) · Trình soạn thảo + xem trước · ✨ cho từng mục · Nút Kiểm tra · Tải về (.md / .zip có CLAUDE.md, GEMINI) | A2, A6 |
| M7 | **Cải thiện** | Ô dán hoặc tải file lên · Chọn loại nội dung (AGENTS.md / prompt) · Kết quả: điểm theo tiêu chí, danh sách vấn đề, bản đề xuất (mở M5) | A3 |
| M8 | **Thư viện** | Tab: Quy trình chuẩn · Của dự án · Dùng chung · Lọc theo thẻ · Thẻ prompt (Copy / Mở trong bảng nhập / Sửa) | A5 |
| M9 | **Điền biến** (hộp thoại) | Mỗi biến `{{…}}` là một ô nhập (đã điền sẵn giá trị mặc định) · Xem trước · Copy | A5 |
| M11 | **Điền mẫu Word/Excel** *(Sắp có – giai đoạn 2)* | Bản đầu tiên chỉ có tab giữ chỗ, gắn nhãn "Sắp có", hiện bố cục dự kiến (các nút chưa hoạt động): quy trình 4 bước (Tải file mẫu → Đánh dấu vị trí thay đổi → Điền dữ liệu → Kiểm tra và xuất) · Khu tải file · Bảng vị trí biến (Biến, Vị trí trong file, Kiểu, Giá trị trong mẫu) · Danh sách mẫu đã lưu | D |
| M10 | **Cài đặt** | API key Claude / Gemini (ẩn/hiện, nút Kiểm tra) · Model mặc định · Ngôn ngữ mặc định · Sao lưu (tải .json) · Khôi phục (chọn file) · Xóa toàn bộ dữ liệu | A7, A8 |

## 3. Luồng chính

```mermaid
flowchart LR
  A[M1 Dự án] -->|+ Dự án mới| B[M2 Chi tiết dự án<br/>điền Hồ sơ]
  B -->|Bấm giai đoạn trên thanh tiến độ| D[M4 Bảng nhập<br/>đã chọn loại]
  B --> F[M6 AGENTS.md]
  C[M3 Chọn loại prompt] --> D
  D -->|✨| E[M5 So sánh trước/sau]
  E --> D
  D -->|📋 Copy| X((Dán vào<br/>công cụ lập trình))
  D -->|💾 Lưu| G[M8 Thư viện]
  G -->|Dùng| H[M9 Điền biến] --> X
  F -->|Tải về| Y((Đặt vào<br/>thư mục code))
  I[M7 Cải thiện] --> E
```

**Luồng 1 – Bắt đầu dự án mới:** M1 → "+ Dự án mới" → M2 điền hồ sơ → M6 Hỏi đáp → tải AGENTS.md.
**Luồng 2 – Viết prompt cho một việc:** M3 chọn "Sửa lỗi" → M4 điền (gợi ý đã tích sẵn) → ✨ → M5 chấp nhận → 📋 Copy.
**Luồng 3 – Dùng lại prompt:** M8 → chọn prompt → M9 điền biến → 📋 Copy.

## 4. Trạng thái cần thiết kế
- **Trống:** chưa có dự án hoặc chưa có prompt. Hiện hướng dẫn và nút hành động.
- **Đang tải:** chữ hiện dần theo luồng (streaming) + nút "Dừng".
- **Lỗi:** chưa có API key, key sai, mất mạng, hết hạn mức. Thông báo tiếng Việt kèm nút "Đi tới Cài đặt" hoặc "Thử lại".
- **Thành công:** thông báo nhỏ "Đã copy", "Đã lưu".

## 5. Phong cách (đã chốt với chủ dự án ngày 18/10/2026)

| Hạng mục | Quyết định |
|---|---|
| Cảm giác tổng thể | **Chuyên nghiệp kiểu doanh nghiệp**: bố cục chặt, dùng bảng nhiều, màu trung tính |
| Màu chủ đạo | **Xanh lục (teal)** `#0F766E` ở chế độ sáng, `#2DB3A6` ở chế độ tối. Nút AI dùng màu hổ phách để phân biệt |
| Mật độ | **Gọn, nhiều thông tin**: chữ cơ bản 13px, nút cao 36px, ít khoảng trắng |
| Điều hướng | **Thanh menu bên trái**, có nút **thu gọn / mở rộng ở cuối thanh**. Khi thu gọn, **toàn bộ** thanh bên (menu và mục "Đã ghim") chỉ còn biểu tượng. Prompt đã ghim hiện thành ô chữ cái đầu, rê chuột thấy tên, bấm để copy |
| Màn hình chính | **Laptop 13–15 inch** (chiều rộng 1280–1440px). Trên màn hình nhỏ vẫn dùng được |
| Trình tạo prompt | **Hai cột cạnh nhau**: bảng nhập bên trái, xem trước bên phải |
| Hiển thị gợi ý | **Ô tích (checkbox) kèm câu đầy đủ** sẽ chèn vào prompt |
| Danh sách | Dự án và Thư viện hiển thị dạng **bảng** (table) thay vì thẻ |
| Tiện ích | **Phím tắt**, **chuyển sáng/tối**, **ghim prompt hay dùng** lên thanh bên |

**Phím tắt dự kiến:** `Ctrl+K` tìm nhanh · `Ctrl+Enter` Copy prompt · `Ctrl+S` lưu · `Ctrl+B` thu gọn/mở thanh bên · `Esc` đóng hộp thoại.

- Chữ hiển thị tiếng Việt.
- Mockup tương tác (bấm thử được): https://claude.ai/artifact/5ehYGPek22DsNPgTX2Buan. Đăng nhập claude.ai để mở.
- Font chữ: Be Vietnam Pro (giao diện), JetBrains Mono (khung xem trước prompt).
