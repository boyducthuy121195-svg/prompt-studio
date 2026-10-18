# PRD – Prompt Studio (tên tạm)

> Tài liệu yêu cầu sản phẩm. Là "kim chỉ nam" cho mọi bước thiết kế và xây dựng.
> Phiên bản: 0.2 – 18/10/2026 (bổ sung Quy trình chuẩn, Trình tạo prompt dạng bảng, Khung AGENTS.md, module Word/Excel)
>
> Tài liệu thiết kế chi tiết: `docs/01-QUY-TRINH-XAY-DUNG-APP.md` · `docs/02-TRINH-TAO-PROMPT.md` · `docs/03-KHUNG-AGENTS-MD.md` · `docs/04-THU-VIEN-GOI-Y.md`

## 1. Mục tiêu

Một web app cá nhân giúp **tạo, cải thiện và quản lý** prompt và file quy tắc cho AI lập trình
(chuẩn chính là **AGENTS.md**, dùng chung được cho nhiều công cụ AI khác nhau), được sắp xếp theo **từng dự án**.
App gọi **Claude** hoặc **Gemini** để sinh và cải thiện nội dung.

**Thành công khi:** tạo được một file AGENTS.md tốt cho dự án mới trong vòng chưa đến 10 phút,
và lấy lại được prompt hay dùng chỉ bằng một lần copy.

## 2. Người dùng

- Chỉ một người dùng (chủ app), không cần đăng nhập.
- Không phải lập trình viên chuyên nghiệp nên giao diện phải dễ hiểu và hoàn toàn bằng tiếng Việt.

## 3. Ràng buộc kỹ thuật (đã chốt)

| Hạng mục | Quyết định |
|---|---|
| Nơi chạy | Web app có link, mở bằng trình duyệt |
| Lưu dữ liệu | Ngay trong trình duyệt (IndexedDB), có sao lưu/khôi phục bằng file |
| AI | Claude (Anthropic API) và Gemini (Google AI API), người dùng tự nhập API key |
| API key | Chỉ lưu trong trình duyệt của người dùng, không gửi đi đâu ngoài Anthropic/Google |
| Định dạng chính | AGENTS.md (có tùy chọn xuất thêm CLAUDE.md và GEMINI.md trỏ về AGENTS.md) |

## 4. Tính năng

### Mức A – Bắt buộc cho bản đầu tiên (MVP)

**A1. Quản lý dự án**
- Tạo, sửa, xóa, nhân bản dự án.
- Mỗi dự án có **Hồ sơ dự án**: tên, mô tả, mục tiêu, công nghệ sử dụng, lệnh chạy/build/test,
  cấu trúc thư mục, quy ước viết code, những điều AI **không được** làm, ghi chú khác.
- Trang chủ liệt kê dự án và hiển thị lần sửa gần nhất.

**A2. Trình tạo AGENTS.md theo khung chuẩn 10 mục** – chi tiết: `docs/03-KHUNG-AGENTS-MD.md`
- Khung chuẩn được tổng hợp từ đặc tả AGENTS.md, phân tích của GitHub trên hơn 2.500 repo và các repo lớn (Airflow, Next.js).
- 3 chế độ dùng chung một khung: **Hỏi đáp (Wizard)**, **Nhập tự do** (AI phân loại vào các mục), **Chỉnh sửa theo mục**
  (bật/tắt mục, kéo thả thứ tự, thêm mục tùy chỉnh, nút ✨ cho từng mục).
- Nút "Kiểm tra AGENTS.md": chấm điểm, cảnh báo khi quá dài, có câu mơ hồ, quy tắc mâu thuẫn hoặc lộ secret.
- Có thể điền nhanh từ Hồ sơ dự án. Chọn Claude hoặc Gemini để sinh nội dung.

**A3. Cải thiện file và prompt có sẵn**
- Dán hoặc tải lên nội dung có sẵn (AGENTS.md, CLAUDE.md, một prompt bất kỳ).
- AI chấm điểm theo tiêu chí (rõ ràng, cụ thể, đầy đủ, không mâu thuẫn, độ dài hợp lý),
  liệt kê vấn đề và đề xuất bản mới.
- Xem **so sánh trước/sau** và chọn "Chấp nhận" hoặc "Bỏ qua".

**A4. Trình tạo prompt theo loại, dạng bảng nhập** – chi tiết: `docs/02-TRINH-TAO-PROMPT.md`
- Danh sách **18 loại prompt có sẵn** chia 5 nhóm (Sản phẩm & thiết kế, Kỹ thuật & kế hoạch, Viết code,
  Chất lượng & vận hành, Tự do).
- **Bộ gợi ý cố định** (chi tiết: `docs/04-THU-VIEN-GOI-Y.md`) tổng hợp từ hướng dẫn viết prompt của Anthropic và OpenAI.
  Mỗi loại prompt có sẵn các gợi ý được tích mặc định. Người dùng chỉ cần tích chọn, không cần chỉnh danh sách.
- Ngôn ngữ prompt mặc định: tiếng Việt, giữ thuật ngữ tiếng Anh. Đầu ra là **Copy** để dán sang công cụ lập trình.
- Mỗi loại là một **bảng nhập theo khung 8 khối** (Vai trò, Bối cảnh, Nhiệm vụ, Đầu vào, Ràng buộc,
  Định dạng đầu ra, Tiêu chí hoàn thành, Cách làm việc), cộng thêm các trường riêng của loại đó.
- Có trường **lựa chọn gợi ý** (chọn một hoặc nhiều, có mục "Khác…"), trường tự do và trường tự lấy từ Hồ sơ dự án.
- **✨ Trau chuốt bằng AI** (chỉ chạy khi bấm nút) cho từng ô hoặc toàn bộ prompt: chuẩn hóa thuật ngữ kỹ thuật, phát hiện chỗ thiếu
  hoặc mâu thuẫn, hiện so sánh trước/sau. AI không được tự thêm yêu cầu mới.
- Có sẵn bảng thuật ngữ Việt ↔ Anh để AI dùng thuật ngữ nhất quán.

**A5. Thư viện prompt theo dự án**
- Lưu, sửa, xóa, gắn thẻ và tìm kiếm prompt.
- Hỗ trợ biến dạng `{{ten_bien}}` và `{{ten_bien|giá trị mặc định}}`: khi dùng, app hiện ô để điền nhanh rồi copy.
- Có thư viện "Dùng chung" cho các prompt không thuộc dự án nào.
- **Có sẵn bộ sưu tập "Quy trình chuẩn xây dựng app"** (chỉ đọc), gồm 11 giai đoạn và prompt mẫu cho từng giai đoạn
  (chi tiết: `docs/01-QUY-TRINH-XAY-DUNG-APP.md`). Có thể nhân bản về dự án của mình.
  Mỗi prompt mẫu mở được ngay trong Trình tạo prompt dưới dạng bảng nhập.
- Trong mỗi dự án có **thanh tiến độ theo giai đoạn**, cho biết dự án đang ở giai đoạn nào và đã có tài liệu nào (PRD, PLAN...).

**A6. Trình soạn thảo và xuất file**
- Soạn Markdown, có xem trước kết quả hiển thị.
- Copy một chạm, tải file `.md`.
- Tùy chọn tải thêm `CLAUDE.md` / `GEMINI.md` dạng ngắn trỏ về AGENTS.md để mọi công cụ cùng dùng một nguồn.

**A7. Cài đặt**
- Nhập API key cho Claude và Gemini, có nút "Kiểm tra key".
- Chọn AI và model mặc định.
- Chỉnh "chỉ dẫn hệ thống" (meta-prompt) mà app dùng khi tạo hoặc cải thiện, dành cho người dùng nâng cao.

**A8. Sao lưu / khôi phục**
- Xuất toàn bộ dữ liệu ra một file `.json` và nhập lại khi cần (đổi máy, đổi trình duyệt).
- Nhắc sao lưu nếu đã quá 7 ngày chưa sao lưu.

### Mức B – Nên có (phiên bản 1.1)

- **B1. Lịch sử phiên bản**: mỗi lần lưu file quy tắc tạo một phiên bản, có thể xem và khôi phục bản cũ.
- **B2. Mẫu khởi đầu**: AGENTS.md mẫu cho các loại dự án phổ biến (web React/Next.js, Python, mobile...).
- **B3. So sánh Claude và Gemini**: chạy cùng một yêu cầu trên cả hai AI và đặt kết quả cạnh nhau để chọn bản tốt hơn.
- **B4. Ước tính chi phí**: hiện số token và chi phí ước tính của mỗi lần gọi AI.
- **B5. Giao diện sáng/tối.**

### Mức D – Module "Điền mẫu Word/Excel" (giai đoạn 2, sau khi xong mức A và B)

**Vấn đề:** cần tạo file Word/Excel **giống 100%** file mẫu (định dạng, bảng, công thức, ô gộp, header/footer...)
và chỉ thay đổi ở những vị trí có nội dung thay đổi.

**Hướng tiếp cận dự kiến** (sẽ nghiên cứu kỹ khi bắt đầu module):
- File .docx và .xlsx thực chất là một gói nén chứa các file XML. Chỉ **thay nội dung chữ ở đúng vị trí biến**,
  giữ nguyên mọi thứ khác. Nhờ vậy định dạng được bảo toàn tuyệt đối, khác với cách "đọc rồi tạo file mới" (cách này hay làm mất định dạng).
- **Bước 1 – Đánh dấu mẫu:** AI phân tích file mẫu và đề xuất các vị trí biến động (tên, ngày, số tiền, dòng bảng lặp lại...).
  Người dùng xác nhận, app chèn biến `{{...}}` vào đúng vị trí. Có xử lý trường hợp Word tách một chữ thành nhiều đoạn định dạng.
- **Bước 2 – Điền dữ liệu:** nhập bằng form, dán dữ liệu, hoặc điền hàng loạt từ một bảng Excel để tạo nhiều file.
- **Bước 3 – Kiểm tra:** so sánh cấu trúc file kết quả với file mẫu và báo những chỗ khác ngoài các vị trí biến.
- Toàn bộ xử lý chạy trong trình duyệt, file không bị gửi lên server. Chỉ phần phân tích bằng AI mới gửi nội dung chữ cho AI.

### Mức C – Để sau

- Đồng bộ đám mây để dùng trên nhiều máy.
- Xuất thêm định dạng khác (Cursor rules, Copilot instructions...).
- Đọc trực tiếp kho code trên GitHub để tự điền Hồ sơ dự án.

## 5. Câu chuyện người dùng (MVP)

1. Là người dùng, tôi muốn tạo dự án mới và điền hồ sơ để AI hiểu bối cảnh dự án của tôi.
2. Là người dùng, tôi muốn trả lời vài câu hỏi rồi nhận được AGENTS.md hoàn chỉnh để dán vào dự án code.
3. Là người dùng, tôi muốn dán file quy tắc cũ vào để AI chỉ ra chỗ yếu và viết lại tốt hơn.
4. Là người dùng, tôi muốn mô tả một tác vụ và nhận prompt chi tiết để giao cho AI viết code.
5. Là người dùng, tôi muốn lưu prompt hay dùng theo từng dự án để lần sau chỉ cần copy.
6. Là người dùng, tôi muốn sao lưu dữ liệu ra file để không bị mất khi đổi máy hoặc xóa trình duyệt.

## 6. Tiêu chí hoàn thành (MVP)

- [ ] Tạo, sửa và xóa được dự án. Tải lại trang thì dữ liệu vẫn còn.
- [ ] Wizard sinh được AGENTS.md bằng **cả** Claude và Gemini.
- [ ] Tính năng cải thiện hiển thị được điểm, danh sách vấn đề và so sánh trước/sau.
- [ ] Prompt có biến `{{...}}` điền được rồi copy đúng nội dung.
- [ ] Copy và tải file `.md` hoạt động.
- [ ] Key sai hoặc mất mạng thì app báo lỗi dễ hiểu bằng tiếng Việt, không bị treo.
- [ ] Xuất file sao lưu, xóa dữ liệu, nhập lại thì khôi phục đầy đủ.
- [ ] Dùng được trên màn hình laptop và điện thoại.

## 7. Ngoài phạm vi

- Nhiều người dùng, đăng nhập, phân quyền.
- Server riêng hoặc cơ sở dữ liệu trên mạng.
- Thanh toán.
