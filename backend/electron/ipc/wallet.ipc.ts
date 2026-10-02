import { ipcMain } from 'electron';
import { WalletService } from '../services/wallet.service';

export function registerWalletIpc(): void {
  const service = new WalletService();

  ipcMain.handle('wallets:list', async () => {
    try {
      const data = await service.list();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('wallets:getById', async (_, id: number) => {
    try {
      const data = await service.getById(id);
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('wallets:create', async (_, data) => {
    try {
      const result = await service.create(data);
      return { success: true, data: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('wallets:update', async (_, id: number, data) => {
    try {
      const result = await service.update(id, data);
      return { success: true, data: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('wallets:deactivate', async (_, id: number) => {
    try {
      await service.deactivate(id);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('wallets:activate', async (_, id: number) => {
    try {
      await service.activate(id);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('wallets:delete', async (_, id: number) => {
    try {
      await service.delete(id);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('wallets:getTotalBalance', async () => {
    try {
      const total = await service.getTotalBalance();
      return { success: true, data: total };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('wallets:adjustBalance', async (_, walletId: number, newBalance: number, note?: string) => {
    try {
      const result = await service.adjustBalance(walletId, newBalance, note);
      return { success: true, data: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });
}
