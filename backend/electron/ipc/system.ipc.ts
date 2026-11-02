import { dialog, ipcMain } from 'electron';
import { testConnection } from '../database/connection';
import { BackupService } from '../services/backup.service';

export function registerSystemIpc(): void {
  const backupService = new BackupService();

  ipcMain.handle('system:testDb', async () => {
    return await testConnection();
  });

  ipcMain.handle('system:chooseBackupFolder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Chọn thư mục lưu bản sao lưu',
      properties: ['openDirectory', 'createDirectory'],
    });
    if (canceled || filePaths.length === 0) return { success: false, canceled: true };
    return { success: true, data: { folderPath: filePaths[0] } };
  });

  ipcMain.handle('system:backupDb', async (_, targetFolder?: string) => {
    try {
      const result = await backupService.backupDatabase(targetFolder);
      return { success: true, data: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('system:restoreDb', async (_, filePath?: string) => {
    try {
      const result = await backupService.restoreDatabase(filePath);
      return result;
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('system:exportData', async () => {
    try {
      const result = await backupService.exportTransactionsCsv();
      return { success: true, data: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });
}
