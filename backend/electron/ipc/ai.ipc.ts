import { ipcMain } from 'electron';
import { AiService } from '../services/ai.service';

export function registerAiIpc(): void {
  const aiService = new AiService();

  // 1. Config & API Key
  ipcMain.handle('ai:getConfig', async () => {
    try {
      const data = await aiService.getConfig();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('ai:saveConfig', async (_, data: { api_key?: string; model_name?: string }) => {
    try {
      if (data?.model_name) {
        await aiService.saveModel(data.model_name);
        return { success: true };
      }
      return {
        success: false,
        error: 'Chính sách bảo mật: Khóa API được cố định trong file .env và không cho phép chỉnh sửa qua giao diện.',
      };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('ai:saveModel', async (_, modelName: string) => {
    try {
      await aiService.saveModel(modelName);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  // 2. Profile & Health Score
  ipcMain.handle('ai:getProfile', async () => {
    try {
      const data = await aiService.getProfile();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('ai:evaluateHealthScore', async () => {
    try {
      const data = await aiService.evaluateHealthScore();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  // 3. Recommendations
  ipcMain.handle('ai:getRecommendations', async () => {
    try {
      const data = await aiService.getRecommendations();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('ai:generateRecommendations', async () => {
    try {
      const data = await aiService.generateRecommendations();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('ai:applyRecommendation', async (_, id: number) => {
    try {
      await aiService.applyRecommendation(id);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('ai:dismissRecommendation', async (_, id: number) => {
    try {
      await aiService.dismissRecommendation(id);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  // 4. Anomalies
  ipcMain.handle('ai:getAnomalies', async () => {
    try {
      const data = await aiService.getAnomalies();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('ai:scanAnomalies', async () => {
    try {
      const count = await aiService.scanAnomalies();
      return { success: true, data: count };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  // 5. Forecasts
  ipcMain.handle('ai:getForecasts', async () => {
    try {
      const data = await aiService.getForecasts();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('ai:generateForecast', async () => {
    try {
      await aiService.generateForecast();
      const data = await aiService.getForecasts();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  // 6. Scenarios (What-If)
  ipcMain.handle('ai:getScenarios', async () => {
    try {
      const data = await aiService.getScenarios();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('ai:runScenario', async (_, data: {
    name: string;
    scenario_type: 'large_expense' | 'income_loss' | 'custom';
    expenseAmount?: number;
    monthlyCost?: number;
    months?: number;
  }) => {
    try {
      const result = await aiService.runScenario(data);
      return { success: true, data: result };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  // 7. Interactive Chat (AI Copilot)
  ipcMain.handle('ai:getChatSessions', async () => {
    try {
      const data = await aiService.getChatSessions();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('ai:getChatMessages', async (_, sessionId: number) => {
    try {
      const data = await aiService.getChatMessages(sessionId);
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('ai:sendChatMessage', async (_, sessionId: number, content: string) => {
    try {
      const reply = await aiService.sendChatMessage(sessionId, content);
      return { success: true, data: reply };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  });
}

