# Thiết kế: Trình tạo prompt

## 1. Luồng sử dụng

```
Chọn loại prompt → Điền bảng nhập (có lựa chọn gợi ý) → [✨ Trau chuốt bằng AI]
   → Xem trước prompt hoàn chỉnh → Copy (dán vào công cụ lập trình) / Lưu vào Thư viện
```

**Quyết định đã chốt (18/10/2026):**
- Ngôn ngữ prompt mặc định: **tiếng Việt, giữ thuật ngữ tiếng Anh**. Vẫn đổi được ở cuối bảng.
- AI **chỉ được gọi khi bấm ✨**. Không tự gợi ý trong lúc gõ.
- Danh sách gợi ý **cố định, có sẵn** (xem `04-THU-VIEN-GOI-Y.md`). Người dùng không cần chỉnh sửa, chỉ tích chọn hoặc dùng "Khác…".
- Không chạy prompt trong app. Đầu ra cuối cùng là **Copy** để dán sang công cụ lập trình.

1. **Chọn loại prompt.** Các thẻ được nhóm theo giai đoạn của quy trình chuẩn. Có ô tìm kiếm.
2. **Bảng nhập.** Mỗi dòng là một khối của khung 8 khối, cộng thêm các trường riêng của loại prompt đó.
   - Trường **lựa chọn**: chọn một hoặc nhiều mục từ danh sách gợi ý, hoặc chọn "Khác…" để tự nhập.
   - Trường **tự do**: ô văn bản. Bên cạnh có nút ✨ để AI trau chuốt riêng ô đó.
   - Trường **tự động**: lấy từ Hồ sơ dự án (công nghệ, lệnh, quy ước). Có thể sửa tay.
3. **Trau chuốt bằng AI.** Có 2 mức:
   - *Từng ô*: viết lại ý của bạn cho rõ ràng, dùng đúng thuật ngữ kỹ thuật
     (ví dụ: "trang bị lỗi khi bấm nút lưu" → "Lỗi runtime khi submit form Lưu: …").
   - *Toàn bộ prompt*: kiểm tra thiếu/thừa/mâu thuẫn, chuẩn hóa thuật ngữ, sắp xếp theo khung,
     sau đó hiện **so sánh trước/sau** để bạn chấp nhận từng thay đổi.
   - AI **không được tự thêm yêu cầu mới**. Thông tin còn thiếu thì AI đặt câu hỏi cho bạn trả lời.
4. **Thuật ngữ.** App có sẵn bảng thuật ngữ Việt ↔ Anh cố định (ví dụ: "kiểm thử" ↔ test, "đưa lên mạng" ↔ deploy)
   để AI dùng nhất quán.
5. **Ngôn ngữ đầu ra** (chọn ở cuối bảng): Tiếng Việt | Tiếng Anh | Việt + giữ thuật ngữ Anh (mặc định).

## 2. Các trường dùng chung (mọi loại prompt)

| Trường | Bắt buộc | Kiểu | Lựa chọn gợi ý |
|---|---|---|---|
| Vai trò AI | ✔ | Chọn 1 + Khác | Product Manager, UX/UI Designer, Software Architect, Tech Lead, Senior Frontend Dev, Senior Backend Dev, Full-stack Dev, QA Engineer, Security Reviewer, DevOps Engineer, Technical Writer, Data Engineer |
| Bối cảnh dự án | ✔ | Tự động + sửa | Lấy từ Hồ sơ dự án |
| Nhiệm vụ | ✔ | Tự do ✨ | — |
| Mục đích / Vì sao | | Tự do ✨ | Giúp AI hiểu ý đồ, ví dụ: "để người dùng không mất dữ liệu khi đổi máy" |
| Đầu vào đính kèm | | Chọn nhiều + Khác | @PRD.md, @PLAN.md, @AGENTS.md, @ARCHITECTURE.md, ảnh chụp màn hình, log lỗi, đoạn code (tự bọc trong thẻ `<log>`, `<code>`) |
| Ví dụ mẫu | | Tự do (0–5 ví dụ) | Dùng khi cần kết quả đúng một định dạng nhất định |
| Ràng buộc | | Chọn nhiều + Khác | Bộ gợi ý **RB-01…RB-12** |
| Định dạng đầu ra | | Chọn nhiều + Khác | Bộ gợi ý **DR-01…DR-07** |
| Tiêu chí hoàn thành | | Chọn nhiều + Khác | Bộ gợi ý **TC-01…TC-07** |
| Cách làm việc | | Chọn nhiều | Bộ gợi ý **CL-01…CL-07** (chọn 1 trong CL-01/02/03) |
| Độ dài trả lời | | Chọn 1 | Ngắn gọn · Vừa phải · Chi tiết |
| Ngôn ngữ trả lời | | Chọn 1 | Tiếng Việt · Tiếng Anh · Việt + thuật ngữ Anh |

## 3. Danh sách loại prompt và trường riêng

### Nhóm A – Sản phẩm và thiết kế

**A1. `Y_TUONG` – Khám phá ý tưởng**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Mô tả ý tưởng | Tự do ✨ | — |
| Người dùng mục tiêu | Tự do | — |
| Loại sản phẩm | Chọn 1 | Web app · Mobile app · Tiện ích trình duyệt · Công cụ dòng lệnh · API/dịch vụ · Tự động hóa |
| Số câu hỏi tối đa | Số | 5 · 10 · 15 |
| Phân tích thêm | Chọn nhiều | Đối thủ · Rủi ro · Mô hình kiếm tiền · Chỉ số thành công |

**A2. `PRD` – Tài liệu yêu cầu sản phẩm**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Phạm vi | Chọn 1 | Toàn bộ sản phẩm · Một tính năng · Một phiên bản |
| Phương pháp ưu tiên | Chọn 1 | MoSCoW · RICE · Kano |
| Số tính năng Must tối đa | Số | 3 · 5 · 7 |
| Mục cần có | Chọn nhiều | User stories · Acceptance criteria · Chỉ số thành công · Ngoài phạm vi · Rủi ro |

**A3. `THIET_KE_UI` – Thiết kế giao diện / trải nghiệm**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Đầu ra | Chọn nhiều | Danh sách màn hình · User flow (Mermaid) · Wireframe · Mockup HTML · Design tokens |
| Phong cách | Chọn 1 + Khác | Tối giản · Hiện đại/bo tròn · Doanh nghiệp · Material · Glassmorphism |
| Thiết bị | Chọn nhiều | Laptop · Máy tính bảng · Điện thoại |
| Thư viện UI | Chọn 1 + Khác | Tailwind CSS · shadcn/ui · MUI · Ant Design · Không dùng |
| Yêu cầu thêm | Chọn nhiều | Dark mode · Accessibility (WCAG AA) · Đa ngôn ngữ |

### Nhóm B – Kỹ thuật và kế hoạch

**B1. `KIEN_TRUC` – Kiến trúc và chọn công nghệ**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Loại ứng dụng | Chọn 1 | SPA chỉ frontend · Full-stack · Có backend API riêng · Serverless |
| Ngân sách | Chọn 1 | Miễn phí · Dưới 10$/tháng · Dưới 50$/tháng |
| Lưu dữ liệu | Chọn 1 + Khác | Trình duyệt (IndexedDB) · SQLite · PostgreSQL · Supabase · Firebase |
| Hosting | Chọn 1 + Khác | Vercel · Netlify · Cloudflare Pages · GitHub Pages · VPS |
| Ưu tiên | Chọn nhiều | Dễ bảo trì · Hiệu năng · Chi phí thấp · Bảo mật · Mở rộng |

**B2. `THIET_KE_DU_LIEU` – Database / API**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Đối tượng dữ liệu | Tự do ✨ | Ví dụ: Dự án, Prompt, Thẻ… |
| Kiểu API | Chọn 1 | REST · GraphQL · tRPC · Không có API |
| Đầu ra | Chọn nhiều | Sơ đồ ERD · Schema/kiểu TypeScript · Danh sách endpoint · Migration · Dữ liệu mẫu |

**B3. `KE_HOACH` – Chia task / lập kế hoạch**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Cách chia | Chọn 1 | Vertical slice (khuyến nghị) · Theo tầng (UI/logic/data) · Theo màn hình |
| Cỡ task | Chọn 1 | Rất nhỏ (<1 giờ AI) · Nhỏ · Vừa |
| Cột trong bảng | Chọn nhiều | Phụ thuộc · Cách kiểm tra · Ước lượng · Rủi ro |

**B4. `KHOI_TAO` – Dựng khung dự án**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Framework | Chọn 1 + Khác | React + Vite · Next.js · Vue + Vite · SvelteKit · Python FastAPI |
| Ngôn ngữ | Chọn 1 | TypeScript · JavaScript · Python |
| Công cụ đi kèm | Chọn nhiều | ESLint · Prettier · Vitest · Playwright · Husky (pre-commit) · CI GitHub Actions |
| Trình quản lý gói | Chọn 1 | npm · pnpm · bun |

### Nhóm C – Viết code

**C1. `TINH_NANG` – Xây tính năng mới**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Tên tính năng / task | Tự do | Có thể chọn từ PLAN.md |
| Mô tả hành vi mong muốn | Tự do ✨ | — |
| Acceptance criteria | Danh sách ✨ | — |
| Phần bị ảnh hưởng | Chọn nhiều | Giao diện · Logic xử lý · Dữ liệu/lưu trữ · Gọi API ngoài |
| Trường hợp đặc biệt | Chọn nhiều | Dữ liệu rỗng · Lỗi mạng · Dữ liệu quá lớn · Người dùng thao tác nhanh/lặp lại |
| Loại test | Chọn nhiều | Unit test · Integration test · E2E test · Không cần |

**C2. `SUA_LOI` – Sửa lỗi (bug fix)**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Thao tác gây lỗi | Tự do ✨ | — |
| Hiện tượng thực tế | Tự do ✨ | — |
| Kết quả mong muốn | Tự do | — |
| Bằng chứng | Chọn nhiều | Ảnh chụp · Log console · Thông báo lỗi · Link |
| Tần suất | Chọn 1 | Luôn luôn · Thỉnh thoảng · Chỉ một lần |
| Môi trường | Chọn nhiều | Máy tính · Điện thoại · Chrome · Safari · Bản deploy · Bản chạy trên máy |
| Yêu cầu | Chọn nhiều | Tìm nguyên nhân gốc (root cause) · Viết test tái hiện lỗi trước khi sửa · Giải thích nguyên nhân |

**C3. `REFACTOR` – Cải tổ / tối ưu code**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Phạm vi | Tự do | File hoặc thư mục |
| Mục tiêu | Chọn nhiều | Dễ đọc hơn · Bỏ trùng lặp · Hiệu năng · Giảm kích thước bundle · Tách component |
| Giới hạn | Chọn nhiều | Không đổi hành vi · Giữ nguyên API · Test cũ phải pass |

**C4. `VIET_TEST` – Viết test**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Đối tượng test | Tự do | — |
| Loại | Chọn nhiều | Unit · Integration · E2E · Snapshot |
| Công cụ | Chọn 1 | Vitest · Jest · Playwright · Pytest |
| Mức bao phủ | Chọn 1 | Happy path · Happy path + edge cases · Toàn diện |

### Nhóm D – Chất lượng và vận hành

**D1. `REVIEW` – Review code / bảo mật**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Phạm vi | Chọn 1 | Thay đổi chưa commit · Một PR · Toàn bộ dự án |
| Tiêu chí | Chọn nhiều | Đúng logic · Bảo mật · Hiệu năng · Dễ đọc · Accessibility · Tuân thủ AGENTS.md |
| Hành động | Chọn 1 | Chỉ báo cáo · Báo cáo rồi sửa lỗi nghiêm trọng · Sửa tất cả |

**D2. `KIEM_THU` – Kiểm thử toàn app (QA)**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Kịch bản | Chọn nhiều | Happy path · Edge cases · Responsive · Mất mạng · Dữ liệu lớn |
| Đầu ra | Chọn 1 | Bảng lỗi theo mức độ · Checklist kiểm thử |

**D3. `TRIEN_KHAI` – Deploy / DevOps**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Nền tảng | Chọn 1 + Khác | Vercel · Netlify · Cloudflare Pages · GitHub Pages |
| Thiết lập | Chọn nhiều | Tự động deploy khi push · Preview cho mỗi PR · Tên miền riêng · Biến môi trường |

**D4. `TAI_LIEU` – Viết tài liệu**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Loại tài liệu | Chọn 1 | README · Hướng dẫn sử dụng · CHANGELOG · Tài liệu API · Comment trong code |
| Người đọc | Chọn 1 | Bản thân · Người dùng cuối · Lập trình viên khác · AI agent |

**D5. `GIAI_THICH` – Giải thích code / khái niệm**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Nội dung cần giải thích | Tự do | File, đoạn code, thông báo lỗi, khái niệm |
| Trình độ | Chọn 1 | Không biết code · Mới học · Đã biết cơ bản |
| Hình thức | Chọn nhiều | Ví dụ đời thường · Sơ đồ · Từng bước |

**D6. `CAI_TIEN` – Phân tích phản hồi, lên phiên bản mới**
| Trường | Kiểu | Lựa chọn gợi ý |
|---|---|---|
| Phản hồi / lỗi ghi nhận | Tự do | — |
| Cách ưu tiên | Chọn 1 | Tác động/Công sức · RICE · MoSCoW |

### Nhóm E – Tùy chỉnh
**E1. `TU_DO` – Prompt tự do theo khung 8 khối:** chỉ có các trường dùng chung.

## 4. Cách hiển thị prompt hoàn chỉnh

Prompt ghép từ bảng nhập được hiển thị theo thứ tự khung 8 khối, chỉ gồm các ô đã điền:

```markdown
# Vai trò
Bạn là Senior Frontend Developer.

# Bối cảnh
- Dự án: Prompt Studio – web app quản lý prompt cá nhân
- Công nghệ: React + Vite + TypeScript, Tailwind, IndexedDB (Dexie)
- Quy tắc dự án: tuân thủ @AGENTS.md

# Nhiệm vụ
Sửa lỗi: …

# Ràng buộc
- Không thêm thư viện mới
…

# Tiêu chí hoàn thành
- [ ] Có test tái hiện lỗi, test pass
…

# Cách làm việc
Tìm nguyên nhân gốc, nêu kế hoạch sửa và chờ tôi duyệt trước khi sửa.
```

## 5. Gợi ý chi tiết
Câu chuẩn của từng gợi ý, các gợi ý được tích sẵn theo loại prompt, mẹo riêng theo loại và bảng thuật ngữ:
xem `04-THU-VIEN-GOI-Y.md`.
