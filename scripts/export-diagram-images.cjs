const fs = require('node:fs');
const path = require('node:path');

const outputDir = path.resolve(__dirname, '../docs/diagrams');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const diagrams = [
  {
    name: '01_so_do_phan_ra_chuc_nang_BFD',
    title: 'Sơ đồ Phân rã Chức năng (BFD - Business Function Diagram)',
    code: `graph TD
    ROOT["0.0 HỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH TÀI CHÍNH CÁ NHÂN BẰNG AI (AI-FDSS)"]

    F1["1.0 Quản lý Thu Chi & Dòng tiền"]
    F2["2.0 Quản lý Ngân sách & Tiết kiệm"]
    F3["3.0 Quản lý Công nợ & Thanh toán"]
    F4["4.0 Báo cáo Thống kê & Trực quan hóa"]
    F5["5.0 Hỗ trợ Ra quyết định bằng AI (Trọng tâm)"]
    F6["6.0 Quản trị & Cấu hình Hệ thống"]

    ROOT --> F1
    ROOT --> F2
    ROOT --> F3
    ROOT --> F4
    ROOT --> F5
    ROOT --> F6

    F1 --> F11["1.1 Quản lý Ví & Tài khoản"]
    F1 --> F12["1.2 Quản lý Danh mục Thu/Chi"]
    F1 --> F13["1.3 Ghi nhận Giao dịch (Thu/Chi/Chuyển ví)"]
    F1 --> F14["1.4 Cấu hình Giao dịch Định kỳ tự động"]

    F2 --> F21["2.1 Lập Ngân sách theo Kỳ & Danh mục"]
    F2 --> F22["2.2 Theo dõi Tỷ lệ sử dụng Ngân sách"]
    F2 --> F23["2.3 Thiết lập & Theo dõi Mục tiêu Tiết kiệm"]

    F3 --> F31["3.1 Quản lý Khoản Phải thu / Phải trả"]
    F3 --> F32["3.2 Ghi nhận Thanh toán từng đợt"]
    F3 --> F33["3.3 Theo dõi & Cảnh báo Nợ quá hạn"]

    F4 --> F41["4.1 Dashboard Tổng quan Số dư & Dòng tiền"]
    F4 --> F42["4.2 Biểu đồ Cơ cấu Chi tiêu theo Danh mục"]
    F4 --> F43["4.3 Xuất Báo cáo CSV / Excel"]

    F5 --> F51["5.1 Đánh giá Sức khỏe Tài chính & Khẩu vị Rủi ro"]
    F5 --> F52["5.2 Phát hiện Chi tiêu Bất thường (Anomaly)"]
    F5 --> F53["5.3 Dự báo Dòng tiền & Số dư Tương lai"]
    F5 --> F54["5.4 Mô phỏng Kịch bản Giả định (What-If)"]
    F5 --> F55["5.5 Sinh Khuyến nghị Quyết định & Tự động Thực thi"]
    F5 --> F56["5.6 Trợ lý Tư vấn Tài chính Ngôn ngữ Tự nhiên"]

    F6 --> F61["6.1 Cấu hình AI Provider & API Key"]
    F6 --> F62["6.2 Sao lưu & Phục hồi Database"]
    F6 --> F63["6.3 Kiểm tra Kết nối Cơ sở Dữ liệu"]`
  },
  {
    name: '02_so_do_quan_he_thuc_the_ERD',
    title: 'Sơ đồ Quan hệ Thực thể Vật lý (Physical ERD - 17 Bảng)',
    code: `erDiagram
    WALLETS ||--o{ TRANSACTIONS : "thuc hien"
    CATEGORIES ||--o{ TRANSACTIONS : "phan loai"
    WALLETS ||--o{ RECURRING_TRANSACTIONS : "nguon tien"
    CATEGORIES ||--o{ RECURRING_TRANSACTIONS : "phan loai"
    BUDGETS ||--|{ BUDGET_CATEGORIES : "gom cac muc"
    CATEGORIES ||--|{ BUDGET_CATEGORIES : "ap dung cho"
    DEBTS ||--o{ DEBT_PAYMENTS : "duoc tra boi"
    WALLETS ||--o{ DEBT_PAYMENTS : "chi/nhan tien"
    TRANSACTIONS ||--o{ AI_ANOMALIES : "bi canh bao"
    CATEGORIES ||--o{ AI_ANOMALIES : "danh muc bat thuong"
    AI_CHAT_SESSIONS ||--|{ AI_CHAT_MESSAGES : "chua tin nhan"

    WALLETS {
        int id PK
        varchar name
        decimal initial_balance
        decimal current_balance
        tinyint is_active
    }
    CATEGORIES {
        int id PK
        varchar name
        enum type
        tinyint is_active
    }
    TRANSACTIONS {
        bigint id PK
        int wallet_id FK
        int category_id FK
        enum type
        decimal amount
        datetime transaction_date
        bigint transfer_id
    }
    BUDGETS {
        int id PK
        varchar name
        decimal amount
        date start_date
        date end_date
    }
    BUDGET_CATEGORIES {
        int budget_id PK_FK
        int category_id PK_FK
    }
    DEBTS {
        bigint id PK
        enum type
        varchar person_name
        decimal original_amount
        decimal remaining_amount
        date due_date
        enum status
    }
    DEBT_PAYMENTS {
        bigint id PK
        bigint debt_id FK
        int wallet_id FK
        decimal amount
        datetime payment_date
    }
    SAVING_GOALS {
        int id PK
        varchar name
        decimal target_amount
        decimal current_amount
        date target_date
        enum status
    }
    RECURRING_TRANSACTIONS {
        int id PK
        int wallet_id FK
        int category_id FK
        enum type
        decimal amount
        enum frequency
        date next_date
    }
    AI_USER_PROFILES {
        int id PK
        enum risk_tolerance
        decimal monthly_baseline_income
        int emergency_fund_target_months
        decimal financial_health_score
    }
    AI_RECOMMENDATIONS {
        bigint id PK
        enum type
        varchar title
        text summary
        decimal potential_savings
        json action_payload
        enum status
        decimal confidence_score
    }
    AI_CASHFLOW_FORECASTS {
        bigint id PK
        varchar forecast_period
        decimal predicted_income
        decimal predicted_expense
        decimal predicted_ending_balance
    }
    AI_SCENARIOS {
        int id PK
        varchar name
        enum scenario_type
        json parameters
        json simulation_result
    }
    AI_ANOMALIES {
        bigint id PK
        bigint transaction_id FK
        int category_id FK
        enum severity
        varchar anomaly_type
    }
    AI_CHAT_SESSIONS {
        bigint id PK
        varchar title
        text context_summary
    }
    AI_CHAT_MESSAGES {
        bigint id PK
        bigint session_id FK
        enum role
        mediumtext content
        int tokens_used
    }
    AI_CONFIGS {
        int id PK
        varchar provider
        varchar api_key
        varchar model_name
        decimal temperature
        tinyint is_active
    }`
  },
  {
    name: '03_luong_quyet_dinh_khep_kin_Logic_ERD',
    title: 'Sơ đồ Quan hệ Logic & Luồng Ra quyết định (Closed Loop)',
    code: `flowchart TD
    subgraph CoreFinancial ["PHÂN HỆ QUẢN LÝ DỮ LIỆU TÀI CHÍNH"]
        W["wallets: Số dư ví"] --> T["transactions: Lịch sử thu/chi"]
        C["categories: Danh mục"] --> T
        D["debts: Khoản nợ"] --> DP["debt_payments: Tiến độ trả"]
        B["budgets: Hạn mức"] <--> BC["budget_categories"] <--> C
        SG["saving_goals: Tiến độ tiết kiệm"]
    end

    subgraph AIDSS ["PHÂN HỆ HỖ TRỢ RA QUYẾT ĐỊNH (AI-DSS)"]
        P["ai_user_profiles: Khẩu vị rủi ro & Điểm sức khỏe"]
        CFG["ai_configs: Gemini API Key & Parameters"]
        ANOMALY["ai_anomalies: Phát hiện chi tiêu bất thường"]
        FORECAST["ai_cashflow_forecasts: Dự báo dòng tiền"]
        SCENARIO["ai_scenarios: Kịch bản What-If"]
        REC["ai_recommendations: Khuyến nghị hành động"]
        CHAT["ai_chat_sessions & messages: Trợ lý tư vấn RAG"]
    end

    T -->|Giao dịch vượt ngưỡng| ANOMALY
    T -->|Dữ liệu chuỗi thời gian| FORECAST
    W & D & SG -->|Đánh giá sức khỏe| P

    P & ANOMALY & FORECAST -->|Prompt ngữ cảnh| REC
    SCENARIO -->|Kiểm tra tính khả thi| REC
    CFG -->|Cung cấp API Key| REC
    CFG -->|Cung cấp API Key| CHAT

    REC ==>|Duyệt: Giảm hạn mức| B
    REC ==>|Duyệt: Lịch trả nợ tối ưu| D
    REC ==>|Duyệt: Tăng tích lũy| SG`
  }
];

async function exportDiagram(item) {
  console.log(`\n⏳ Đang xuất ảnh cho: ${item.title}...`);

  // 1. Tải SVG
  try {
    const resSvg = await fetch('https://kroki.io/mermaid/svg', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: item.code
    });
    if (resSvg.ok) {
      const svgText = await resSvg.text();
      const svgPath = path.join(outputDir, `${item.name}.svg`);
      fs.writeFileSync(svgPath, svgText, 'utf-8');
      console.log(`  ✅ Đã lưu SVG: docs/diagrams/${item.name}.svg`);
    } else {
      console.log(`  ❌ Lỗi tải SVG (${resSvg.status}): ${await resSvg.text()}`);
    }
  } catch (err) {
    console.error(`  ❌ Lỗi kết nối SVG: ${err.message}`);
  }

  // 2. Tải PNG
  try {
    const resPng = await fetch('https://kroki.io/mermaid/png', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: item.code
    });
    if (resPng.ok) {
      const pngBuffer = Buffer.from(await resPng.arrayBuffer());
      const pngPath = path.join(outputDir, `${item.name}.png`);
      fs.writeFileSync(pngPath, pngBuffer);
      console.log(`  ✅ Đã lưu PNG: docs/diagrams/${item.name}.png`);
    } else {
      console.log(`  ❌ Lỗi tải PNG (${resPng.status}): ${await resPng.text()}`);
    }
  } catch (err) {
    console.error(`  ❌ Lỗi kết nối PNG: ${err.message}`);
  }
}

async function main() {
  console.log('==================================================');
  console.log(' XUẤT HÌNH ẢNH SƠ ĐỒ BFD & ERD CHO DỰ ÁN');
  console.log('==================================================');

  for (const item of diagrams) {
    await exportDiagram(item);
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Bộ Sơ Đồ Kiến Trúc BFD & ERD - Đề Tài AI-FDSS</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background: #f1f5f9; color: #0f172a; margin: 0; padding: 40px 20px; }
    .container { max-width: 1300px; margin: 0 auto; }
    header { text-align: center; margin-bottom: 40px; }
    h1 { color: #1e3a8a; margin: 0 0 10px 0; font-size: 28px; }
    .subtitle { color: #64748b; font-size: 16px; font-weight: 500; }
    .card { background: white; border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); padding: 28px; margin-bottom: 36px; border: 1px solid #e2e8f0; }
    .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .card-title { font-size: 20px; font-weight: 700; color: #1e293b; margin: 0; }
    .actions { display: flex; gap: 10px; }
    .btn { display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; transition: 0.2s; }
    .btn-png { background: #2563eb; color: white; }
    .btn-png:hover { background: #1d4ed8; }
    .btn-svg { background: #059669; color: white; }
    .btn-svg:hover { background: #047857; }
    .img-box { text-align: center; overflow-x: auto; padding: 20px; background: #fafafa; border-radius: 10px; border: 1px solid #f1f5f9; }
    .img-box img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>BỘ SƠ ĐỒ THIẾT KẾ HỆ THỐNG (BFD & ERD)</h1>
      <div class="subtitle">Đề tài: Hệ thống hỗ trợ ra quyết định tài chính cá nhân bằng AI (AI-FDSS)</div>
    </header>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">1. Sơ đồ Phân rã Chức năng (BFD - Business Function Diagram)</h2>
        <div class="actions">
          <a class="btn btn-png" href="01_so_do_phan_ra_chuc_nang_BFD.png" download>💾 Tải ảnh PNG</a>
          <a class="btn btn-svg" href="01_so_do_phan_ra_chuc_nang_BFD.svg" download>📐 Tải file SVG</a>
        </div>
      </div>
      <div class="img-box">
        <img src="01_so_do_phan_ra_chuc_nang_BFD.png" alt="Sơ đồ BFD">
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">2. Sơ đồ Quan hệ Thực thể Vật lý (Physical ERD - 17 Bảng)</h2>
        <div class="actions">
          <a class="btn btn-png" href="02_so_do_quan_he_thuc_the_ERD.png" download>💾 Tải ảnh PNG</a>
          <a class="btn btn-svg" href="02_so_do_quan_he_thuc_the_ERD.svg" download>📐 Tải file SVG</a>
        </div>
      </div>
      <div class="img-box">
        <img src="02_so_do_quan_he_thuc_the_ERD.png" alt="Sơ đồ Physical ERD">
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">3. Sơ đồ Quan hệ Logic & Luồng Ra quyết định (Closed Decision Loop)</h2>
        <div class="actions">
          <a class="btn btn-png" href="03_luong_quyet_dinh_khep_kin_Logic_ERD.png" download>💾 Tải ảnh PNG</a>
          <a class="btn btn-svg" href="03_luong_quyet_dinh_khep_kin_Logic_ERD.svg" download>📐 Tải file SVG</a>
        </div>
      </div>
      <div class="img-box">
        <img src="03_luong_quyet_dinh_khep_kin_Logic_ERD.png" alt="Sơ đồ Luồng ra quyết định">
      </div>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, 'xem_va_tai_anh_so_do.html'), htmlContent, 'utf-8');
  console.log(`\n🎉 ĐÃ XUẤT XONG TẤT CẢ!`);
  console.log(`📁 Thư mục lưu ảnh: ${outputDir}`);
}

main();
