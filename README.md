# HỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH TÀI CHÍNH CÁ NHÂN BẰNG AI (AI-FDSS)

> **Personal Financial Decision Support System — Desktop Application**  
> Phiên bản: **v3.0.0 (AI-Powered Edition)** | Nền tảng: **Windows Desktop (Electron + React + MySQL + Google Gemini AI)**

---

## 🌟 GIỚI THIỆU TỔNG QUAN

**AI-FDSS** là ứng dụng máy tính (Desktop App) hỗ trợ người dùng theo dõi và quản lý toàn diện dòng tiền cá nhân, kết hợp cùng **Trí tuệ nhân tạo (Generative AI & Phân tích chuỗi thời gian Time-Series)** nhằm đóng vai trò như một **Chuyên gia Cố vấn Tài chính Cá nhân**.

Khác với các ứng dụng ghi chép thu chi thụ động truyền thống, AI-FDSS chủ động phân tích cơ cấu chi tiêu thực tế, dự báo biến động dòng tiền trong tương lai, mô phỏng các kịch bản mua sắm lớn (What-If), cảnh báo chi tiêu bất thường và đưa ra các **khuyến nghị quyết định hành động áp dụng tự động chỉ với 1 cú nhấp chuột (1-Click Apply)**.

---

## 🚀 CÁC TÍNH NĂNG NỔI BẬT

### 1. Trọng tâm AI Ra quyết định (Decision Support System)
* **Khuyến nghị Quyết định 1-Click (Dashboard):** AI tự động phân tích dữ liệu thu chi thực tế, đưa ra giải pháp cụ thể (cắt giảm chi tiêu danh mục nào, bổ sung quỹ khẩn cấp bao nhiêu) và cho phép người dùng phê duyệt áp dụng ngay.
* **Cảnh báo Chi tiêu Bất thường (Anomaly Detection):** Tự động rà soát và phát hiện các khoản chi tăng đột biến gấp nhiều lần mức chi tiêu trung bình để ngăn chặn rò rỉ dòng tiền.
* **Đánh giá Sức khỏe Tài chính (Thang 100 điểm):** Vận hành theo mô hình trừ điểm vi phạm (Penalty Model), khởi đầu **100/100 (Hoàn hảo - Sạch nợ)** và chỉ giảm điểm khi phát sinh vi phạm tài chính (chi vượt thu, nợ quá hạn, vỡ trần ngân sách).
* **Dự báo Dòng tiền Tương lai (Time-Series Forecasting):** Dự toán số dư ví, thu nhập và chi phí trong 3 tháng tới kèm 3 kịch bản: Tích cực, Thận trọng và Dự kiến.
* **Mô phỏng Kịch bản Giả định (What-If Analysis):** Thử nghiệm trước các quyết định mua sắm tài sản lớn hoặc trả góp (mua xe, mua điện thoại, đầu tư) để AI đánh giá độ an toàn dòng tiền trước khi bạn xuống tiền.
* **Trợ lý Ảo AI Copilot (Chatbot Nổi Toàn Cục):** Luôn thường trực ở góc màn hình. Ứng dụng kỹ thuật RAG Finance để truy vấn số liệu thực tế trong database và giải đáp mọi băn khoăn tài chính cá nhân bằng tiếng Việt tự nhiên.

### 2. Nghiệp vụ Quản lý Dòng tiền Cốt lõi
* **Quản lý Đa Ví & Tài khoản:** Theo dõi tập trung Tiền mặt, Tài khoản Ngân hàng (Vietcombank, MB Bank...), Ví điện tử (MoMo, ZaloPay).
* **Ghi chép Giao dịch Thu - Chi:** Thao tác thêm nhanh trong 3 giây, tự động khấu trừ/cộng dồn số dư ví tức thời.
* **Ngân sách & Cảnh báo Vi phạm:** Đặt trần chi tiêu theo từng nhóm danh mục, cảnh báo màu sắc trực quan khi chạm ngưỡng 80% hoặc vượt trần 100%.
* **Quản lý Công nợ 2 Chiều:** Quản lý sổ nợ Cho vay (Phải thu) và Vay nợ (Phải trả), ghi nhận trả nợ theo từng đợt và nhắc nợ quá hạn.
* **Mục tiêu Tiết kiệm Tích lũy:** Theo dõi tiến độ tích lũy tài sản cho các dự định tương lai.
* **Giao dịch Định kỳ Tự động:** Tự động hóa các khoản chi phí cố định (Tiền nhà, Internet, Lương tháng).
* **Báo cáo & Thống kê Trực quan:** Biểu đồ dòng tiền Thu - Chi và biểu đồ tròn phân bổ chi tiêu bằng Recharts, hỗ trợ xuất file CSV.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

| Tầng hệ thống | Công nghệ / Thư viện | Vai trò |
| :--- | :--- | :--- |
| **Desktop Shell** | Electron v35 | Đóng gói ứng dụng desktop native cho Windows |
| **Giao diện (Frontend)** | React 19, TypeScript, Vite 7 | Giao diện người dùng mượt mà, chuẩn component-driven |
| **Biểu đồ & Icon** | Recharts, Lucide React | Trực quan hóa dữ liệu tài chính chuyên nghiệp |
| **Backend & IPC** | Node.js, Electron IPC, TypeScript | Xử lý logic nghiệp vụ, tính toán dòng tiền, IPC Bridge |
| **Cơ sở dữ liệu** | MySQL 8.0 (`mysql2/promise`) | 17 bảng dữ liệu chuẩn hóa, ACID, quan hệ chặt chẽ |
| **Mô hình Trí tuệ Nhân tạo**| Google Gemini API (`@google/generative-ai`) | Động cơ sinh quyết định, mô phỏng What-If và Chatbot RAG |

---

## 📂 CẤU TRÚC THƯ MỤC DỰ ÁN

```text
personal-finance/
├── backend/
│   ├── dist-electron/             # Mã nguồn Electron sau khi biên dịch
│   └── electron/
│       ├── database/              # Kết nối MySQL & Types (connection.ts)
│       ├── ipc/                   # IPC Handlers (AI, Ví, Giao dịch, Ngân sách, Nợ...)
│       ├── services/              # Logic dịch vụ (ai.service.ts, report.service.ts...)
│       ├── main.ts                # Tiến trình chính Electron Main Process
│       └── preload.ts             # Context Bridge an toàn kết nối Frontend - Backend
├── frontend/
│   ├── src/
│   │   ├── components/            # UI components, layout, FloatingAiChat...
│   │   ├── pages/
│   │   │   ├── Dashboard/         # Trung tâm điều hành & Khuyến nghị / Cảnh báo AI
│   │   │   ├── ForecastScenarios/ # Module riêng Dự báo & Mô phỏng kịch bản What-If
│   │   │   ├── Income/ Expense/   # Quản lý thu chi
│   │   │   ├── Transactions/      # Sổ giao dịch
│   │   │   ├── Budgets/ Savings/  # Ngân sách và Mục tiêu tiết kiệm
│   │   │   ├── Debts/             # Quản lý công nợ
│   │   │   ├── Reports/           # Báo cáo và biểu đồ
│   │   │   └── Settings/          # Cài đặt mô hình AI & Sao lưu database
│   │   ├── services/api.ts        # API Client giao tiếp IPC
│   │   └── types/                 # Định nghĩa TypeScript toàn hệ thống
│   └── index.html
├── docs/
│   ├── database/                  # File script SQL MySQL đầy đủ (17 bảng)
│   ├── diagrams/                  # Sơ đồ kiến trúc ERD, BFD xuất ra SVG/PNG
│   └── tai-lieu-huong-dan-su-dung.md # Tài liệu hướng dẫn sử dụng chi tiết
├── .env                           # File cấu hình môi trường bảo mật (Database, AI Key)
└── package.json                   # Cấu hình dự án (v3.0.0)
```

---

## ⚙️ HƯỚNG DẪN KHỞI CHẠY (DEVELOPMENT)

### 1. Yêu cầu tiên quyết
* **Hệ điều hành:** Windows 10/11
* **Node.js:** Phiên bản `>= 20.x` hoặc `>= 22.x`
* **MySQL Server:** Phiên bản `8.0+` (chạy trên cổng `3306`)

### 2. Cấu hình Cơ sở dữ liệu & Biến môi trường
Tạo file `.env` tại thư mục gốc của dự án với nội dung:

```env
# Cấu hình Cơ sở dữ liệu MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mật_khẩu_mysql_của_bạn
DB_NAME=personal_finance

# Cấu hình Trí tuệ Nhân tạo Google Gemini
AI_PROVIDER=gemini
AI_API_KEY=khóa_google_gemini_api_key_của_bạn
AI_MODEL=gemini-3-flash-preview
```

Khởi tạo cơ sở dữ liệu bằng cách import file SQL tại:
`docs/database/personal_finance_mysql_ai_full.sql` vào MySQL.

### 3. Cài đặt thư viện & Khởi chạy ứng dụng
Mở terminal PowerShell tại thư mục dự án và thực hiện:

```powershell
# Cài đặt các gói phụ thuộc
npm install

# Khởi chạy đồng thời Vite Frontend và Electron Backend
npm run dev
```

---

## 📦 ĐÓNG GÓI BỘ CÀI ĐẶT WINDOWS (.EXE)

Để xuất bộ cài đặt hoàn chỉnh cho máy tính Windows:

```powershell
# Biên dịch Frontend & Backend
npm run build

# Đóng gói file cài đặt Windows Installer (.exe)
npm run dist
```
File cài đặt sau khi đóng gói sẽ nằm trong thư mục `release/` (ví dụ: `Personal Finance Setup 3.0.0.exe`).

---

## 📖 TÀI LIỆU HỆ THỐNG
* **Hướng dẫn sử dụng chi tiết:** Xem tại [`docs/tai-lieu-huong-dan-su-dung.md`](file:///docs/tai-lieu-huong-dan-su-dung.md)
* **Tài liệu thiết kế sơ đồ BFD & ERD:** Xem tại [`docs/tai-lieu-thiet-ke-he-thong-va-so-do.md`](file:///docs/tai-lieu-thiet-ke-he-thong-va-so-do.md)

---

## 👤 TÁC GIẢ
* **Dự án:** Hệ thống Hỗ trợ Ra Quyết định Tài chính Cá nhân bằng AI (AI-FDSS)
* **Phiên bản:** 3.0.0
* **Tác giả:** longpahm
