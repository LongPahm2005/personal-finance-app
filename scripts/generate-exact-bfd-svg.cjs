const fs = require('node:fs');
const path = require('node:path');

const desktopDir = 'C:\\Users\\phamv\\OneDrive\\Desktop\\SO_DO_DO_AN_AI_FINANCE';
const diagramsDir = path.resolve(__dirname, '../docs/diagrams');

const modules = [
  {
    id: 1,
    title: '1. Quản lý thu chi và dòng tiền',
    subs: [
      '1.1. Quản lý ví và tài khoản',
      '1.2. Quản lý danh mục thu chi',
      '1.3. Ghi nhận giao dịch thu chi',
      '1.4. Cấu hình giao dịch định kỳ'
    ]
  },
  {
    id: 2,
    title: '2. Quản lý ngân sách và tiết kiệm',
    subs: [
      '2.1. Lập ngân sách theo kỳ',
      '2.2. Theo dõi tỷ lệ dùng ngân sách',
      '2.3. Quản lý mục tiêu tiết kiệm'
    ]
  },
  {
    id: 3,
    title: '3. Quản lý công nợ và thanh toán',
    subs: [
      '3.1. Quản lý khoản phải thu/trả',
      '3.2. Ghi nhận thanh toán từng đợt',
      '3.3. Theo dõi và cảnh báo nợ quá hạn'
    ]
  },
  {
    id: 4,
    title: '4. Báo cáo thống kê & trực quan',
    subs: [
      '4.1. Dashboard tổng quan số dư',
      '4.2. Biểu đồ cơ cấu chi tiêu',
      '4.3. Xuất báo cáo CSV và Excel'
    ]
  },
  {
    id: 5,
    title: '5. Hỗ trợ ra quyết định bằng AI',
    isAi: true,
    subs: [
      '5.1. Đánh giá sức khỏe & rủi ro',
      '5.2. Phát hiện chi tiêu bất thường',
      '5.3. Dự báo dòng tiền tương lai',
      '5.4. Mô phỏng kịch bản What-If',
      '5.5. Khuyến nghị quyết định (1-Click)',
      '5.6. Trợ lý tư vấn tài chính thông minh'
    ]
  },
  {
    id: 6,
    title: '6. Quản trị & cấu hình hệ thống',
    subs: [
      '6.1. Cấu hình Gemini API Key',
      '6.2. Sao lưu và phục hồi database',
      '6.3. Kiểm tra kết nối MySQL'
    ]
  }
];

function generateSvg() {
  const svgWidth = 1680;
  const svgHeight = 620;

  const colWidth = 245;
  const colGap = 28;
  const startX = (svgWidth - (6 * colWidth + 5 * colGap)) / 2;

  const rootW = 480;
  const rootH = 46;
  const rootX = (svgWidth - rootW) / 2;
  const rootY = 30;

  const busY = 110;
  const modY = 135;
  const modH = 48;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">
  <defs>
    <style>
      .bg { fill: #ffffff; }
      .line { stroke: #333333; stroke-width: 1.5; fill: none; stroke-linecap: round; stroke-linejoin: round; }
      .root-box { fill: #ffffff; stroke: #1e293b; stroke-width: 2; rx: 6; }
      .root-text { font-family: "Segoe UI", Arial, sans-serif; font-size: 15px; font-weight: bold; fill: #0f172a; text-anchor: middle; dominant-baseline: central; }
      .mod-box { fill: #ffffff; stroke: #334155; stroke-width: 1.5; rx: 5; }
      .mod-box-ai { fill: #f5f3ff; stroke: #6d28d9; stroke-width: 1.8; rx: 5; }
      .mod-text { font-family: "Segoe UI", Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #1e293b; text-anchor: middle; dominant-baseline: central; }
      .mod-text-ai { font-family: "Segoe UI", Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #5b21b6; text-anchor: middle; dominant-baseline: central; }
      .sub-box { fill: #ffffff; stroke: #64748b; stroke-width: 1.2; rx: 4; }
      .sub-box-ai { fill: #faf5ff; stroke: #8b5cf6; stroke-width: 1.2; rx: 4; }
      .sub-text { font-family: "Segoe UI", Arial, sans-serif; font-size: 12px; fill: #334155; text-anchor: middle; dominant-baseline: central; }
      .sub-text-ai { font-family: "Segoe UI", Arial, sans-serif; font-size: 12px; font-weight: 500; fill: #4c1d95; text-anchor: middle; dominant-baseline: central; }
    </style>
  </defs>

  <!-- Background -->
  <rect width="${svgWidth}" height="${svgHeight}" class="bg"/>

  <!-- ROOT BOX -->
  <rect x="${rootX}" y="${rootY}" width="${rootW}" height="${rootH}" class="root-box"/>
  <text x="${svgWidth / 2}" y="${rootY + rootH / 2}" class="root-text">HỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH TÀI CHÍNH CÁ NHÂN (AI-FDSS)</text>

  <!-- LINE FROM ROOT TO BUS -->
  <line x1="${svgWidth / 2}" y1="${rootY + rootH}" x2="${svgWidth / 2}" y2="${busY}" class="line"/>

  <!-- HORIZONTAL BUS BAR -->
  <line x1="${startX + colWidth / 2}" y1="${busY}" x2="${startX + 5 * (colWidth + colGap) + colWidth / 2}" y2="${busY}" class="line"/>
`;

  // Draw each module column
  modules.forEach((mod, idx) => {
    const colX = startX + idx * (colWidth + colGap);
    const centerX = colX + colWidth / 2;

    // Drop line from bus bar to module box
    svg += `  <line x1="${centerX}" y1="${busY}" x2="${centerX}" y2="${modY}" class="line"/>\n`;

    // Module box
    const modBoxClass = mod.isAi ? 'mod-box-ai' : 'mod-box';
    const modTextClass = mod.isAi ? 'mod-text-ai' : 'mod-text';
    svg += `  <rect x="${colX}" y="${modY}" width="${colWidth}" height="${modH}" class="${modBoxClass}"/>\n`;
    svg += `  <text x="${centerX}" y="${modY + modH / 2}" class="${modTextClass}">${mod.title}</text>\n`;

    // Vertical trunk line on the left side
    const trunkX = colX + 16;
    const firstSubY = modY + modH + 18;
    const subH = 38;
    const subGap = 12;
    const lastSubY = firstSubY + (mod.subs.length - 1) * (subH + subGap);

    svg += `  <!-- Trunk line for Module ${mod.id} -->\n`;
    svg += `  <line x1="${trunkX}" y1="${modY + modH}" x2="${trunkX}" y2="${lastSubY + subH / 2}" class="line"/>\n`;

    // Sub items with horizontal branches
    mod.subs.forEach((subTitle, subIdx) => {
      const subY = firstSubY + subIdx * (subH + subGap);
      const subBoxX = trunkX + 14;
      const subBoxW = colWidth - 30;

      // Branch line from trunk to sub box
      svg += `  <line x1="${trunkX}" y1="${subY + subH / 2}" x2="${subBoxX}" y2="${subY + subH / 2}" class="line"/>\n`;

      // Sub box
      const subBoxClass = mod.isAi ? 'sub-box-ai' : 'sub-box';
      const subTextClass = mod.isAi ? 'sub-text-ai' : 'sub-text';
      svg += `  <rect x="${subBoxX}" y="${subY}" width="${subBoxW}" height="${subH}" class="${subBoxClass}"/>\n`;
      svg += `  <text x="${subBoxX + subBoxW / 2}" y="${subY + subH / 2}" class="${subTextClass}">${subTitle}</text>\n`;
    });
  });

  svg += `</svg>`;
  return svg;
}

const svgContent = generateSvg();

// Ghi file SVG vào Desktop và docs/diagrams
const svgPath1 = path.join(desktopDir, '01_BFD_chuan_giao_trinh_tree_branch.svg');
const svgPath2 = path.join(diagramsDir, '01_BFD_chuan_giao_trinh_tree_branch.svg');

fs.writeFileSync(svgPath1, svgContent, 'utf-8');
fs.writeFileSync(svgPath2, svgContent, 'utf-8');
console.log('✅ Đã tạo file SVG chuẩn cấu trúc mẫu:');
console.log('   ' + svgPath1);

// Chuyển sang PNG bằng Kroki
async function convertSvgToPng() {
  try {
    const res = await fetch('https://kroki.io/svg/png', {
      method: 'POST',
      headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
      body: svgContent
    });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      const pngPath1 = path.join(desktopDir, '01_BFD_chuan_giao_trinh_tree_branch.png');
      const pngPath2 = path.join(diagramsDir, '01_BFD_chuan_giao_trinh_tree_branch.png');
      fs.writeFileSync(pngPath1, buf);
      fs.writeFileSync(pngPath2, buf);
      console.log('✅ Đã tạo file PNG sắc nét chuẩn 100% mẫu:');
      console.log('   ' + pngPath1);
    } else {
      console.log('Lỗi Kroki:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Lỗi chuyển PNG:', err.message);
  }
}

convertSvgToPng();
