import { ipcMain } from 'electron';
import { ReportService } from '../services/report.service';

export function registerReportIpc(): void {
  const service = new ReportService();

  ipcMain.handle('reports:getDashboardSummary', async () => {
    try {
      const data = await service.getDashboardSummary();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('reports:getMonthlyCashFlow', async (_, year?: number) => {
    try {
      const data = await service.getMonthlyCashFlow(year);
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('reports:getCategoryExpenses', async (_, month?: string) => {
    try {
      const data = await service.getCategoryExpenses(month);
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('reports:getBalanceTrend', async (_, months?: number) => {
    try {
      const data = await service.getBalanceTrend(months);
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });
}
