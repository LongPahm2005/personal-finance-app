import { ipcMain } from 'electron';
import { TransactionService } from '../services/transaction.service';

export function registerTransactionIpc(): void {
  const service = new TransactionService();

  ipcMain.handle('transactions:list', async (_, filters) => {
    try {
      const data = await service.list(filters);
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('transactions:getById', async (_, id: number) => {
    try {
      const data = await service.getById(id);
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('transactions:create', async (_, data) => {
    try {
      const result = await service.create(data);
      return { success: true, data: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('transactions:createTransfer', async (_, data) => {
    try {
      const result = await service.createTransfer(data);
      return { success: true, data: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('transactions:update', async (_, id: number, data) => {
    try {
      const result = await service.update(id, data);
      return { success: true, data: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('transactions:delete', async (_, id: number) => {
    try {
      await service.delete(id);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('transactions:getRecent', async (_, limit?: number) => {
    try {
      const data = await service.getRecent(limit);
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('transactions:getMonthly', async (_, year: number, month: number) => {
    try {
      const data = await service.getMonthlySummary(year, month);
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });
}
