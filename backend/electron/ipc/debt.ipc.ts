import { ipcMain } from 'electron';
import { DebtService } from '../services/debt.service';

export function registerDebtIpc(): void {
  const service = new DebtService();

  ipcMain.handle('debts:list', async (_, filters) => {
    try {
      const data = await service.list(filters);
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('debts:getById', async (_, id: number) => {
    try {
      const data = await service.getById(id);
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('debts:create', async (_, data) => {
    try {
      const result = await service.create(data);
      return { success: true, data: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('debts:update', async (_, id: number, data) => {
    try {
      const result = await service.update(id, data);
      return { success: true, data: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('debts:delete', async (_, id: number) => {
    try {
      await service.delete(id);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('debts:pay', async (_, debtId: number, data) => {
    try {
      const result = await service.pay(debtId, data);
      return { success: true, data: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('debts:getPayments', async (_, debtId: number) => {
    try {
      const data = await service.getPayments(debtId);
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('debts:getSummary', async () => {
    try {
      const data = await service.getSummary();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });
}
