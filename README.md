# Personal Finance

Ứng dụng desktop quản lý tài chính cá nhân, xây dựng bằng Electron, React, TypeScript, Vite và SQLite. Phiên bản hiện tại: **2.0.0**.

Ứng dụng lưu dữ liệu cục bộ trên máy Windows. Không cần cài hoặc chạy MySQL Server; database của mỗi tài khoản Windows là riêng.

## Cài đặt ứng dụng trên Windows

1. Nhận file cài đặt `Personal Finance Setup 2.0.0.exe` từ người chia sẻ dự án.
2. Mở file cài đặt, chọn thư mục cài nếu cần rồi hoàn tất các bước hướng dẫn.
3. Mở **Personal Finance** từ Start Menu hoặc shortcut trên Desktop.
4. Ở lần chạy đầu, ứng dụng tự tạo database SQLite và các danh mục mặc định.

Ứng dụng không đóng gói dữ liệu cá nhân của người tạo bộ cài. Mỗi người dùng sẽ có database riêng trên máy của mình. Nếu Windows hiện cảnh báo ứng dụng chưa xác định nhà phát hành, đó là do bộ cài chưa được ký số; chỉ tiếp tục nếu bạn tin cậy nguồn nhận file.

## Dữ liệu và quyền riêng tư

Database nằm tại:

```text
%APPDATA%\Personal Finance\personal_finance.sqlite
```

Mở thư mục này bằng PowerShell:

```powershell
Start-Process explorer.exe -ArgumentList "`"$env:APPDATA\Personal Finance`""
```

Database được lưu theo tài khoản Windows. Những người dùng chung một tài khoản Windows cũng dùng chung dữ liệu ứng dụng; muốn tách dữ liệu, hãy dùng tài khoản Windows riêng.

Database cục bộ **không được mã hóa bởi ứng dụng**. Hãy bảo vệ tài khoản Windows và không gửi file `.sqlite` cho người khác nếu không muốn chia sẻ dữ liệu tài chính.

## Sử dụng ứng dụng

Các mục ở thanh bên:

- **Dashboard:** xem số dư, thu chi trong tháng, công nợ, tiết kiệm và các giao dịch gần đây.
- **Thu nhập / Chi tiêu:** ghi nhận khoản thu hoặc chi, chọn ví và danh mục.
- **Lịch sử giao dịch:** xem, tìm kiếm và lọc giao dịch theo loại hoặc khoảng ngày.
- **Công nợ:** tạo khoản phải thu/phải trả và ghi nhận các lần thanh toán.
- **Ngân sách:** lập hạn mức theo thời gian và danh mục, theo dõi số tiền đã dùng.
- **Tiết kiệm:** tạo mục tiêu, cập nhật số tiền tích lũy và theo dõi tiến độ.
- **Báo cáo:** xem xu hướng và tổng hợp thu chi.
- **Cài đặt & Sao lưu:** kiểm tra database, xuất giao dịch CSV và tạo bản sao dữ liệu JSON.

### Bắt đầu

1. Mở ứng dụng và vào **Thu nhập** hoặc **Chi tiêu** để ghi nhận giao dịch đầu tiên.
2. Chọn ví, danh mục, số tiền, ngày giao dịch và ghi chú nếu cần.
3. Tạo ngân sách, mục tiêu tiết kiệm hoặc khoản công nợ tại các trang tương ứng.
4. Dùng **Lịch sử giao dịch** và **Báo cáo** để tra cứu, xem tổng hợp.

### Sao lưu và xuất dữ liệu

- Vào **Cài đặt & Sao lưu** → **Sao lưu database** để tạo file JSON chứa dữ liệu ứng dụng. Có thể nhập một thư mục sao lưu; nếu để trống, ứng dụng lưu trong thư mục Documents của Windows.
- Vào **Cài đặt & Sao lưu** → **Xuất CSV** để lưu danh sách giao dịch thành file CSV, có thể mở bằng Excel.
- Nên sao lưu định kỳ và giữ bản sao ở nơi an toàn. Gỡ cài đặt ứng dụng không thay thế cho việc sao lưu database.
- Phiên bản hiện tại chưa có nút phục hồi file JSON trong giao diện. Hãy giữ lại file sao lưu; không thay thế hoặc xóa file SQLite đang dùng nếu chưa có bản sao an toàn.

## Chạy dự án ở chế độ phát triển

### Yêu cầu

- Windows 10/11.
- Git for Windows nếu clone dự án.
- Node.js **20.19 trở lên** hoặc **22.12 trở lên**, kèm npm.
- Không cần cài MySQL hoặc SQLite riêng.

Kiểm tra phiên bản:

```powershell
node --version
npm --version
```

### Cài và chạy

Clone dự án (nếu chưa có mã nguồn), cài dependencies và khởi động:

```powershell
git clone https://github.com/LongPahm2005/personal-finance-app.git
cd personal-finance-app
npm ci
npm run dev
```

`npm run dev` chạy Vite và Electron. Đóng cửa sổ ứng dụng hoặc nhấn `Ctrl+C` trong terminal để dừng.

Ứng dụng tự tạo database tại `%APPDATA%\Personal Finance\personal_finance.sqlite`; không cần tạo `.env`, cài database server hay chạy file SQL để khởi động bản hiện tại.

### Lệnh dành cho phát triển

```powershell
npm run lint
npm run build
npm run dist
```

- `npm run lint`: chạy ESLint trên toàn dự án.
- `npm run build`: build giao diện và biên dịch mã Electron.
- `npm run dist`: tạo bộ cài Windows trong `release/`, tên file theo version trong `package.json`.

Nếu quá trình đóng gói báo `A required privilege is not held by the client` khi giải nén `winCodeSign`, bật **Windows Developer Mode** hoặc dùng terminal có quyền phù hợp. Có thể thử tạo NSIS installer mà không sửa tài nguyên executable bằng lệnh:

```powershell
npx electron-builder --win nsis --config.win.signAndEditExecutable=false
```

### Nhập snapshot SQLite cũ

Chỉ dùng lệnh này khi có snapshot SQLite được xuất theo cấu trúc MySQL cũ. Công cụ chuyển đổi từ chối ghi đè database đích đã tồn tại:

```powershell
npm run migrate:legacy-sqlite -- "C:\duong-dan\personal_finance.sqlite"
```

## Xử lý sự cố

- **Không thấy dữ liệu:** kiểm tra tài khoản Windows đang đăng nhập và mở đúng thư mục `%APPDATA%\Personal Finance`.
- **Không mở/ghi được database:** kiểm tra quyền ghi vào thư mục trên và đảm bảo database không bị khóa bởi một tiến trình khác.
- **Cổng 5173 đang được sử dụng khi chạy chế độ phát triển:** đóng tiến trình đang dùng cổng hoặc khởi động lại sau khi cổng được giải phóng.
- **Cài dependencies hoặc build thất bại:** kiểm tra phiên bản Node.js, sau đó chạy lại `npm ci`.
- **Cần chia sẻ dữ liệu với người khác:** dùng tính năng sao lưu và chỉ chia sẻ file JSON khi bạn thực sự muốn gửi dữ liệu trong đó. Không gửi database cá nhân kèm mã nguồn hay bộ cài.

## Cấu trúc dự án

- `frontend/`: giao diện React.
- `backend/electron/`: Electron main process, preload, IPC, dịch vụ và database.
- `backend/electron/database/schema.ts`: schema SQLite và dữ liệu khởi tạo.
- `docs/database/`: schema MySQL cũ được giữ để tham khảo khi chuyển đổi dữ liệu.
- `scripts/database/`: công cụ nhập snapshot SQLite theo schema cũ vào database ứng dụng.
