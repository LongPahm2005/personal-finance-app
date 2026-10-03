# Personal Finance

Ứng dụng desktop quản lý tài chính cá nhân, xây dựng bằng Electron, React, TypeScript và Vite. MySQL được dùng để lưu dữ liệu.

## Cài môi trường (Windows)

### 1. Cài Git

Tải và cài Git for Windows từ [git-scm.com/download/win](https://git-scm.com/download/win). Có thể giữ các lựa chọn mặc định trong trình cài đặt.

Nếu đã tải mã nguồn dự án dưới dạng ZIP thì có thể bỏ qua bước này.

### 2. Cài Node.js và npm

1. Tải Node.js phiên bản LTS từ [nodejs.org/en/download](https://nodejs.org/en/download/). Dùng Node.js **20.19 trở lên** hoặc **22.12 trở lên** để tương thích với Vite của dự án.
2. Chạy bộ cài đặt và giữ tùy chọn thêm Node.js vào `PATH`.
3. Đóng rồi mở lại terminal, kiểm tra cài đặt:

```powershell
node --version
npm --version
```

### 3. Cài MySQL Server và MySQL Workbench

1. Tải MySQL Installer từ [dev.mysql.com/downloads/installer](https://dev.mysql.com/downloads/installer/).
2. Trong quá trình cài, chọn MySQL Server 8.0 và MySQL Workbench (Workbench dùng để tạo database và chạy file SQL).
3. Thiết lập mật khẩu cho tài khoản `root` và giữ cổng mặc định `3306`.
4. Đảm bảo MySQL Server đang chạy dưới dạng Windows Service.

Ghi nhớ mật khẩu `root`; cần nhập mật khẩu này vào file `.env` ở bước cấu hình bên dưới.

## Cài đặt và khởi chạy dự án

### 1. Tải mã nguồn

Nếu đã có mã nguồn trên máy, mở PowerShell tại thư mục dự án và bỏ qua phần clone. Nếu chưa, dùng Git:

```powershell
git clone https://github.com/LongPahm2005/personal-finance-app.git
cd personal-finance-app
```

### 2. Cài các thư viện của dự án

Chạy tại thư mục có file `package.json`:

```bash
npm ci
```

Lệnh này cài dependencies theo `package-lock.json`, bao gồm các thư viện frontend, Electron, TypeScript và công cụ build.

### 3. Tạo cơ sở dữ liệu

Mở MySQL Workbench và kết nối tới MySQL Server bằng tài khoản `root`. Tạo database `personal_finance` với charset `utf8mb4`, sau đó chọn database vừa tạo làm schema mặc định.

Mở file `personal_finance.sql` ở thư mục dự án trong Workbench và chạy toàn bộ script trên database vừa tạo.

Script SQL tạo các bảng cần thiết và thêm một số danh mục thu/chi mẫu. **Script có lệnh `DROP TABLE IF EXISTS`**: chỉ chạy trên database mới hoặc database không cần giữ dữ liệu, vì chạy lại có thể xóa các bảng hiện có.

### 4. Cấu hình kết nối MySQL

Tạo file `.env` tại thư mục gốc dự án bằng cách sao chép `.env.example`:

```powershell
Copy-Item .env.example .env
```

Mở `.env` và điền thông tin kết nối MySQL:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat_khau_mysql
DB_NAME=personal_finance

NODE_ENV=development
```

Thay `mat_khau_mysql` bằng mật khẩu `root` đã tạo khi cài MySQL. Nếu để `DB_PASSWORD` trống, ứng dụng hiện thử dùng mật khẩu mặc định `123456`.

### 5. Chạy ứng dụng ở chế độ phát triển
 
```bash
npm run dev
```

Lệnh này khởi chạy Vite và Electron cùng lúc. Đóng cửa sổ ứng dụng hoặc nhấn `Ctrl+C` trong terminal để dừng.

## Kiểm tra và build

Chạy ESLint:

```bash
npm run lint
```

Build frontend và biên dịch mã Electron:

```bash
npm run build
```

Sau khi build thành công:

- Frontend được tạo trong `dist/`.
- Mã Electron đã biên dịch được tạo trong `backend/dist-electron/`.

## Tạo bộ cài Windows

```bash
npm run dist
```

Lệnh này chạy build trước, sau đó dùng electron-builder tạo bộ cài NSIS trong `release/`. Mở file `Personal Finance Setup <version>.exe` để cài ứng dụng.

## Xử lý sự cố thường gặp

- **Không kết nối được MySQL:** kiểm tra MySQL Server đang chạy, `DB_HOST`/`DB_PORT`, tài khoản và mật khẩu trong `.env`, và database `personal_finance` đã được tạo cũng như import SQL.
- **Cổng 5173 đang được sử dụng:** dừng tiến trình đang dùng cổng đó rồi chạy lại `npm run dev`; Vite được cấu hình không tự chuyển sang cổng khác.
- **Build hoặc cài dependencies gặp lỗi:** kiểm tra phiên bản Node.js bằng `node --version`, sau đó thử cài lại theo lockfile bằng `npm ci`.

## Cấu trúc chính

- `frontend/`: giao diện React.
- `backend/electron/`: Electron main process, preload, IPC và dịch vụ dữ liệu.
- `backend/database/`: tài liệu cấu trúc database.
- `personal_finance.sql`: schema và dữ liệu danh mục mẫu.
