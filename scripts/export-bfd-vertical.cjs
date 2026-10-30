const fs = require('node:fs');
const path = require('node:path');

const outputDir = path.resolve(__dirname, '../docs/diagrams');
const desktopDir = 'C:\\Users\\phamv\\OneDrive\\Desktop\\SO_DO_DO_AN_AI_FINANCE';

// 1. Dạng cây phân cấp dọc chuẩn giáo trình (Trục trái -> nhánh con dọc sang phải)
const bfdTreeLR = `graph LR
    ROOT["0.0 HỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH<br>TÀI CHÍNH CÁ NHÂN BẰNG AI (AI-FDSS)"]

    %% 1.0 Thu chi
    ROOT --> M1["1.0 Quản lý Thu Chi & Dòng tiền"]
    M1 --> M11["1.1 Quản lý Ví & Tài khoản"]
    M1 --> M12["1.2 Quản lý Danh mục Thu/Chi"]
    M1 --> M13["1.3 Ghi nhận Giao dịch (Thu/Chi/Chuyển ví)"]
    M1 --> M14["1.4 Cấu hình Giao dịch Định kỳ tự động"]

    %% 2.0 Ngan sach
    ROOT --> M2["2.0 Quản lý Ngân sách & Tiết kiệm"]
    M2 --> M21["2.1 Lập Ngân sách theo Kỳ & Danh mục"]
    M2 --> M22["2.2 Theo dõi & Cảnh báo Tỷ lệ dùng Ngân sách"]
    M2 --> M23["2.3 Thiết lập & Theo dõi Tiến độ Tiết kiệm"]

    %% 3.0 Cong no
    ROOT --> M3["3.0 Quản lý Công nợ & Thanh toán"]
    M3 --> M31["3.1 Quản lý Khoản Phải thu & Phải trả"]
    M3 --> M32["3.2 Ghi nhận Lịch sử Thanh toán từng đợt"]
    M3 --> M33["3.3 Theo dõi & Cảnh báo Nợ quá hạn"]

    %% 4.0 Bao cao
    ROOT --> M4["4.0 Báo cáo Thống kê & Trực quan"]
    M4 --> M41["4.1 Dashboard Tổng quan Thu Chi & Dòng tiền"]
    M4 --> M42["4.2 Biểu đồ Phân bổ Chi tiêu theo Danh mục"]
    M4 --> M43["4.3 Xuất Báo cáo CSV / Excel"]

    %% 5.0 AI DSS
    ROOT --> M5["5.0 Hỗ trợ Ra quyết định bằng AI (Trọng tâm)"]
    M5 --> M51["5.1 Đánh giá Sức khỏe Tài chính & Khẩu vị Rủi ro"]
    M5 --> M52["5.2 Phát hiện Chi tiêu Bất thường (Anomaly)"]
    M5 --> M53["5.3 Dự báo Dòng tiền & Số dư Tương lai"]
    M5 --> M54["5.4 Mô phỏng Kịch bản Giả định (What-If)"]
    M5 --> M55["5.5 Sinh Khuyến nghị Quyết định & Thực thi 1-Click"]
    M5 --> M56["5.6 Trợ lý Tư vấn Tài chính Ngôn ngữ Tự nhiên"]

    %% 6.0 Cau hinh
    ROOT --> M6["6.0 Quản trị & Cấu hình Hệ thống"]
    M6 --> M61["6.1 Cấu hình AI Provider & API Key (Gemini)"]
    M6 --> M62["6.2 Sao lưu & Phục hồi MySQL Database"]
    M6 --> M63["6.3 Kiểm tra Kết nối Cơ sở Dữ liệu"]

    classDef rootStyle fill:#1e3a8a,stroke:#1e3a8a,color:#ffffff,font-weight:bold,font-size:14px;
    classDef moduleStyle fill:#2563eb,stroke:#1d4ed8,color:#ffffff,font-weight:bold;
    classDef funcStyle fill:#f8fafc,stroke:#cbd5e1,color:#0f172a;
    classDef aiStyle fill:#7c3aed,stroke:#6d28d9,color:#ffffff,font-weight:bold;

    class ROOT rootStyle;
    class M1,M2,M3,M4,M6 moduleStyle;
    class M5 aiStyle;
    class M11,M12,M13,M14,M21,M22,M23,M31,M32,M33,M41,M42,M43,M51,M52,M53,M54,M55,M56,M61,M62,M63 funcStyle;
`;

// 2. Dạng 6 cột dọc xếp thẳng đứng dưới mỗi module
const bfdColumnTD = `graph TD
    ROOT["0.0 HỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH TÀI CHÍNH CÁ NHÂN BẰNG AI (AI-FDSS)"]

    ROOT --> M1["1.0 Thu Chi & Dòng tiền"]
    ROOT --> M2["2.0 Ngân sách & Tiết kiệm"]
    ROOT --> M3["3.0 Công nợ & Thanh toán"]
    ROOT --> M4["4.0 Báo cáo Thống kê"]
    ROOT --> M5["5.0 Hỗ trợ Ra Quyết định AI"]
    ROOT --> M6["6.0 Quản trị Hệ thống"]

    %% Nhánh 1 dọc
    M1 --- M11["1.1 Quản lý Ví"]
    M11 --- M12["1.2 Danh mục Thu/Chi"]
    M12 --- M13["1.3 Ghi nhận Giao dịch"]
    M13 --- M14["1.4 Giao dịch Định kỳ"]

    %% Nhánh 2 dọc
    M2 --- M21["2.1 Lập Ngân sách"]
    M21 --- M22["2.2 Tỷ lệ dùng Ngân sách"]
    M22 --- M23["2.3 Tiến độ Tiết kiệm"]

    %% Nhánh 3 dọc
    M3 --- M31["3.1 Phải thu & Phải trả"]
    M31 --- M32["3.2 Thanh toán từng đợt"]
    M32 --- M33["3.3 Cảnh báo Nợ quá hạn"]

    %% Nhánh 4 dọc
    M4 --- M41["4.1 Dashboard Dòng tiền"]
    M41 --- M42["4.2 Biểu đồ Cơ cấu Chi"]
    M42 --- M43["4.3 Xuất Báo cáo CSV"]

    %% Nhánh 5 dọc (AI)
    M5 --- M51["5.1 Đánh giá Sức khỏe"]
    M51 --- M52["5.2 Phát hiện Bất thường"]
    M52 --- M53["5.3 Dự báo Dòng tiền"]
    M53 --- M54["5.4 Mô phỏng What-If"]
    M54 --- M55["5.5 Khuyến nghị Quyết định"]
    M55 --- M56["5.6 Trợ lý Tư vấn AI"]

    %% Nhánh 6 dọc
    M6 --- M61["6.1 Cấu hình AI Key"]
    M61 --- M62["6.2 Sao lưu & Phục hồi"]
    M62 --- M63["6.3 Kiểm tra Kết nối DB"]

    classDef rootStyle fill:#1e3a8a,stroke:#1e3a8a,color:#ffffff,font-weight:bold;
    classDef moduleStyle fill:#2563eb,stroke:#1d4ed8,color:#ffffff,font-weight:bold;
    classDef aiStyle fill:#7c3aed,stroke:#6d28d9,color:#ffffff,font-weight:bold;
    classDef funcStyle fill:#f8fafc,stroke:#cbd5e1,color:#0f172a;

    class ROOT rootStyle;
    class M1,M2,M3,M4,M6 moduleStyle;
    class M5 aiStyle;
    class M11,M12,M13,M14,M21,M22,M23,M31,M32,M33,M41,M42,M43,M51,M52,M53,M54,M55,M56,M61,M62,M63 funcStyle;
`;

async function downloadAndSave(name, code) {
  console.log(`\n⏳ Đang xuất ảnh cho layout: [${name}]...`);
  
  // Tải PNG
  const resPng = await fetch('https://kroki.io/mermaid/png', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    body: code
  });
  if (resPng.ok) {
    const pngBuf = Buffer.from(await resPng.arrayBuffer());
    fs.writeFileSync(path.join(outputDir, `${name}.png`), pngBuf);
    fs.writeFileSync(path.join(desktopDir, `${name}.png`), pngBuf);
    console.log(`  ✅ Đã lưu PNG vào Desktop & docs/diagrams/${name}.png`);
  }

  // Tải SVG
  const resSvg = await fetch('https://kroki.io/mermaid/svg', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    body: code
  });
  if (resSvg.ok) {
    const svgText = await resSvg.text();
    fs.writeFileSync(path.join(outputDir, `${name}.svg`), svgText, 'utf-8');
    fs.writeFileSync(path.join(desktopDir, `${name}.svg`), svgText, 'utf-8');
    console.log(`  ✅ Đã lưu SVG vào Desktop & docs/diagrams/${name}.svg`);
  }
}

async function run() {
  await downloadAndSave('01_BFD_dang_cay_doc_A4', bfdTreeLR);
  await downloadAndSave('01_BFD_cac_chuc_nang_xep_doc_theo_cot', bfdColumnTD);
  console.log('\n🎉 ĐÃ CẬP NHẬT XONG CẢ 2 BẢN BFD GỌN GÀNG RA DESKTOP!');
}

run();

