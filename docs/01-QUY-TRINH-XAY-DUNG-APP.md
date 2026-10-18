# Quy trình chuẩn xây dựng app với AI

> Tài liệu này được nạp sẵn vào **Thư viện → Bộ sưu tập "Quy trình chuẩn"** (chỉ đọc).
> Người dùng có thể **nhân bản** về dự án của mình rồi sửa.
> Mỗi prompt trong bộ sưu tập liên kết với một **loại prompt** trong Trình tạo prompt
> (xem `02-TRINH-TAO-PROMPT.md`), nên có thể mở ngay dưới dạng bảng nhập.

## Cấu trúc chung của mọi prompt

Mọi prompt trong quy trình đều theo **khung 8 khối**. Thứ tự này giúp AI hiểu đúng ý nhất:

| # | Khối | Nội dung | Ví dụ |
|---|---|---|---|
| 1 | **Vai trò** | AI đóng vai ai | "Bạn là Senior Product Manager" |
| 2 | **Bối cảnh** | Dự án, người dùng, tình trạng hiện tại (tự lấy từ Hồ sơ dự án) | "App web quản lý prompt, React + TypeScript…" |
| 3 | **Nhiệm vụ** | Việc cần làm, dùng **động từ cụ thể** | "Viết PRD cho tính năng Thư viện prompt" |
| 4 | **Đầu vào** | Tài liệu hoặc dữ liệu đính kèm | "@PRD.md, ảnh chụp màn hình lỗi" |
| 5 | **Ràng buộc** | Giới hạn, điều cấm, công nghệ bắt buộc | "Không thêm thư viện mới" |
| 6 | **Định dạng đầu ra** | Hình thức kết quả | "Bảng Markdown; lưu file PLAN.md" |
| 7 | **Tiêu chí hoàn thành** | Cách biết là đã xong và đúng | "Test chạy pass; có ảnh chụp màn hình" |
| 8 | **Cách làm việc** | Mức tự chủ, có hỏi lại không | "Hỏi tôi trước nếu có điểm chưa rõ" |

Khối 1–3 là bắt buộc. Các khối còn lại nên điền nếu có thông tin.

---

## Giai đoạn 0 – Chuẩn bị
**Đầu ra:** thư mục dự án, kho GitHub, Hồ sơ dự án trong Prompt Studio.
**Việc cần làm:** tạo dự án trong app, điền những gì đã biết vào Hồ sơ dự án.

## Giai đoạn 1 – Khám phá ý tưởng
**Loại prompt:** `Y_TUONG` · **Đầu ra:** bản tóm tắt ý tưởng (Idea Brief)

```
[Vai trò] Bạn là chuyên gia sản phẩm (Product Manager) nhiều kinh nghiệm.
[Bối cảnh] Tôi muốn làm: {{mo_ta_y_tuong}}. Người dùng chính: {{nguoi_dung}}.
[Nhiệm vụ] Phỏng vấn tôi để làm rõ ý tưởng, sau đó viết Idea Brief.
[Cách làm việc] Hỏi từng câu một, tối đa {{so_cau_hoi|10}} câu, giải thích vì sao hỏi.
[Định dạng đầu ra] Idea Brief gồm: vấn đề, người dùng mục tiêu, giá trị cốt lõi,
  3 đối thủ / giải pháp thay thế kèm điểm khác biệt, rủi ro lớn nhất.
```

## Giai đoạn 2 – Yêu cầu sản phẩm (PRD)
**Loại prompt:** `PRD` · **Đầu ra:** `PRD.md`

```
[Vai trò] Bạn là Product Manager.
[Đầu vào] Idea Brief: {{idea_brief}}
[Nhiệm vụ] Viết PRD cho phiên bản {{phien_ban|MVP}}.
[Định dạng đầu ra] Mục tiêu và chỉ số thành công; đối tượng; tính năng chia theo MoSCoW
  (Must/Should/Could/Won't); user stories "Là…, tôi muốn…, để…";
  tiêu chí chấp nhận (acceptance criteria) cho từng story; ngoài phạm vi.
[Ràng buộc] MVP tối đa {{so_tinh_nang|5}} tính năng Must. Dùng ngôn ngữ dễ hiểu.
[Tiêu chí hoàn thành] Mọi Must đều có acceptance criteria kiểm tra được. Lưu file PRD.md.
```

## Giai đoạn 3 – Thiết kế trải nghiệm (UX/UI)
**Loại prompt:** `THIET_KE_UI` · **Đầu ra:** danh sách màn hình, user flow, bản mẫu (mockup) HTML

```
[Vai trò] Bạn là UX/UI Designer.
[Đầu vào] @PRD.md
[Nhiệm vụ] (1) Liệt kê màn hình và thành phần chính của từng màn hình;
  (2) vẽ user flow chính bằng Mermaid; (3) tạo mockup HTML tĩnh để xem trước.
[Ràng buộc] Phong cách {{phong_cach|tối giản}}, màu chủ đạo {{mau_chu_dao}},
  responsive cho {{thiet_bi|laptop và điện thoại}}, giao diện tiếng Việt.
[Tiêu chí hoàn thành] Mọi user story Must đều có màn hình tương ứng.
```

## Giai đoạn 4 – Kiến trúc và công nghệ
**Loại prompt:** `KIEN_TRUC` · **Đầu ra:** `ARCHITECTURE.md`

```
[Vai trò] Bạn là Software Architect.
[Đầu vào] @PRD.md
[Nhiệm vụ] Đề xuất tech stack và kiến trúc. Đưa ra 1 phương án khuyến nghị kèm lý do.
[Ràng buộc] Ngân sách {{ngan_sach|miễn phí}}; nơi triển khai {{hosting}};
  người dùng không biết code nên ưu tiên công nghệ phổ biến, dễ bảo trì.
[Định dạng đầu ra] Sơ đồ thành phần; mô hình dữ liệu (data model); danh sách
  thư viện chính; ước tính chi phí hằng tháng; rủi ro kỹ thuật.
  Giải thích từng phần bằng ngôn ngữ đời thường.
```

## Giai đoạn 5 – Lập kế hoạch
**Loại prompt:** `KE_HOACH` · **Đầu ra:** `PLAN.md`, `AGENTS.md` bản đầu

```
[Vai trò] Bạn là Tech Lead.
[Đầu vào] @PRD.md @ARCHITECTURE.md
[Nhiệm vụ] Chia MVP thành các task nhỏ, mỗi task là một "lát cắt dọc" (vertical slice):
  làm xong là chạy và nhìn thấy kết quả được.
[Định dạng đầu ra] Bảng: STT | Task | Phụ thuộc | Cách kiểm tra | Ước lượng.
  Lưu file PLAN.md. Đồng thời tạo AGENTS.md theo khung chuẩn (xem 03-KHUNG-AGENTS-MD.md).
```

## Giai đoạn 6 – Dựng khung dự án (Scaffold)
**Loại prompt:** `KHOI_TAO` · **Đầu ra:** dự án chạy được, commit đầu tiên

```
[Nhiệm vụ] Khởi tạo dự án theo @ARCHITECTURE.md: cài dependency, cấu hình lint/format/test,
  tạo trang chủ trống, khởi tạo git và commit.
[Tiêu chí hoàn thành] Lệnh dev, build và test đều chạy thành công; có ảnh chụp trang chủ;
  ghi các lệnh này vào mục "Lệnh" của AGENTS.md.
```

## Giai đoạn 7 – Xây dựng tính năng (lặp lại)
**Loại prompt:** `TINH_NANG`, `SUA_LOI`, `REFACTOR` · **Đầu ra:** code + test + commit

```
[Nhiệm vụ] Thực hiện task {{so_task}} trong @PLAN.md: {{ten_tinh_nang}}.
[Đầu vào] Yêu cầu chi tiết: {{mo_ta}}. Acceptance criteria: {{tieu_chi}}.
[Ràng buộc] Tuân thủ AGENTS.md. Không sửa ngoài phạm vi task.
[Cách làm việc] Đọc code liên quan → nêu kế hoạch ngắn → làm → chạy test → tự kiểm tra.
  Nếu có điểm chưa rõ, hỏi tôi trước khi làm.
[Tiêu chí hoàn thành] Test pass, có ảnh chụp/hướng dẫn tự kiểm tra, đã commit,
  đánh dấu xong trong PLAN.md.
```

## Giai đoạn 8 – Kiểm thử và rà soát
**Loại prompt:** `KIEM_THU`, `REVIEW` · **Đầu ra:** báo cáo lỗi, các bản sửa

```
[Vai trò] Bạn là QA Engineer kiêm Security Reviewer.
[Nhiệm vụ] Rà soát toàn bộ app: happy path, edge cases (dữ liệu rỗng/quá dài/ký tự đặc biệt,
  mất mạng), responsive, accessibility cơ bản, bảo mật (lộ secret, XSS, dữ liệu người dùng).
[Định dạng đầu ra] Bảng: Mức độ (Nghiêm trọng/Cao/Trung bình/Thấp) | Vấn đề | Cách tái hiện | Đề xuất.
[Cách làm việc] Sửa ngay các lỗi Nghiêm trọng và Cao; các lỗi còn lại chờ tôi duyệt.
```

## Giai đoạn 9 – Triển khai (Deploy)
**Loại prompt:** `TRIEN_KHAI` · **Đầu ra:** link app chạy thật

```
[Nhiệm vụ] Triển khai app lên {{nen_tang|Vercel}}, thiết lập tự động deploy khi push lên nhánh chính.
[Cách làm việc] Phần nào bạn tự làm được thì làm luôn. Phần cần tôi thao tác thì
  liệt kê từng bước: vào trang nào, bấm nút gì.
[Tiêu chí hoàn thành] Mở được link; các chức năng chính chạy được trên môi trường thật.
```

## Giai đoạn 10 – Vận hành và cải tiến
**Loại prompt:** `CAI_TIEN` · **Đầu ra:** PLAN.md cho phiên bản tiếp theo, CHANGELOG

```
[Đầu vào] Phản hồi và lỗi ghi nhận được: {{phan_hoi}}
[Nhiệm vụ] Phân loại (lỗi / cải tiến / tính năng mới), ưu tiên theo tác động và công sức,
  cập nhật PLAN.md cho phiên bản {{phien_ban_moi}}, cập nhật AGENTS.md nếu có quy tắc mới rút ra.
```

---

## Prompt dùng trong mọi giai đoạn

| Tình huống | Prompt |
|---|---|
| Không hiểu kết quả | "Giải thích lại cho người không biết code, dùng ví dụ đời thường." |
| AI làm sai hướng | "Dừng lại. Mục tiêu đúng là {{…}}. Hoàn tác thay đổi vừa rồi rồi làm lại." |
| Gặp lỗi | "Khi tôi {{thao_tac}} thì thấy {{hien_tuong}}. Mong muốn là {{ket_qua_dung}}. Tìm nguyên nhân gốc, sửa, giải thích." |
| Rút kinh nghiệm | "Từ lỗi vừa rồi, đề xuất 1 quy tắc ngắn để thêm vào AGENTS.md, giúp không lặp lại lỗi này." |
| Kết thúc phiên làm việc | "Tóm tắt việc đã làm, việc còn dở, cập nhật PLAN.md và commit." |
