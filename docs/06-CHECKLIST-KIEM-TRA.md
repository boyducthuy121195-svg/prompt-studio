# Checklist tự kiểm tra bản MVP (task 14)

> Cách dùng: chạy app (`npm run dev`, mở http://localhost:5173), làm lần lượt từng dòng.
> Dòng nào **không đúng**, ghi lại ở mục "Ghi chú lỗi" cuối file (bấm gì → thấy gì → mong muốn gì),
> rồi gửi một lần cho AI sửa. Đánh dấu `[x]` cho dòng đã đạt.

## 0. Chuẩn bị
- [ ] Vào **Cài đặt**, dán API key Claude → bấm **Kiểm tra** → thấy "Key hợp lệ".
- [ ] (Nếu có) dán key Gemini → **Kiểm tra** → model tự chọn Gemini 3.8 Flash (hoặc báo bản Flash thay thế).
- [ ] Trên header hiện "AI: Claude · opus-5-5".

## 1. Luồng 1 – Bắt đầu dự án mới
- [ ] **Dự án → Dự án mới**, nhập tên "Prompt Studio" → mở trang chi tiết.
- [ ] Điền Hồ sơ (Công nghệ, Lệnh…) → **Lưu hồ sơ** (hoặc Ctrl+S) → tải lại trang vẫn còn.
- [ ] Bấm giai đoạn **8 · Kiểm thử** trên thanh tiến độ → báo đã chuyển giai đoạn.
- [ ] **AGENTS.md → Hỏi đáp** → đi hết 10 câu → **✨ Tạo AGENTS.md bằng AI** → nội dung vào đúng từng mục.
- [ ] Ở một mục, bấm **✨ Viết lại** → hộp so sánh có tô vàng, có khu "Quy tắc nên thêm…", tích một quy tắc → Chấp nhận → quy tắc nằm cuối mục.
- [ ] Khung **Kiểm tra chất lượng** (chạy trên máy, không tốn tiền) và nút **✨ Kiểm tra lại bằng AI** đều hiện nhận xét.
- [ ] **Tải gói .zip** → giải nén có AGENTS.md, CLAUDE.md, .gemini/settings.json.

## 2. Luồng 2 – Viết prompt cho một việc
- [ ] **Tạo prompt → Sửa lỗi** → gợi ý đã tích sẵn, khung xem trước bên phải cập nhật khi gõ.
- [ ] Bấm **✨** cạnh ô Nhiệm vụ → bản viết lại sát với dự án; có "Gợi ý bổ sung cho ô này".
- [ ] Bấm **✨ Trau chuốt toàn bộ** → có "Những gì AI đã sửa", câu hỏi (nếu có), gợi ý thêm kèm lý do.
- [ ] Tích một gợi ý → Chấp nhận → câu đó nằm đúng khối (Ràng buộc / Tiêu chí…) trong khung xem trước.
- [ ] Bấm **Dừng** khi AI đang chạy → dừng được, không treo.
- [ ] **Ctrl+Enter** → "Đã copy" → dán vào Claude Code / Notepad thấy đúng nội dung.
- [ ] **Ctrl+S** → lưu vào Thư viện với tên và thẻ.

## 3. Luồng 3 – Dùng lại prompt
- [ ] **Thư viện → Dùng chung / Của dự án** thấy prompt vừa lưu; Sửa, Mở bảng nhập, Xóa đều chạy.
- [ ] Ghim một prompt có chỗ trống `{{…}}` → bấm trên thanh bên → hộp Điền nhanh → điền → **Ctrl+Enter** copy đúng.
- [ ] Ghim prompt không có chỗ trống → bấm là copy ngay.

## 4. Cải thiện
- [ ] Dán prompt "Bạn là lập trình viên giỏi, viết code sạch…" → **✨ Phân tích** → có điểm 5 tiêu chí, vấn đề kèm cách sửa.
- [ ] Bỏ tích bớt vấn đề → **✨ Viết lại theo N vấn đề đã chọn** → AI chỉ sửa các vấn đề còn tích.
- [ ] Tải lên một file CLAUDE.md có sẵn → tự chọn loại AGENTS.md → sau khi Chấp nhận, bấm **Dùng làm AGENTS.md của "…"**.

## 5. Tìm nhanh và phím tắt
- [ ] **Ctrl+K** ở bất kỳ trang nào → gõ "sua loi" (không dấu) → Enter → mở bảng nhập Sửa lỗi.
- [ ] Tìm tên dự án, tên prompt đã lưu → Enter mở đúng.
- [ ] **Ctrl+B** thu gọn / mở thanh bên; **Esc** đóng mọi hộp thoại.

## 6. Sao lưu và an toàn dữ liệu
- [ ] **Cài đặt → Tải file sao lưu** (không tích "Kèm API key") → mở file bằng Notepad, không thấy key.
- [ ] **Xóa toàn bộ dữ liệu** (xác nhận 2 lần) → app trống.
- [ ] **Khôi phục từ file** → xem trước số dự án / prompt → Khôi phục → mọi thứ quay lại đủ.
- [ ] Thử khôi phục một file bất kỳ không phải file sao lưu → báo lỗi dễ hiểu, dữ liệu không đổi.
- [ ] Sau 7 ngày không sao lưu, trang Dự án hiện banner nhắc.

## 7. Giao diện
- [ ] Chế độ **Tối** (nút trên header): mọi màn hình đọc rõ, tải lại vẫn giữ.
- [ ] Thu nhỏ cửa sổ trình duyệt (hoặc mở trên điện thoại cùng mạng): không bị tràn ngang, bấm được mọi nút.
- [ ] Mọi chữ là tiếng Việt; thông báo lỗi nói rõ chuyện gì xảy ra và cần làm gì.

## Ghi chú lỗi
<!-- Ví dụ: "Mục 2, dòng 3: bấm Chấp nhận thì gợi ý nằm cuối prompt, mong muốn nằm trong khối Ràng buộc." -->
-
