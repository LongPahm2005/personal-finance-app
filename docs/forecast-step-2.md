# Dự báo và kết nối AI — bước 2

## Bản sửa kết nối và bảng AI

Đã xác nhận Gemini trả lời thực tế với cấu hình hiện tại. Phép thử dùng ngân sách 1024 token, thử lại 4096 token nếu kết thúc với `MAX_TOKENS`; không tính phần `thought` là câu trả lời. Danh sách mô hình được giữ lại khi kiểm tra phản hồi thất bại. Tham khảo [tài liệu Google về thinking](https://ai.google.dev/gemini-api/docs/generate-content/thinking).

Database hiện thiếu 8 bảng AI. Migration `docs/database/migrations/001-add-ai-tables.sql` chỉ thêm các bảng này bằng `CREATE TABLE IF NOT EXISTS`, không thay đổi bảng nghiệp vụ hay thêm số liệu tài chính. Bảng phiên chat mới có `updated_at` phù hợp với truy vấn hiện tại. Ứng dụng tạo phiên chat khi sử dụng lần đầu.

Xem trước migration (chỉ đọc):

```powershell
node scripts/database/migrate-ai.cjs
```

Chỉ sau khi người dùng duyệt migration, áp dụng bằng:

```powershell
node scripts/database/migrate-ai.cjs --apply
```

Migration chưa được áp dụng. Khi chưa có bảng, trang kịch bản báo hướng dẫn tiếng Việt và khóa nút chạy thay vì hiển thị lỗi SQL.

## Phạm vi

Đã thêm baseline 90 ngày từ trung bình thu/chi 30 ngày hoàn tất gần nhất. Ngày trống được tính là 0; bỏ qua giao dịch hôm nay và tương lai khi tính trung bình. Số dư mở đầu lấy từ WalletService, số tiền đầu ra là số nguyên VND. Cần lịch sử trải dài ít nhất 30 ngày; điều này không có nghĩa dữ liệu được ghi đầy đủ mỗi ngày.

Biểu đồ có ngưỡng cảnh báo chỉnh được, số dư thấp nhất và ngày đầu dưới ngưỡng. Baseline chưa phải P50; chưa có Monte Carlo, lịch cố định, worker hay cache. Nút “Bỏ qua kết quả” chỉ bỏ phản hồi đang chờ; không hủy truy vấn MySQL. API dự báo tháng cũ đã ngừng tạo số liệu giả.

What-If hiện vẫn là chức năng cũ theo quy tắc, sẽ triển khai lại ở bước 5. Không thay đổi giao diện trang khác, không thêm dependency hoặc migration.

## Kết nối Gemini

Backend ưu tiên AI_API_KEY trong `.env`, sau đó mới dùng khóa trong bảng cấu hình nếu có. Khóa không được trả về renderer; yêu cầu dùng header thay vì URL. Lỗi mạng, quota và quyền truy cập được báo bằng tiếng Việt; lỗi không sinh khuyến nghị mẫu.

Thêm các biến sau vào `.env` tại thư mục gốc, giữ nguyên cấu hình MySQL hiện có:

```dotenv
AI_PROVIDER=gemini
AI_API_KEY=YOUR_GEMINI_API_KEY
AI_MODEL=gemini-flash-latest
```

Thay `YOUR_GEMINI_API_KEY` bằng khóa thật trên máy, không gửi khóa trong chat hoặc commit vào Git. Tên model trên chỉ là giá trị khởi đầu: nút kiểm tra sẽ lấy danh sách mô hình mà tài khoản thực sự hỗ trợ. Cấu hình model trong bảng `ai_configs`, nếu có, được ưu tiên hơn `AI_MODEL`.

Khởi động lại Electron, vào Dự báo & Mô phỏng → Kiểm tra kết nối AI. Kiểm tra dùng một lời nhắn thử, không gửi số liệu tài chính. Nếu model không khả dụng, chọn model trong danh sách trả về và lưu. Việc lưu model yêu cầu bảng `ai_configs`; nếu chưa có bảng, cấu hình model qua `.env` rồi khởi động lại.

Chẩn đoán tại thời điểm thực hiện: MySQL kết nối được; có 9 bảng nghiệp vụ, thiếu bảng AI; lịch định kỳ dùng `next_date`; chưa có khóa Gemini trong cấu hình được đọc. Chưa thay đổi schema. Các chức năng AI cần lưu trữ vẫn cần migration được duyệt trước.

## Chạy và kiểm tra

```powershell
npm run dev
npm run build
node scripts/forecast/verify-baseline.cjs
node scripts/forecast/verify-gemini.cjs
node scripts/forecast/check-connections.cjs
```

Chạy build trước các script kiểm tra. Hai script verify dùng dữ liệu tổng hợp/mock, không gọi Gemini. Script check-connections chỉ đọc MySQL và gửi lời nhắn thử Gemini nếu có khóa. Chưa có backtest; thuộc bước 6.

## File chính

- `backend/electron/services/forecast/features.ts`: chuẩn hóa chuỗi ngày và cộng dòng tiền.
- `backend/electron/services/forecast/forecast.ts`: baseline thuần, độc lập database/UI.
- `backend/electron/services/forecast.service.ts`: truy vấn dữ liệu thật và số dư.
- `backend/electron/services/gemini.ts`: gọi Gemini, kiểm tra model và phản hồi thực tế.
- `backend/electron/services/ai.service.ts`: dùng helper Gemini, ưu tiên khóa môi trường, bỏ fallback giả và ngừng API dự báo tháng cũ.
- `backend/electron/ipc/ai.ipc.ts`, `preload.ts`, frontend `services/api.ts`, `types/index.ts`: hợp đồng IPC và che khóa API.
- `frontend/src/pages/ForecastScenarios/DailyForecast.tsx`: biểu đồ baseline và kiểm tra AI.
- `frontend/src/pages/ForecastScenarios/ForecastScenarios.tsx`: tích hợp biểu đồ mới, báo lỗi kịch bản và ghi đúng nguồn đánh giá theo quy tắc.
- `scripts/forecast/`: kiểm tra baseline, Gemini và chẩn đoán kết nối.
