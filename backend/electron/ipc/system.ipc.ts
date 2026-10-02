import { ipcMain } from 'electron';
import { testConnection } from '../database/connection';
import { BackupService } from '../services/backup.service';

export function registerSystemIpc(): void {
  const backupService = new BackupService();

  ipcMain.handle('system:testDb', async () => {
    return await testConnection();
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
