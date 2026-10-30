const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  try {
    const desktopDir = 'C:\\Users\\phamv\\OneDrive\\Desktop\\SO_DO_DO_AN_AI_FINANCE';
    const diagramsDir = path.resolve(__dirname, '../docs/diagrams');
    const svgPath = path.join(desktopDir, '01_BFD_chuan_giao_trinh_tree_branch.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    const base64Svg = Buffer.from(svgContent, 'utf-8').toString('base64');

    const win = new BrowserWindow({
      width: 1720,
      height: 650,
      show: false,
      frame: false,
      webPreferences: {
        offscreen: true
      }
    });

    await win.loadURL(`data:image/svg+xml;base64,${base64Svg}`);
    // Wait a brief moment for layout/fonts
    await new Promise((r) => setTimeout(r, 800));

    const image = await win.webContents.capturePage({
      x: 0,
      y: 0,
      width: 1680,
      height: 620
    });

    const pngBuffer = image.toPNG();
    const pngPath1 = path.join(desktopDir, '01_BFD_chuan_giao_trinh_tree_branch.png');
    const pngPath2 = path.join(diagramsDir, '01_BFD_chuan_giao_trinh_tree_branch.png');

    fs.writeFileSync(pngPath1, pngBuffer);
    fs.writeFileSync(pngPath2, pngBuffer);
    console.log('✅ CHUYỂN SVG SANG PNG THÀNH CÔNG RỰC RỠ BẰNG CHROMIUM!');
    console.log('   File PNG: ' + pngPath1);
  } catch (err) {
    console.error('Lỗi render:', err);
  } finally {
    app.quit();
  }
});
