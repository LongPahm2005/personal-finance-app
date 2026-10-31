# Cách tính mô phỏng kịch bản

Mỗi kết quả mới có nút **Xem cách tính**: số liệu nguồn, công thức, phép thay số, kết quả từng bước và bảng số dư theo tháng. Chi tiết được lưu trong JSON của chính kết quả đó; sửa form hoặc thay đổi thu/chi về sau không làm thay đổi phép tính đã lưu. Kết quả cũ không có số liệu nguồn cần chạy lại; không tự tính ngược hay sửa dữ liệu lịch sử.

## Mua trả góp

- Phần giá mua còn lại = giá mua − trả trước.
- Tổng trả góp = khoản trả mỗi tháng × số tháng.
- Tổng thanh toán = trả trước + tổng trả góp.
- Chênh lệch với giá mua = tổng thanh toán − giá mua.
- Thặng dư cơ sở = thu nhập tháng − chi tiêu tháng.
- Thặng dư mới = thặng dư cơ sở − khoản trả mỗi tháng.
- Số dư cuối tháng m = số dư hiện tại − trả trước + m × thặng dư mới.

Ví dụ giá mua 35.000.000, trả trước 10.000.000, trả 2.500.000/tháng trong 12 tháng: phần còn lại 25.000.000; tổng trả góp 30.000.000; tổng thanh toán 40.000.000; chênh lệch 5.000.000. Chênh lệch có thể gồm lãi/phí; không suy ra lãi suất.

Khoản trả hàng tháng do người dùng nhập theo báo giá bên cho vay, chưa tự tính annuity. Chặn tổng trả góp nhỏ hơn phần giá mua còn lại; nếu đã trả đủ giá mua thì khoản trả góp phải bằng 0. Không giả định có khoản thanh toán cuối kỳ hoặc ưu đãi giảm giá.

## Giảm thu nhập

Người dùng nhập tỷ lệ giảm từ 1–100% và thời hạn. Thu nhập giảm mỗi tháng = làm tròn(thu nhập cơ sở × tỷ lệ / 100). Thặng dư mới = thặng dư cơ sở − mức giảm. Số dư cuối tháng m = số dư hiện tại + m × thặng dư mới.

## Chi tiêu tùy chỉnh

Nhập khoản chi ban đầu và khoản chi bổ sung hàng tháng. Tổng chi bổ sung = chi ban đầu + số tháng × chi hàng tháng. Thặng dư mới = thặng dư cơ sở − chi hàng tháng. Số dư cuối tháng m = số dư hiện tại − chi ban đầu + m × thặng dư mới. Loại này không giảm thu nhập.

## Phạm vi kết quả

Cơ sở là tổng thu/chi của tháng hiện tại tại thời điểm chạy, có thể chưa đủ tháng; giả định giữ nguyên trong thời hạn. Tháng 0 là sau khoản chi ban đầu; các mốc tiếp theo là cuối tháng. Chưa mô phỏng ngày nhận lương, trả nợ trong tháng, mùa vụ, hoặc Monte Carlo; không dùng kết quả này như xác suất an toàn.

So sánh với cơ sở tại cùng mốc: chênh lệch = −chi ban đầu − m × tác động hàng tháng. Đánh dấu nguy hiểm nếu một mốc số dư âm; cảnh báo nếu thặng dư mới âm dù chưa hết tiền trong thời hạn. Không suy trạng thái từ câu văn đánh giá.

## Kiểm tra

```powershell
npm run build
node scripts/forecast/verify-scenario-calculations.cjs
node scripts/forecast/verify-scenario-inputs.cjs
```

Các kiểm tra dùng dữ liệu tổng hợp và mock, không thay đổi database. Không cần sửa schema: các bước tính được lưu trong `ai_scenarios.simulation_result`.
