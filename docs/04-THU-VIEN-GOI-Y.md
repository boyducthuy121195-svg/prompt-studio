# Thiết kế: Thư viện gợi ý cho Trình tạo prompt

> Bộ gợi ý **cố định, có sẵn trong app**. Người dùng không cần chỉnh sửa, chỉ tích chọn.
> Mỗi gợi ý có **nhãn ngắn** (hiện trên nút chọn) và **câu chuẩn** (được chèn vào prompt).
> Câu chuẩn viết bằng tiếng Việt và giữ thuật ngữ tiếng Anh, đúng ngôn ngữ mặc định của prompt.
> Ô nào không có gợi ý phù hợp thì dùng mục "Khác…" để tự gõ.

## Nguồn tham khảo và nguyên tắc rút ra

| Nguồn | Nguyên tắc | Áp dụng trong app |
|---|---|---|
| [Anthropic – Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) | Viết rõ ràng, trực tiếp; coi AI như "nhân viên mới giỏi nhưng chưa biết bối cảnh" | Khung 8 khối, bối cảnh tự lấy từ Hồ sơ dự án |
| (như trên) | **Giải thích lý do** giúp AI làm đúng hơn một mệnh lệnh trống | Thêm ô **"Mục đích / Vì sao"** trong khối Nhiệm vụ |
| (như trên) | Dùng **thẻ** để tách chỉ dẫn khỏi dữ liệu | Log, code, tài liệu dán vào được bọc trong `<log>`, `<code>`, `<tai_lieu>` |
| (như trên) | Dùng **ví dụ** (3–5 cái) để điều khiển định dạng | Ô tùy chọn **"Ví dụ mẫu"** cho các loại cần đúng định dạng |
| (như trên) | Chống "làm quá tay": AI hay thêm file, abstraction, tính năng không ai yêu cầu | Nhóm gợi ý **RB-01, RB-02** |
| (như trên) | Không hardcode, không lách test | **RB-06** |
| (như trên) | Đọc code trước khi kết luận, không đoán | **CL-04** |
| (như trên) | Hỏi trước các thao tác khó hoàn tác (xóa, force push…) | **RB-09** |
| [OpenAI – GPT-5 prompting guide](https://github.com/openai/openai-cookbook/blob/main/examples/gpt-5/gpt-5_prompting_guide.ipynb) | Điều chỉnh **mức tự chủ**: "tự làm đến cùng" hay "dừng lại hỏi" | Nhóm **Cách làm việc CL-01 → CL-03** |
| (như trên) | Yêu cầu AI **nhắc lại mục tiêu, nêu kế hoạch, báo tiến độ, tóm tắt cuối** | **CL-05** |
| (như trên) | Nêu rõ **điều kiện dừng** (khi nào là xong) | Khối Tiêu chí hoàn thành |
| GitHub Blog (2.500 agents.md) | Lệnh cụ thể, ranh giới rõ, ví dụ thật | Gợi ý **TC-01**, liên kết @AGENTS.md |

---

## 1. Gợi ý theo từng khối

### Khối Ràng buộc (RB)
| Mã | Nhãn | Câu chuẩn chèn vào prompt |
|---|---|---|
| RB-01 | Chỉ làm đúng yêu cầu | Chỉ thay đổi những gì được yêu cầu hoặc thực sự cần thiết. Không thêm feature, không refactor, không "cải thiện" ngoài phạm vi. |
| RB-02 | Giữ giải pháp đơn giản | Giữ giải pháp ở mức đơn giản nhất. Không tạo abstraction/helper cho thao tác chỉ dùng một lần, không thiết kế cho yêu cầu giả định trong tương lai. |
| RB-03 | Không thêm thư viện | Không thêm dependency mới. Nếu thật sự cần, dừng lại và hỏi tôi, kèm lý do và phương án thay thế. |
| RB-04 | Không đổi hành vi | Không thay đổi hành vi hiện có của app. Toàn bộ test cũ phải tiếp tục pass. |
| RB-05 | Giữ dữ liệu cũ | Không làm mất dữ liệu đã lưu. Mọi thay đổi data schema phải kèm migration. |
| RB-06 | Không hardcode, không lách test | Viết giải pháp tổng quát, đúng với mọi input hợp lệ. Không hardcode giá trị và không viết code chỉ để test pass. Nếu test sai thì báo tôi, không tự lách. |
| RB-07 | Tuân thủ AGENTS.md | Tuân thủ toàn bộ quy tắc trong @AGENTS.md. Nếu yêu cầu này mâu thuẫn với AGENTS.md thì hỏi tôi. |
| RB-08 | Hỏi trước thao tác khó hoàn tác | Được tự làm các thao tác cục bộ, hoàn tác được (sửa file, chạy test). Phải hỏi trước khi xóa file/branch, `git push --force`, `git reset --hard`, đổi cấu hình dùng chung. |
| RB-09 | Không lộ bí mật | Không in ra, không commit API key, file `.env` hay bất kỳ secret nào. |
| RB-10 | Dọn file tạm | Nếu tạo file/script tạm để thử nghiệm thì xóa chúng khi xong việc. |
| RB-11 | Giao diện tiếng Việt, responsive | Mọi chữ hiển thị cho người dùng bằng tiếng Việt. Giao diện dùng được từ chiều rộng 360px (điện thoại). |
| RB-12 | Bảo mật đầu vào | Kiểm tra (validate) mọi dữ liệu từ bên ngoài: input người dùng, file nhập vào, response của API. |

### Khối Cách làm việc (CL) – chọn một trong CL-01 đến CL-03, các mục còn lại chọn tùy ý
| Mã | Nhãn | Câu chuẩn |
|---|---|---|
| CL-01 | Hỏi trước khi làm | Nếu yêu cầu chưa rõ, hỏi tôi tối đa 3 câu trước khi bắt đầu. Không tự đoán ý tôi. |
| CL-02 | Lên kế hoạch → chờ duyệt | Trước tiên đọc code liên quan và trình bày kế hoạch ngắn (các bước, file sẽ sửa, rủi ro). Dừng lại chờ tôi trả lời "Đồng ý" rồi mới sửa code, tạo/xóa file hay cài thư viện. Nếu tôi yêu cầu chỉnh thì sửa kế hoạch và chờ duyệt lại. Sau khi được duyệt, chỉ làm đúng phạm vi đó; phát sinh thay đổi lớn thì hỏi lại. |
| CL-03 | Tự làm đến cùng | Làm liên tục cho đến khi hoàn thành. Gặp điểm chưa chắc chắn thì chọn phương án hợp lý nhất, ghi lại giả định và báo cáo ở cuối. Riêng các mục trong RB-08 vẫn phải hỏi. |
| CL-04 | Tìm hiểu trước khi kết luận | Không suy đoán về code chưa mở. Đọc các file liên quan trước khi trả lời hoặc sửa. |
| CL-05 | Báo tiến độ | Mở đầu bằng việc nhắc lại mục tiêu trong 1 câu và nêu kế hoạch. Trong lúc làm, báo ngắn từng bước. Kết thúc bằng tóm tắt. |
| CL-06 | Tự rà soát trước khi nộp | Trước khi báo xong, tự rà lại kết quả theo từng tiêu chí hoàn thành và sửa chỗ chưa đạt. |
| CL-07 | Giải thích cho người không biết code | Tôi không biết lập trình. Giải thích bằng ngôn ngữ đời thường. Nếu phải dùng thuật ngữ thì giải thích ngắn kèm theo. |
| CL-08 | Báo cáo trung thực | Nếu không đọc được @AGENTS.md hoặc file được nhắc tới thì báo ngay, không giả vờ đã đọc. Khi báo cáo, tách rõ việc đã kiểm tra thật với điều mới suy luận, và nêu phần chưa kiểm tra được. |

> CL-02 (bản chặt) và CL-08 thêm ở task 16, học từ dự án "Trợ lý tạo prompt" (`docs/07`).

### Khối Định dạng đầu ra (DR)
| Mã | Nhãn | Câu chuẩn |
|---|---|---|
| DR-01 | Báo cáo 3 phần | Kết thúc bằng báo cáo 3 phần: (1) Đã làm gì, (2) Cách tôi tự kiểm tra, (3) Việc tiếp theo đề xuất. |
| DR-02 | Bảng Markdown | Trình bày kết quả chính dưới dạng bảng Markdown. |
| DR-03 | Sơ đồ Mermaid | Vẽ sơ đồ bằng Mermaid. |
| DR-04 | Lưu thành file | Lưu kết quả vào file `{{ten_file}}`. |
| DR-05 | Code + giải thích ngắn | Đưa ra code hoàn chỉnh, kèm giải thích ngắn (dưới 5 dòng) cho từng thay đổi chính. |
| DR-06 | Danh sách vấn đề theo mức độ | Liệt kê vấn đề theo mức độ (Nghiêm trọng / Cao / Trung bình / Thấp), mỗi vấn đề có: mô tả, vị trí, cách tái hiện, đề xuất sửa. |
| DR-07 | Có phương án khuyến nghị | Đưa ra tối đa 3 phương án, so sánh ưu và nhược, và **chỉ rõ 1 phương án khuyến nghị** kèm lý do. |

### Khối Tiêu chí hoàn thành (TC)
| Mã | Nhãn | Câu chuẩn |
|---|---|---|
| TC-01 | Lint / typecheck / test pass | Các lệnh kiểm tra trong @AGENTS.md (lint, typecheck, test) đều pass. |
| TC-02 | Có test cho thay đổi | Code mới hoặc sửa đổi có test đi kèm. |
| TC-03 | Có bằng chứng chạy được | Có ảnh chụp màn hình hoặc các bước để tôi tự kiểm tra trên trình duyệt. |
| TC-04 | Đạt từng acceptance criteria | Liệt kê từng acceptance criteria và xác nhận đạt hay chưa đạt. |
| TC-05 | Không lỗi console | Không còn error/warning mới trong console trình duyệt. |
| TC-06 | Đã commit | Đã commit với message dạng Conventional Commits. |
| TC-07 | Cập nhật PLAN.md | Đã đánh dấu task hoàn thành trong @PLAN.md. |

### Khối Đầu vào (DV) – cách bọc dữ liệu
Dữ liệu người dùng dán vào được app tự bọc trong thẻ, để AI không nhầm dữ liệu với chỉ dẫn:
`<log>…</log>` · `<code file="…">…</code>` · `<tai_lieu ten="…">…</tai_lieu>` · `<vi_du>…</vi_du>` · Tham chiếu file: `@PRD.md`.

---

## 2. Gợi ý mặc định theo từng loại prompt

Khi chọn loại prompt, app **tích sẵn** các gợi ý dưới đây. Người dùng có thể bỏ tích hoặc tích thêm.

| Loại | Vai trò mặc định | Ràng buộc | Cách làm việc | Đầu ra | Tiêu chí |
|---|---|---|---|---|---|
| Y_TUONG | Product Manager | — | CL-01, CL-07 | DR-02 | — |
| PRD | Product Manager | — | CL-01, CL-07 | DR-04 (PRD.md) | TC-04* |
| THIET_KE_UI | UX/UI Designer | RB-11 | CL-02 | DR-03, DR-04 | TC-03 |
| KIEN_TRUC | Software Architect | — | CL-02, CL-07 | DR-07, DR-03, DR-04 | — |
| THIET_KE_DU_LIEU | Software Architect | RB-05 | CL-02 | DR-03, DR-02 | — |
| KE_HOACH | Tech Lead | RB-07 | CL-02 | DR-02, DR-04 (PLAN.md) | — |
| KHOI_TAO | Senior Full-stack Dev | RB-09, RB-10 | CL-03, CL-05 | DR-01 | TC-01, TC-03, TC-06 |
| TINH_NANG | Senior Full-stack Dev | RB-01, RB-02, RB-07, RB-08, RB-12 | CL-02, CL-04, CL-06, CL-08 | DR-01 | TC-01, TC-02, TC-03, TC-04, TC-06, TC-07 |
| SUA_LOI | Senior Full-stack Dev | RB-01, RB-06, RB-07 | CL-04, CL-06, CL-08 | DR-01 | TC-01, TC-02, TC-03, TC-06 |
| REFACTOR | Senior Full-stack Dev | RB-02, RB-04, RB-07 | CL-02, CL-04, CL-08 | DR-01 | TC-01, TC-06 |
| VIET_TEST | QA Engineer | RB-06 | CL-04, CL-08 | DR-01 | TC-01 |
| REVIEW | Security Reviewer | — | CL-04, CL-07 | DR-06 | — |
| KIEM_THU | QA Engineer | — | CL-04, CL-08 | DR-06 | — |
| TRIEN_KHAI | DevOps Engineer | RB-08, RB-09 | CL-02, CL-05, CL-07 | DR-01 | TC-03 |
| TAI_LIEU | Technical Writer | — | CL-04 | DR-04 | — |
| GIAI_THICH | Senior Full-stack Dev | — | CL-04, CL-07 | — | — |
| CAI_TIEN | Product Manager | — | CL-07 | DR-02, DR-04 (PLAN.md) | — |
| TU_DO | (chọn) | RB-07 | CL-01 | DR-01 | — |

\* Với PRD, TC-04 nghĩa là "mỗi tính năng Must đều có acceptance criteria kiểm tra được".

## 3. Mẹo riêng theo loại (tự chèn thêm vào khối Cách làm việc)

| Loại | Câu được chèn thêm |
|---|---|
| SUA_LOI | Làm theo thứ tự: (1) tái hiện lỗi, (2) tìm root cause và giải thích, (3) viết test thất bại tái hiện lỗi, (4) sửa, (5) chạy lại test. Không chỉ sửa triệu chứng. |
| TINH_NANG | Làm theo vertical slice: giao diện, logic và lưu trữ của tính năng phải chạy được end-to-end trước khi trau chuốt. |
| REFACTOR | Chia thành các bước nhỏ, chạy test sau mỗi bước. |
| REVIEW | Chỉ báo các vấn đề có bằng chứng cụ thể trong code (file:dòng). Không báo vấn đề suy đoán. |
| KIEN_TRUC | Ưu tiên công nghệ phổ biến, tài liệu tốt, dễ bảo trì bởi AI. Nêu chi phí hằng tháng ước tính. |
| THIET_KE_UI | Tạo bố cục có chủ đích, tránh giao diện mặc định nhàm chán. Chú ý khoảng cách, phân cấp chữ và trạng thái rỗng/lỗi/đang tải. |
| Y_TUONG | Hỏi từng câu một và chờ tôi trả lời rồi mới hỏi câu tiếp theo. |

## 4. Bảng thuật ngữ Việt ↔ Anh (cố định, AI dùng khi bấm ✨)

| Tiếng Việt người dùng hay gõ | Thuật ngữ chuẩn được giữ |
|---|---|
| kiểm thử, chạy thử | test, unit test, e2e test |
| đưa lên mạng | deploy |
| sửa lỗi | bug fix |
| sắp xếp lại code | refactor |
| thư viện | library / dependency |
| giao diện | UI, component |
| luồng người dùng | user flow |
| tiêu chí chấp nhận | acceptance criteria |
| cơ sở dữ liệu | database, schema |
| lưu tạm trên trình duyệt | localStorage / IndexedDB |
| biến môi trường | environment variable (.env) |
| nhánh, lưu phiên bản | branch, commit |
| yêu cầu gộp code | pull request (PR) |
| bị treo, quay mãi | loading state không kết thúc / request timeout |
| màn hình trắng | blank screen / runtime error |

*(Danh sách đầy đủ khoảng 80 thuật ngữ sẽ được soạn khi code tính năng.)*
