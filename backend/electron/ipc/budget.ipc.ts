import { ipcMain } from 'electron';
import { BudgetService } from '../services/budget.service';

export function registerBudgetIpc(): void {
  const service = new BudgetService();

  ipcMain.handle('budgets:list', async () => {
    try {
      const data = await service.list();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('budgets:getById', async (_, id: number) => {
    try {
      const data = await service.getById(id);
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('budgets:create', async (_, data) => {
    try {
      const result = await service.create(data);
      return { success: true, data: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('budgets:update', async (_, id: number, data) => {
    try {
      const result = await service.update(id, data);
      return { success: true, data: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('budgets:delete', async (_, id: number) => {
    try {
      await service.delete(id);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('budgets:getUsage', async (_, id: number) => {
    try {
      const data = await service.getUsage(id);
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('budgets:getActive', async () => {
    try {
      const data = await service.getActiveWithUsage();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });
}
