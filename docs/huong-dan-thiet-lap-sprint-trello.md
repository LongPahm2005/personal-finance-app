# HƯỚNG DẪN THIẾT LẬP & VẬN HÀNH SPRINT TRÊN TRELLO
## DỰ ÁN: HỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH TÀI CHÍNH CÁ NHÂN BẰNG AI (AI-FDSS)
### MÔN HỌC: IS402 – HỆ HỖ TRỢ RA QUYẾT ĐỊNH (DSS) | LỚP: IS 402 A | NHÓM: 17 – ĐẠI HỌC DUY TÂN

---

> **MỤC ĐÍCH TÀI LIỆU:**  
> Tài liệu này được biên soạn như một cuốn **"Cẩm nang vận hành Scrum" (Scrum Playbook)** từ ngày đầu tiên bắt đầu dự án. Giúp Trưởng nhóm và các thành viên dễ dàng sao chép (copy-paste) toàn bộ danh sách công việc lên Trello, quản lý tiến độ chuẩn mực, tự tin trả lời vấn đáp trước Giảng viên hướng dẫn (*Thầy Nguyễn Quang Ánh*).

---

## PHẦN 1: CẤU TRÚC BẢNG TRELLO CHUẨN AGILE/SCRUM

### 1.1 Khởi tạo 5 Cột (Lists) trên Trello
Tạo một bảng mới trên Trello đặt tên: `IS402_Nhom17_AI_FDSS_Scrum` với 5 cột theo thứ tự từ trái sang phải:

```
[📋 1. Product Backlog] ──> [📌 2. Sprint Backlog (To Do)] ──> [⏳ 3. In Progress] ──> [🔍 4. Review / QA] ──> [✅ 5. Done]
```

* **1. Product Backlog:** Nơi lưu trữ toàn bộ các tính năng, ý tưởng của toàn bộ đồ án (chưa làm ngay).
* **2. Sprint Backlog (To Do):** Các đầu việc được nhóm cam kết hoàn thành trong Sprint hiện tại (2 tuần).
* **3. In Progress (Đang làm):** Công việc đang được một thành viên thực hiện *(Mỗi người chỉ nên nhận 1 task tại một thời điểm để đảm bảo tập trung)*.
* **4. Review / QA (Kiểm thử):** Task đã viết mã nguồn/vẽ xong, chờ Trưởng nhóm (Long) review code hoặc bạn QA (Phú) chạy thử nghiệm.
* **5. Done (Hoàn thành):** Task đã được kiểm tra, không còn lỗi, code đã merge vào Git và tài liệu đã cập nhật.

---

### 1.2 Thiết lập Hệ thống Nhãn màu (Labels)

| Tên Nhãn | Mã màu Trello | Ý nghĩa phân loại |
| :--- | :---: | :--- |
| `Sprint 1` | Xanh dương | Giai đoạn 1: Khảo sát, BFD, UCD, Thiết kế CSDL |
| `Sprint 2` | Xanh lá | Giai đoạn 2: Khung Electron, CSDL MySQL & Core TPS |
| `Sprint 3` | Vàng | Giai đoạn 3: Ngân sách, Sổ nợ & Thuật toán DSS |
| `Sprint 4` | Tím | Giai đoạn 4: AI Gemini, RAG Finance, What-If |
| `Sprint 5` | Đỏ | Giai đoạn 5: Kiểm thử, Đóng gói .exe & Báo cáo |
| `Backend/DB` | Cam | Liên quan đến MySQL, SQL queries, DDL |
| `Frontend` | Xanh lơ | Liên quan đến UI React, biểu đồ Recharts |
| `AI/DSS` | Hồng | Liên quan đến Gemini API, mô hình phạt lỗi |
| `Docs/QA` | Xám | Báo cáo Word, Slide, Test cases |

---

### 1.3 Quy ước Ước lượng Điểm độ khó (Story Points)
Áp dụng dãy số Fibonacci rút gọn để ước lượng độ phức tạp của mỗi thẻ:
* **1 Point:** Task rất nhỏ (viết 1 hàm đơn giản, sửa lỗi chính tả, đổi màu UI) ~ Nửa ngày.
* **2 Points:** Task nhỏ (tạo 1 form nhập liệu, viết script migration đơn giản) ~ 1 ngày.
* **3 Points:** Task trung bình (xây dựng 1 trang quản lý, viết 1 câu SQL phức tạp) ~ 2-3 ngày.
* **5 Points:** Task lớn (kết nối Electron IPC, thuật toán Time-Series, tích hợp Gemini API) ~ 4-5 ngày.
* **8 Points:** Task rất lớn / phức tạp (thiết kế toàn bộ CSDL 17 bảng, đóng gói installer .exe) ~ Cần chia nhỏ hoặc làm theo cặp.

---

## PHẦN 2: CHI TIẾT CÁC THẺ (CARDS) THEO 5 SPRINT ĐỂ COPY LÊN TRELLO

---

### 🚀 SPRINT 1: KHỞI TẠO DỰ ÁN, ĐẶC TẢ NGHIỆP VỤ & THIẾT KẾ CSDL (17 BẢNG)
* **Thời gian thực hiện:** 03/10/2026 – 16/10/2026 (2 tuần)
* **Sprint Goal (Mục tiêu Sprint):** *Hoàn thiện khung tài liệu phân tích, chốt cấu trúc ERD 17 bảng MySQL và thiết lập môi trường Git CI/CD.*

#### Danh sách Thẻ (Cards) Sprint 1:

##### Card 1.1: [SP1-01] Khởi tạo Repository Git & Cấu hình GitHub Actions CI/CD
* **Nhãn:** `Sprint 1`, `Backend/DB` | **Story Points:** 3 | **Người nhận việc (Pull):** Phạm Văn Long
* **Mô tả:**
  ```text
  Là một Trưởng nhóm, tôi muốn thiết lập hệ thống kiểm soát phiên bản Git và pipeline CI/CD để toàn đội cộng tác an toàn, không bị xung đột code.
  ```
* **Checklist tiêu chí hoàn thành (Acceptance Criteria):**
  - [ ] Khởi tạo repo GitHub `personal-finance-app`.
  - [ ] Tạo 2 nhánh chính: `master` (ổn định) và `Long` (phát triển).
  - [ ] Tạo file `.gitignore` chặn thư mục node_modules, .env, *.sqlite, ~$*.
  - [ ] Cấu hình `.github/workflows/ci.yml` tự động kiểm tra cú pháp khi Push/PR.

##### Card 1.2: [SP1-02] Khảo sát hiện trạng & Vẽ Sơ đồ Phân rã Chức năng Nghiệp vụ (BFD)
* **Nhãn:** `Sprint 1`, `Docs/QA` | **Story Points:** 3 | **Người nhận việc (Pull):** Phạm Văn Long
* **Mô tả:**
  ```text
  Là một Nhà phân tích hệ thống, tôi muốn phân rã cấu trúc ứng dụng thành 6 module nghiệp vụ để định hình phạm vi phát triển đồ án.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Xác định 6 module: Thu chi, Ngân sách, Sổ nợ, Báo cáo, AI DSS, Cài đặt.
  - [ ] Vẽ sơ đồ dạng cây chuẩn BFD.
  - [ ] Xuất ảnh `2_bfd_diagram.png` chèn vào báo cáo.

##### Card 1.3: [SP1-03] Thiết kế Mô hình Quan hệ Thực thể (ERD 17 bảng chuẩn 3NF)
* **Nhãn:** `Sprint 1`, `Backend/DB` | **Story Points:** 5 | **Người nhận việc (Pull):** Trần Văn Tuấn
* **Mô tả:**
  ```text
  Là một Kỹ sư CSDL, tôi muốn thiết kế lược đồ ERD đáp ứng đầy đủ cả phần nghiệp vụ giao dịch thường nhật (9 bảng) lẫn phần lưu trữ suy luận AI DSS (8 bảng).
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Thiết kế 9 bảng Core: `wallets`, `categories`, `transactions`, `budgets`, `budget_categories`, `debts`, `debt_payments`, `recurring_transactions`, `saving_goals`.
  - [ ] Thiết kế 8 bảng AI DSS: `ai_user_profiles`, `ai_recommendations`, `ai_cashflow_forecasts`, `ai_scenarios`, `ai_anomalies`, `ai_chat_sessions`, `ai_chat_messages`, `ai_configs`.
  - [ ] Ràng buộc khóa ngoại Foreign Keys và kiểu dữ liệu chuẩn UUID.
  - [ ] Xuất sơ đồ `4_erd_diagram.png`.

##### Card 1.4: [SP1-04] Soạn thảo Bảng Từ điển Dữ liệu chi tiết (Data Dictionary)
* **Nhãn:** `Sprint 1`, `Backend/DB` | **Story Points:** 3 | **Người nhận việc (Pull):** Trần Văn Tuấn
* **Mô tả:**
  ```text
  Là một Kỹ sư CSDL, tôi muốn lập từ điển dữ liệu cho 17 bảng để lập trình viên Frontend và Backend hiểu rõ từng trường dữ liệu.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Bảng đặc tả Field Name, Data Type, Nullable, Default, Key, Description cho 17 bảng.
  - [ ] Chèn nội dung vào Chương 3 của báo cáo.

##### Card 1.5: [SP1-05] Nghiên cứu Google Gemini API & Thiết kế Mô hình Phạt lỗi (Penalty Model)
* **Nhãn:** `Sprint 1`, `AI/DSS` | **Story Points:** 5 | **Người nhận việc (Pull):** Tạ Đức Ngọc
* **Mô tả:**
  ```text
  Là một Kỹ sư AI/DSS, tôi muốn thiết lập thuật toán chấm điểm sức khỏe tài chính khách quan dựa trên dữ liệu giao dịch thực tế.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Đăng ký Google AI Studio API Key.
  - [ ] Thiết lập thang điểm 10 - 100 với điểm khởi đầu 100/100 (Sạch nợ).
  - [ ] Xác định 4 quy tắc trừ điểm: Thâm hụt thu chi (-20đ), Dự phòng mỏng (-15đ), Tỷ lệ nợ cao (-25đ), Nợ quá hạn (-20đ).

##### Card 1.6: [SP1-06] Vẽ Sơ đồ Use Case tổng thể (UCD) & Phác thảo Wireframe giao diện
* **Nhãn:** `Sprint 1`, `Frontend` | **Story Points:** 3 | **Người nhận việc (Pull):** Hà Văn Hoàng Tú & Nguyễn Hữu Phú
* **Mô tả:**
  ```text
  Là một Kỹ sư UI/UX, tôi muốn xác định các trường hợp sử dụng (Use Cases) của người dùng và hệ thống AI để thiết kế bố cục màn hình trực quan.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Vẽ sơ đồ `3_ucd_diagram.png` (Actor Người dùng & Google Gemini AI).
  - [ ] Phác thảo Wireframe các màn hình chính: Dashboard, Ví, Sổ nợ, Dự báo.

---

### 🚀 SPRINT 2: DỰNG KHUNG ELECTRON, CƠ CHẾ AUTO-INIT DB & NGHIỆP VỤ CORE (TPS)
* **Thời gian thực hiện:** 17/10/2026 – 30/10/2026 (2 tuần)
* **Sprint Goal (Mục tiêu Sprint):** *Ứng dụng desktop khởi động mượt mà, tự động tạo CSDL trên máy mới và thực hiện trơn tru các nghiệp vụ ghi chép ví/dòng tiền.*

#### Danh sách Thẻ (Cards) Sprint 2:

##### Card 2.1: [SP2-01] Khởi tạo dự án Electron 34 + React 19 + TypeScript + Vite + Tailwind
* **Nhãn:** `Sprint 2`, `Frontend` | **Story Points:** 5 | **Người nhận việc (Pull):** Phạm Văn Long
* **Mô tả:**
  ```text
  Là một Kiến trúc sư hệ thống, tôi muốn tích hợp Electron và React 19 với cấu hình IPC an toàn để xây dựng ứng dụng máy tính đa nền tảng tốc độ cao.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Tạo template Vite React TypeScript.
  - [ ] Cấu hình Electron Main process và `preload/contextBridge`.
  - [ ] Cài đặt Tailwind CSS và thư viện icon `lucide-react`.

##### Card 2.2: [SP2-02] Xây dựng Cơ chế Tự động Khởi tạo CSDL MySQL (Zero-Config DB)
* **Nhãn:** `Sprint 2`, `Backend/DB` | **Story Points:** 5 | **Người nhận việc (Pull):** Trần Văn Tuấn
* **Mô tả:**
  ```text
  Là một Kỹ sư Backend, tôi muốn ứng dụng tự tạo cơ sở dữ liệu `personal_finance` và 17 bảng khi chạy ở máy mới mà không cần người dùng import SQL thủ công qua Navicat.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Viết script `init_schema.ts` chứa toàn bộ câu lệnh DDL `CREATE TABLE IF NOT EXISTS`.
  - [ ] Viết hàm `ensureDatabaseInitialized()` trong `connection.ts`.
  - [ ] Gọi hàm tự động khi ứng dụng khởi động (`app.whenReady()`).

##### Card 2.3: [SP2-03] Xây dựng Module Quản lý Danh sách Ví & Danh mục thu chi đa cấp
* **Nhãn:** `Sprint 2`, `Frontend` | **Story Points:** 3 | **Người nhận việc (Pull):** Hà Văn Hoàng Tú
* **Mô tả:**
  ```text
  Là một Người dùng, tôi muốn quản lý các tài khoản tiền mặt/ngân hàng và danh mục thu/chi để phân loại nguồn tiền rõ ràng.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Màn hình thêm/sửa/xóa Ví tiền (Số dư ban đầu, loại ví, màu sắc).
  - [ ] Màn hình danh mục thu/chi đa cấp (Cha - Con) kèm Icon.
  - [ ] IPC kết nối MySQL lưu trữ dữ liệu an toàn.

##### Card 2.4: [SP2-04] Xây dựng Module Ghi chép Giao dịch Thu/Chi & Lọc lịch sử
* **Nhãn:** `Sprint 2`, `Frontend` | **Story Points:** 5 | **Người nhận việc (Pull):** Hà Văn Hoàng Tú
* **Mô tả:**
  ```text
  Là một Người dùng, tôi muốn ghi nhận nhanh chóng các khoản thu nhập và chi tiêu phát sinh để cập nhật số dư ví chính xác.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Modal nhập giao dịch: Số tiền, Ngày giờ, Danh mục, Ví chi trả, Ghi chú.
  - [ ] Tự động cộng/trừ số dư của ví tương ứng trong transaction MySQL.
  - [ ] Bảng lịch sử giao dịch có phân trang, tìm kiếm và bộ lọc theo ngày.

##### Card 2.5: [SP2-05] Xây dựng Service gọi Gemini AI bảo mật qua IPC (Ẩn API Key)
* **Nhãn:** `Sprint 2`, `AI/DSS` | **Story Points:** 3 | **Người nhận việc (Pull):** Tạ Đức Ngọc
* **Mô tả:**
  ```text
  Là một Kỹ sư AI, tôi muốn bảo vệ API Key an toàn trong biến môi trường Node.js Backend, không để lộ lên giao diện React.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Tạo file `.env` chứa `GEMINI_API_KEY`.
  - [ ] Viết `ai.service.ts` gọi `@google/genai`.
  - [ ] Thiết lập IPC channel `ai:chat`, `ai:recommendations`.

##### Card 2.6: [SP2-06] Xây dựng Layout tổng thể Sidebar, Header & Navigation
* **Nhãn:** `Sprint 2`, `Frontend` | **Story Points:** 2 | **Người nhận việc (Pull):** Nguyễn Hữu Phú
* **Mô tả:**
  ```text
  Là một Người dùng, tôi muốn thanh điều hướng trực quan để chuyển đổi nhanh giữa các màn hình ứng dụng.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Component `Sidebar.tsx` với các mục: Tổng quan, Giao dịch, Ngân sách, Sổ nợ, Dự báo & Mô phỏng, Cài đặt.
  - [ ] Hiển thị trạng thái active route mượt mà.

---

### 🚀 SPRINT 3: NGÂN SÁCH, SỔ NỢ 2 CHIỀU & THUẬT TOÁN CHẤM ĐIỂM DSS
* **Thời gian thực hiện:** 31/10/2026 – 13/11/2026 (2 tuần)
* **Sprint Goal (Mục tiêu Sprint):** *Hoàn thiện toàn bộ các tính năng kiểm soát tài chính nâng cao (Ngân sách, Công nợ) và đưa vào hoạt động động cơ chấm điểm sức khỏe tài chính DSS.*

#### Danh sách Thẻ (Cards) Sprint 3:

##### Card 3.1: [SP3-01] Xây dựng Module Quản lý Hạn mức Ngân sách & Cảnh báo vượt ngưỡng
* **Nhãn:** `Sprint 3`, `Frontend` | **Story Points:** 3 | **Người nhận việc (Pull):** Hà Văn Hoàng Tú
* **Mô tả:**
  ```text
  Là một Người dùng, tôi muốn đặt ngân sách cho từng nhóm chi tiêu (Ăn uống, Giải trí) và nhận cảnh báo khi đã tiêu gần hết tiền.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Thiết lập hạn mức ngân sách theo tháng.
  - [ ] Liên kết N-N giữa ngân sách và danh mục qua bảng `budget_categories`.
  - [ ] Thanh ProgressBar đổi màu đỏ khi tỷ lệ sử dụng đạt >= 80%.

##### Card 3.2: [SP3-02] Xây dựng Module Sổ theo dõi Công nợ 2 chiều & Trả nợ từng đợt
* **Nhãn:** `Sprint 3`, `Frontend` | **Story Points:** 5 | **Người nhận việc (Pull):** Hà Văn Hoàng Tú
* **Mô tả:**
  ```text
  Là một Người dùng, tôi muốn quản lý rõ ràng các khoản tôi đi vay và các khoản người khác nợ tôi kèm lịch sử thanh toán.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Phân loại 2 chiều: `payable` (Nợ phải trả) và `receivable` (Nợ phải thu).
  - [ ] Form ghi nhận thanh toán từng đợt (bảng `debt_payments`), tự động trừ số nợ còn lại và cập nhật số dư ví.
  - [ ] Cảnh báo badge đỏ khi khoản nợ đã quá hạn ngày trả.

##### Card 3.3: [SP3-03] Viết các câu truy vấn SQL phức tạp phục vụ Hỗ trợ ra quyết định (Yêu cầu 6)
* **Nhãn:** `Sprint 3`, `Backend/DB` | **Story Points:** 5 | **Người nhận việc (Pull):** Trần Văn Tuấn
* **Mô tả:**
  ```text
  Là một Kỹ sư Backend, tôi muốn viết các câu SQL nâng cao (Aggregate, Subquery, Window functions) để trích xuất tri thức tài chính phục vụ DSS.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Truy vấn 1: Tính Dòng tiền ròng và Tỷ lệ tiết kiệm tháng hiện tại.
  - [ ] Truy vấn 2: Phát hiện chi tiêu vượt 2.5 lần trung bình lịch sử 90 ngày.
  - [ ] Truy vấn 3: Rà soát ngân sách đã chi tiêu trên 80% hạn mức.

##### Card 3.4: [SP3-04] Cài đặt Thuật toán Đánh giá Sức khỏe Tài chính (Penalty Model)
* **Nhãn:** `Sprint 3`, `AI/DSS` | **Story Points:** 5 | **Người nhận việc (Pull):** Tạ Đức Ngọc
* **Mô tả:**
  ```text
  Là một Kỹ sư DSS, tôi muốn hệ thống tự động tính điểm sức khỏe tài chính từ 10 - 100 điểm dựa trên dữ liệu thu chi thực tế của người dùng.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Hàm `evaluateHealthScore()` trong `ai.service.ts`.
  - [ ] Điểm xuất phát = 100/100 khi dữ liệu trống; Trừ điểm khi thâm hụt thu chi, dự phòng yếu, nợ xấu.
  - [ ] Lưu kết quả đánh giá vào bảng `ai_user_profiles`.

##### Card 3.5: [SP3-05] Cài đặt Thuật toán Quét & Cảnh báo Chi tiêu Bất thường (Anomaly Detection)
* **Nhãn:** `Sprint 3`, `AI/DSS` | **Story Points:** 3 | **Người nhận việc (Pull):** Tạ Đức Ngọc
* **Mô tả:**
  ```text
  Là một Người dùng, tôi muốn hệ thống tự động phát hiện những khoản chi tiêu đột biến bất thường để kịp thời điều chỉnh thói quen chi tiêu.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Truy vấn giao dịch chi tiêu trong 30 ngày so với mức trung bình 90 ngày.
  - [ ] Lọc các giao dịch có hệ số > 2.5x.
  - [ ] Lưu vào bảng `ai_anomalies` và hiển thị thẻ cảnh báo màu hồng.

##### Card 3.6: [SP3-06] Xây dựng Biểu đồ Thu/Chi 12 tháng & Phân bổ Cơ cấu Chi tiêu (Recharts)
* **Nhãn:** `Sprint 3`, `Frontend` | **Story Points:** 3 | **Người nhận việc (Pull):** Nguyễn Hữu Phú
* **Mô tả:**
  ```text
  Là một Người dùng, tôi muốn nhìn thấy trực quan biến động tài chính của mình qua các biểu đồ đồ họa đẹp mắt.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] BarChart so sánh song song Thu nhập vs Chi tiêu qua 12 tháng.
  - [ ] PieChart phân bổ tỷ trọng các nhóm chi tiêu (Ăn uống, Mua sắm, Di chuyển...).
  - [ ] Tooltip định dạng tiền tệ Việt Nam Đồng (VND).

---

### 🚀 SPRINT 4: TÍCH HỢP GEMINI AI, RAG FINANCE & DỰ BÁO WHAT-IF
* **Thời gian thực hiện:** 14/11/2026 – 27/11/2026 (2 tuần)
* **Sprint Goal (Mục tiêu Sprint):** *Hiện thực hóa trọn vẹn điểm cộng Trí tuệ Nhân tạo (+ AI Bonus) với Dự báo chuỗi thời gian, Mô phỏng What-If và Trợ lý AI Copilot.*

#### Danh sách Thẻ (Cards) Sprint 4:

##### Card 4.1: [SP4-01] Xây dựng Module Dự báo Dòng tiền Tương lai 3 Tháng (Time-Series)
* **Nhãn:** `Sprint 4`, `AI/DSS`, `Frontend` | **Story Points:** 5 | **Người nhận việc (Pull):** Tạ Đức Ngọc & Nguyễn Hữu Phú
* **Mô tả:**
  ```text
  Là một Người dùng, tôi muốn biết trước số dư tài chính của mình trong 3 tháng tới theo các kịch bản khác nhau để chủ động kế hoạch chi dùng.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Thuật toán Time-Series dự báo thu chi dựa trên dữ liệu lịch sử và tỷ lệ tăng trưởng.
  - [ ] Sinh 3 kịch bản: Tích cực (+10%), Dự kiến (Trung bình), Thận trọng (-10%).
  - [ ] Biểu đồ vùng AreaChart nhiều dải màu và bảng kê số liệu chi tiết.

##### Card 4.2: [SP4-02] Xây dựng Công cụ Mô phỏng Kịch bản Giả định What-If
* **Nhãn:** `Sprint 4`, `AI/DSS`, `Frontend` | **Story Points:** 5 | **Người nhận việc (Pull):** Tạ Đức Ngọc & Nguyễn Hữu Phú
* **Mô tả:**
  ```text
  Là một Người dùng, tôi muốn thử nghiệm xem liệu tôi có đủ tiền mua laptop hoặc xe máy trả góp hay không trước khi quyết định xuống tiền.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Form nhập: Tên món đồ, Giá tiền, Trả trước, Tiền trả góp mỗi tháng, Số tháng trả góp.
  - [ ] Hệ thống đối soát tự động với dòng tiền dự phóng 3 tháng.
  - [ ] AI phân tích và đưa ra kết luận: "KHẢ THI" hoặc "RỦI RO MẤT THANH KHOẢN".
  - [ ] Lưu kịch bản vào bảng `ai_scenarios`.

##### Card 4.3: [SP4-03] Xây dựng Trợ lý Cố vấn Tài chính Toàn cục (Floating AI Copilot Widget)
* **Nhãn:** `Sprint 4`, `AI/DSS`, `Frontend` | **Story Points:** 5 | **Người nhận việc (Pull):** Phạm Văn Long & Tạ Đức Ngọc
* **Mô tả:**
  ```text
  Là một Người dùng, tôi muốn trò chuyện tự nhiên với một trợ lý AI hiểu rõ bối cảnh tài chính thực tế của tôi để nhận lời khuyên thông minh.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Nút tròn gradient nổi cố định ở góc phải màn hình (`FloatingAiChat.tsx`).
  - [ ] Áp dụng kỹ thuật RAG Finance: Tự động trích xuất số dư các ví, tổng thu chi tháng này nạp vào prompt ngữ cảnh của Gemini.
  - [ ] Gợi ý sẵn các câu hỏi nhanh: "Tháng này tôi còn bao nhiêu tiền tiêu?", "Cho tôi lời khuyên tiết kiệm".

##### Card 4.4: [SP4-04] Xây dựng Cơ chế Khuyến nghị Can thiệp 1-Click (1-Click Apply)
* **Nhãn:** `Sprint 4`, `AI/DSS`, `Frontend` | **Story Points:** 3 | **Người nhận việc (Pull):** Phạm Văn Long & Tạ Đức Ngọc
* **Mô tả:**
  ```text
  Là một Người dùng, khi nhận được đề xuất tối ưu dòng tiền từ AI, tôi muốn bấm 1 nút là hệ thống tự động áp dụng quyết định đó.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Thẻ khuyến nghị trên Dashboard kèm nút bấm "Áp dụng quyết định" và "Bỏ qua".
  - [ ] Khi bấm Áp dụng: Tự động điều chỉnh hạn mức ngân sách hoặc chuyển tiền vào mục tiêu tiết kiệm.
  - [ ] Lưu vết vào bảng `ai_recommendations` với trạng thái `applied`.

##### Card 4.5: [SP4-05] Xây dựng Tính năng Xuất Báo cáo Tài chính định dạng CSV (Yêu cầu 5)
* **Nhãn:** `Sprint 4`, `Backend/DB` | **Story Points:** 2 | **Người nhận việc (Pull):** Trần Văn Tuấn
* **Mô tả:**
  ```text
  Là một Người dùng, tôi muốn xuất dữ liệu thu chi và các phân tích ra file CSV để mở bằng Excel kiểm tra khi cần.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Hàm xuất file CSV hỗ trợ mã hóa UTF-8 tiếng Việt có dấu.
  - [ ] Xuất danh sách giao dịch, báo cáo ngân sách và lịch sử công nợ.

##### Card 4.6: [SP4-06] Hoàn thiện Bố cục Trung tâm Điều hành Dashboard
* **Nhãn:** `Sprint 4`, `Frontend` | **Story Points:** 3 | **Người nhận việc (Pull):** Nguyễn Hữu Phú
* **Mô tả:**
  ```text
  Là một Người dùng, tôi muốn nhìn thấy toàn cảnh tình trạng tài chính của mình trong 3 giây ngay khi vừa mở ứng dụng.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Khối thẻ KPI số dư, thu nhập, chi tiêu, dòng tiền ròng.
  - [ ] Khối AI Decision Center: Huy hiệu điểm sức khỏe, danh sách cảnh báo chi tiêu lạ, nút quét chi tiêu.

---

### 🚀 SPRINT 5: KIỂM THỬ TOÀN DIỆN, ĐÓNG GÓI INSTALLER & HOÀN THIỆN HỒ SƠ
* **Thời gian thực hiện:** 28/11/2026 – 12/12/2026 (2 tuần)
* **Sprint Goal (Mục tiêu Sprint):** *Đóng gói file cài đặt Windows (.exe Setup), hoàn thiện 100% hồ sơ báo cáo Word, chuẩn bị slide và demo xuất sắc trước hội đồng.*

#### Danh sách Thẻ (Cards) Sprint 5:

##### Card 5.1: [SP5-01] Kiểm thử Chức năng (Functional Testing) & Viết Bảng Test Cases
* **Nhãn:** `Sprint 5`, `Docs/QA` | **Story Points:** 3 | **Người nhận việc (Pull):** Nguyễn Hữu Phú & Hà Văn Hoàng Tú
* **Mô tả:**
  ```text
  Là một Kỹ sư QA, tôi muốn kiểm thử toàn bộ các kịch bản người dùng để đảm bảo ứng dụng không phát sinh lỗi bất ngờ trong buổi bảo vệ đồ án.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Viết tài liệu Test Cases (Test thu/chi, test số âm, test nợ quá hạn, test mất mạng khi gọi AI).
  - [ ] Chạy lệnh `npm run build` đảm bảo 0 lỗi biên dịch TypeScript.

##### Card 5.2: [SP5-02] Đóng gói Ứng dụng thành Bộ cài đặt Độc lập Windows (.exe Installer)
* **Nhãn:** `Sprint 5`, `Backend/DB` | **Story Points:** 5 | **Người nhận việc (Pull):** Phạm Văn Long
* **Mô tả:**
  ```text
  Là một Người dùng, tôi muốn cài đặt phần mềm trên Windows bằng 1 file Setup duy nhất mà không cần cài môi trường Node.js.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Cấu hình `electron-builder` trong `package.json`.
  - [ ] Chạy lệnh `npm run dist`.
  - [ ] Xuất bản file `release/Personal Finance Setup 3.0.0.exe`.

##### Card 5.3: [SP5-03] Thử nghiệm Triển khai Ứng dụng trên Máy tính Khách mới
* **Nhãn:** `Sprint 5`, `Backend/DB` | **Story Points:** 3 | **Người nhận việc (Pull):** Trần Văn Tuấn
* **Mô tả:**
  ```text
  Là một Giảng viên chấm thi, tôi muốn mở phần mềm trên máy tính của mình và hệ thống tự động chạy mà không cần cấu hình phức tạp.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Thử nghiệm trên máy tính mới chỉ có MySQL Server chạy cổng 3306.
  - [ ] Xác nhận ứng dụng tự sinh Database `personal_finance` và 17 bảng dữ liệu thành công.

##### Card 5.4: [SP5-04] Hoàn thiện Bộ Hồ sơ Phân tích & Thiết kế HTTT (.docx & .pdf)
* **Nhãn:** `Sprint 5`, `Docs/QA` | **Story Points:** 3 | **Người nhận việc (Pull):** Nguyễn Hữu Phú & Phạm Văn Long
* **Mô tả:**
  ```text
  Là Nhóm thực hiện đồ án, chúng tôi muốn một bộ hồ sơ báo cáo chỉn chu, đầy đủ 6 chương, có trang bìa Đại học Duy Tân Nhóm 17 và 5 sơ đồ kỹ thuật chuẩn mực.
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Báo cáo Word có đầy đủ 5 sơ đồ kỹ thuật (BFD, UCD, ERD, Activity, Architecture) và 3 Flowcharts DSS.
  - [ ] Cập nhật bìa Đại học Duy Tân, Lớp IS 402 A, Thầy Nguyễn Quang Ánh và danh sách 5 sinh viên.
  - [ ] Xuất bản file Word `.docx` và file `.pdf` nộp bài.

##### Card 5.5: [SP5-05] Thiết kế Slide Báo cáo PowerPoint & Chuẩn bị Kịch bản Demo Live
* **Nhãn:** `Sprint 5`, `Docs/QA` | **Story Points:** 3 | **Người nhận việc (Pull):** Cả 5 thành viên
* **Mô tả:**
  ```text
  Là Nhóm bảo vệ đồ án, chúng tôi muốn bài thuyết trình súc tích trong 15 phút, nêu bật được tính năng Hỗ trợ ra quyết định (DSS) và Trí tuệ Nhân tạo (+ AI).
  ```
* **Checklist tiêu chí hoàn thành:**
  - [ ] Slide PowerPoint 15-20 trang (Bối cảnh, BFD, CSDL 17 bảng, Thuật toán DSS, Demo thực tế).
  - [ ] Phân vai thuyết trình: Long (Tổng quan & Kiến trúc), Tuấn (CSDL & SQL), Ngọc (Thuật toán DSS & Gemini AI), Tú & Phú (Demo chức năng & Báo cáo).

---

## PHẦN 3: BỘ CÂU HỎI & KỊCH BẢN TRẢ LỜI VẤN ĐÁP AGILE/SCRUM

Khi Giảng viên hỏi về phương pháp quản lý dự án, nhóm trả lời theo các kịch bản mẫu sau:

#### Câu hỏi 1: "Nhóm em tổ chức các cuộc họp Sprint như thế nào?"
> **Trả lời:**  
> *"Dạ thưa thầy, nhóm em áp dụng mô hình Scrum gồm 5 Sprint, mỗi Sprint kéo dài đúng 2 tuần (tổng cộng 10 tuần từ 03/10 đến 12/12/2026).  
> * Đầu mỗi Sprint, nhóm họp **Sprint Planning** 30 phút để chốt mục tiêu (Sprint Goal) và kéo task từ Product Backlog sang Sprint Backlog.  
> * Trong tuần, nhóm duy trì **Daily Standup** ngắn 10 phút qua Discord vào mỗi buổi tối để chia sẻ: Hôm qua đã làm gì, hôm nay làm gì, và có ai gặp trở ngại (blocker) không để hỗ trợ kịp thời.  
> * Cuối mỗi Sprint, nhóm họp **Sprint Review** để demo tính năng đã hoàn thành và **Sprint Retrospective** để rút kinh nghiệm cho Sprint tiếp theo."*

#### Câu hỏi 2: "Tại sao theo lý thuyết Scrum không gán người phụ trách, mà trên Trello của nhóm lại có tên từng bạn?"
> **Trả lời:**  
> *"Dạ thưa thầy, theo Scrum Guide chuẩn thì ban đầu trong Backlog các task là trách nhiệm chung của cả đội và không bị áp đặt phân công (No Push).  
> Tuy nhiên, trong buổi họp Sprint Planning, nhóm em áp dụng **Cơ chế Kéo việc (Pull Mechanism)**: Các thành viên tự giác xung phong nhận task (Pull task) phù hợp với thế mạnh kỹ thuật của mình. Khi bạn nhận làm thì nhóm mới gắn Avatar/Tên lên Trello để cả đội minh bạch tiến độ và thuận tiện cho việc kiểm thử chéo (Review/QA) ạ."*

#### Câu hỏi 3: "Nếu đến cuối Sprint mà có task chưa kịp hoàn thành thì nhóm xử lý thế nào?"
> **Trả lời:**  
> *"Dạ thưa thầy, theo nguyên tắc của Scrum, nhóm em tuyệt đối không gia hạn thời gian của Sprint (Timebox bất biến là 2 tuần).  
> Nếu một task chưa đạt định nghĩa hoàn thành (Definition of Done - DoD), task đó sẽ được chuyển ngược về Product Backlog để nhóm đánh giá lại độ ưu tiên trong buổi Sprint Planning tiếp theo, đồng thời họp Retrospective để tìm nguyên nhân (do ước lượng sai Story Points hay do vướng mắc kỹ thuật) để cải thiện vận tốc (Velocity) của nhóm."*

---

> [!TIP]
> **HƯỚNG DẪN DÀNH CHO TRƯỞNG NHÓM (LONG):**  
> 1. Mở Trello trên trình duyệt, tạo bảng và tạo 5 cột.  
> 2. Lần lượt copy tiêu đề và checklist của từng Card ở Phần 2 dán vào Trello (chỉ mất khoảng 10-15 phút).  
> 3. Chụp 1 ảnh chụp màn hình bảng Trello hoàn chỉnh và lưu vào file báo cáo Word để minh chứng cho Chương 6!
