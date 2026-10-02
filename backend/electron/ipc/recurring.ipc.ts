import { ipcMain } from 'electron';
import { RecurringService } from '../services/recurring.service';

export function registerRecurringIpc(): void {
  const service = new RecurringService();

  ipcMain.handle('recurring:list', async () => {
    try {
      const data = await service.list();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('recurring:create', async (_, data) => {
    try {
      const result = await service.create(data);
      return { success: true, data: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('recurring:update', async (_, id: number, data) => {
    try {
      const result = await service.update(id, data);
      return { success: true, data: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('recurring:delete', async (_, id: number) => {
    try {
      await service.delete(id);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('recurring:processDue', async () => {
    try {
      const count = await service.processDue();
      return { success: true, data: count };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });
}
