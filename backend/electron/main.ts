import { app, BrowserWindow } from 'electron';
import path from 'path';
import { closePool, testConnection } from './database/connection';
import { registerCategoryIpc } from './ipc/category.ipc';
import { registerWalletIpc } from './ipc/wallet.ipc';
import { registerTransactionIpc } from './ipc/transaction.ipc';
import { registerDebtIpc } from './ipc/debt.ipc';
import { registerBudgetIpc } from './ipc/budget.ipc';
import { registerSavingIpc } from './ipc/saving.ipc';
import { registerRecurringIpc } from './ipc/recurring.ipc';
import { registerReportIpc } from './ipc/report.ipc';
import { registerSystemIpc } from './ipc/system.ipc';
import { RecurringService } from './services/recurring.service';

app.setName('Personal Finance');

const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 840,
    minWidth: 1080,
    minHeight: 700,
    title: 'Personal Finance - Quản lý tài chính cá nhân',
    icon: path.join(__dirname, '../../build/icon.ico'),
    backgroundColor: '#F5F7FA',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Register all IPC modules
function registerAllIpc() {
  registerCategoryIpc();
  registerWalletIpc();
  registerTransactionIpc();
  registerDebtIpc();
  registerBudgetIpc();
  registerSavingIpc();
  registerRecurringIpc();
  registerReportIpc();
  registerSystemIpc();
}

app.whenReady().then(async () => {
  // Test connection on boot
  const connTest = await testConnection();
  if (connTest.success) {
    console.log('SQLite database initialized successfully.');
    // Process due recurring transactions on startup
    try {
      const recurringService = new RecurringService();
      const count = await recurringService.processDue();
      if (count > 0) {
        console.log(`Processed ${count} due recurring transactions.`);
      }
    } catch (e) {
      console.error('Error processing recurring transactions on startup:', e);
    }
  } else {
    console.error('SQLite database warning:', connTest.message);
  }

  registerAllIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  await closePool();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
