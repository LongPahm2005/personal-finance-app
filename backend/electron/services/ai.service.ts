import { calculateScenario, type ScenarioInput } from './forecast/scenarios';
import { getPool } from '../database/connection';
import type { RowDataPacket, ResultSetHeader } from '../database/types';
import { ReportService } from './report.service';
import { geminiRequest, testGeminiConnection } from './gemini';

export interface AiProfileModel {
  id: number;
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  monthly_baseline_income: number;
  emergency_fund_target_months: number;
  financial_health_score: number;
  financial_priorities: string[];
  last_analyzed_at?: string;
  updated_at?: string;
}

export interface AiRecommendationModel {
  id: number;
  type: string;
  title: string;
  summary: string;
  detailed_reasoning: string;
  potential_savings: number;
  action_payload: Record<string, unknown> | null;
  status: 'pending' | 'accepted' | 'rejected' | 'dismissed';
  confidence_score: number;
  created_at?: string;
  applied_at?: string;
}

export interface AiAnomalyModel {
  id: number;
  transaction_id: number | null;
  category_id: number | null;
  category_name?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  anomaly_type: string;
  description: string;
  suggested_action: string | null;
  is_resolved: number;
  created_at?: string;
}

export interface AiForecastModel {
  id: number;
  forecast_period: string;
  predicted_income: number;
  predicted_expense: number;
  predicted_ending_balance: number;
  lower_bound_balance: number;
  upper_bound_balance: number;
  model_name: string;
  created_at?: string;
}

export interface AiScenarioModel {
  id: number;
  name: string;
  scenario_type: string;
  parameters: Record<string, unknown>;
  simulation_result: Record<string, unknown>;
  ai_evaluation: string;
  created_at?: string;
}

export interface AiConfigModel {
  id: number;
  provider: string;
  api_key: string;
  model_name: string;
  temperature: number;
  is_active: number;
}

export class AiService {
  private reportService = new ReportService();

  /**
   * Lấy cấu hình AI hiện tại
   */
  async getConfig(): Promise<AiConfigModel> {
    const pool = getPool();
    // Older installations may not have AI tables yet. Environment configuration
    // still permits a connection test without creating or migrating any table.
    let rows: RowDataPacket[] = [];
    try {
      [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM ai_configs WHERE is_active = 1 ORDER BY id DESC LIMIT 1'
      );
    } catch (error) {
      if ((error as { code?: string }).code !== 'ER_NO_SUCH_TABLE') throw error;
    }
    if (rows.length > 0) {
      return {
        id: Number(rows[0].id),
        provider: String(rows[0].provider || 'gemini'),
        api_key: String(process.env.AI_API_KEY?.trim() || rows[0].api_key || ''),
        model_name: String(rows[0].model_name || process.env.AI_MODEL || 'gemini-3-flash-preview'),
        temperature: Number(rows[0].temperature || 0.7),
        is_active: Number(rows[0].is_active || 1),
      };
    }
    return {
      id: 0,
      provider: process.env.AI_PROVIDER || 'gemini',
      api_key: process.env.AI_API_KEY || '',
      model_name: process.env.AI_MODEL || 'gemini-3-flash-preview',
      temperature: 0.7,
      is_active: 1,
    };
  }

  /**
   * Lưu hoặc cập nhật cấu hình API Key
   */
  async saveConfig(data: { api_key: string; model_name?: string }): Promise<void> {
    const pool = getPool();
    const model = data.model_name || 'gemini-3-flash-preview';
    const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM ai_configs LIMIT 1');
    if (existing.length > 0) {
      await pool.query(
        'UPDATE ai_configs SET api_key = ?, model_name = ?, is_active = 1 WHERE id = ?',
        [data.api_key.trim(), model, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO ai_configs (provider, api_key, model_name, is_active) VALUES (?, ?, ?, 1)',
        ['gemini', data.api_key.trim(), model]
      );
    }
    process.env.AI_API_KEY = data.api_key.trim();
    process.env.AI_MODEL = model;
  }

  /**
   * Cập nhật mô hình AI đang sử dụng (Module 6.1)
   */
  async saveModel(modelName: string): Promise<void> {
    if (!/^[a-zA-Z0-9._-]+$/.test(modelName)) throw new Error('Tên mô hình Gemini không hợp lệ.');
    const pool = getPool();
    const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM ai_configs LIMIT 1');
    if (existing.length > 0) {
      await pool.query('UPDATE ai_configs SET model_name = ? WHERE id = ?', [modelName, existing[0].id]);
    } else {
      await pool.query(
        'INSERT INTO ai_configs (provider, api_key, model_name, is_active) VALUES (?, ?, ?, 1)',
        ['gemini', process.env.AI_API_KEY || '', modelName]
      );
    }
    process.env.AI_MODEL = modelName;
  }

  async testConnection() {
    const config = await this.getConfig();
    return testGeminiConnection(config.api_key, config.model_name);
  }

  /**
   * Lấy hồ sơ tài chính & khẩu vị rủi ro (Module 5.1)
   */
  async getProfile(): Promise<AiProfileModel> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM ai_user_profiles LIMIT 1');
    if (rows.length > 0) {
      const r = rows[0];
      let priorities: string[] = ['emergency_fund', 'debt_payoff', 'savings'];
      try {
        if (typeof r.financial_priorities === 'string') priorities = JSON.parse(r.financial_priorities);
        else if (Array.isArray(r.financial_priorities)) priorities = r.financial_priorities as string[];
      } catch {
        // ignore JSON parse error
      }
      return {
        id: Number(r.id),
        risk_tolerance: (r.risk_tolerance as 'conservative' | 'moderate' | 'aggressive') || 'moderate',
        monthly_baseline_income: Number(r.monthly_baseline_income || 0),
        emergency_fund_target_months: Number(r.emergency_fund_target_months || 6),
        financial_health_score: Number(r.financial_health_score || 0),
        financial_priorities: priorities,
        last_analyzed_at: r.last_analyzed_at ? String(r.last_analyzed_at) : undefined,
      };
    }

    // Khởi tạo hồ sơ mặc định nếu chưa có
    const [ins] = await pool.query<ResultSetHeader>(
      `INSERT INTO ai_user_profiles (risk_tolerance, monthly_baseline_income, emergency_fund_target_months, financial_health_score, financial_priorities)
       VALUES ('moderate', 0.00, 6, 0.0, '["emergency_fund", "debt_payoff", "savings"]')`
    );
    return {
      id: ins.insertId,
      risk_tolerance: 'moderate',
      monthly_baseline_income: 0,
      emergency_fund_target_months: 6,
      financial_health_score: 0.0,
      financial_priorities: ['emergency_fund', 'debt_payoff', 'savings'],
    };
  }

  /**
   * Tính toán và cập nhật điểm số sức khỏe tài chính tự động (0 - 100)
   */
  async evaluateHealthScore(): Promise<{ score: number; assessment: string }> {
    const pool = getPool();
    const summary = await this.reportService.getDashboardSummary();
    const profile = await this.getProfile();

    // Nếu chưa có giao dịch nào và số dư là 0: Khởi đầu hoàn hảo sạch nợ 100/100
    if (summary.totalBalance === 0 && summary.monthlyIncome === 0 && summary.monthlyExpense === 0) {
      await pool.query(
        'UPDATE ai_user_profiles SET financial_health_score = 100.00, last_analyzed_at = NOW() WHERE id = ?',
        [profile.id]
      );
      return { score: 100, assessment: 'Hoàn hảo (Khởi đầu sạch nợ)' };
    }

    let score = 100; // Khởi đầu điểm tối đa 100 (Mô hình Trừ điểm rủi ro - Penalty Model)

    // 1. Tiêu chí Dòng tiền thặng dư hàng tháng
    const surplus = summary.monthlyIncome - summary.monthlyExpense;
    if (summary.monthlyIncome > 0 && surplus < 0) {
      score -= 20; // Trừ điểm vì chi vượt thu
    }

    // 2. Tiêu chí Quỹ khẩn cấp (Số dư ví / Chi tiêu 1 tháng)
    if (summary.monthlyExpense > 0) {
      const monthsCovered = summary.totalBalance / summary.monthlyExpense;
      if (monthsCovered < 1) score -= 15;
      else if (monthsCovered < 3) score -= 5;
    }

    // 3. Tiêu chí Áp lực Nợ phải trả (Nợ / Tổng tài sản)
    if (summary.totalPayable > 0) {
      const totalAssets = summary.totalBalance + summary.totalReceivable;
      const debtRatio = summary.totalPayable / (totalAssets > 0 ? totalAssets : 1);
      if (debtRatio > 0.5) score -= 25;
      else if (debtRatio > 0.2) score -= 10;
    }

    score = Math.max(10, Math.min(100, Math.round(score)));

    let assessment = 'Bình thường';
    if (score >= 90) assessment = 'Hoàn hảo (Tài chính sạch & an toàn)';
    else if (score >= 75) assessment = 'Tốt (Dòng tiền lành mạnh)';
    else if (score >= 55) assessment = 'Cần chú ý (Dự phòng mỏng)';
    else assessment = 'Rủi ro cao (Áp lực nợ/chi vượt thu)';

    await pool.query(
      'UPDATE ai_user_profiles SET financial_health_score = ?, last_analyzed_at = NOW() WHERE id = ?',
      [score, profile.id]
    );

    return { score, assessment };
  }

  /**
   * Phát hiện chi tiêu bất thường (Module 5.2)
   */
  async getAnomalies(): Promise<AiAnomalyModel[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT a.*, c.name as category_name
      FROM ai_anomalies a
      LEFT JOIN categories c ON a.category_id = c.id
      ORDER BY a.is_resolved ASC, a.created_at DESC
      LIMIT 20
    `);
    return rows.map((r) => ({
      id: Number(r.id),
      transaction_id: r.transaction_id ? Number(r.transaction_id) : null,
      category_id: r.category_id ? Number(r.category_id) : null,
      category_name: r.category_name ? String(r.category_name) : undefined,
      severity: r.severity as 'low' | 'medium' | 'high' | 'critical',
      anomaly_type: String(r.anomaly_type),
      description: String(r.description),
      suggested_action: r.suggested_action ? String(r.suggested_action) : null,
      is_resolved: Number(r.is_resolved),
      created_at: r.created_at ? String(r.created_at) : undefined,
    }));
  }

  /**
   * Quét và ghi nhận các giao dịch chi tiêu bất thường
   */
  async scanAnomalies(): Promise<number> {
    const pool = getPool();
    // Tìm các giao dịch chi tiêu lớn hơn 3.000.000đ trong 30 ngày qua chưa được gắn cờ
    const [trans] = await pool.query<RowDataPacket[]>(`
      SELECT t.id, t.amount, t.transaction_date, t.note, t.category_id, c.name as category_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.type = 'expense'
        AND t.amount >= 3000000
        AND t.id NOT IN (SELECT transaction_id FROM ai_anomalies WHERE transaction_id IS NOT NULL)
      ORDER BY t.transaction_date DESC
      LIMIT 5
    `);

    let count = 0;
    for (const tx of trans) {
      const amountVND = Number(tx.amount).toLocaleString('vi-VN');
      await pool.query(
        `INSERT INTO ai_anomalies (transaction_id, category_id, severity, anomaly_type, description, suggested_action)
         VALUES (?, ?, 'high', 'large_spending_spike', ?, ?)`,
        [
          tx.id,
          tx.category_id,
          `Khoản chi lớn đột biến: ${amountVND}đ vào danh mục "${tx.category_name}".`,
          `Xem lại giao dịch "${tx.note || tx.category_name}" và điều chỉnh hạn mức danh mục nếu cần thiết.`,
        ]
      );
      count++;
    }
    return count;
  }

  /**
   * Dự báo dòng tiền tương lai (Module 5.3)
   */
  async getForecasts(): Promise<AiForecastModel[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM ai_cashflow_forecasts ORDER BY forecast_period ASC LIMIT 6'
    );
    return rows.map((r) => ({
      id: Number(r.id),
      forecast_period: String(r.forecast_period),
      predicted_income: Number(r.predicted_income),
      predicted_expense: Number(r.predicted_expense),
      predicted_ending_balance: Number(r.predicted_ending_balance),
      lower_bound_balance: Number(r.lower_bound_balance),
      upper_bound_balance: Number(r.upper_bound_balance),
      model_name: String(r.model_name || 'AI/Time-Series'),
      created_at: r.created_at ? String(r.created_at) : undefined,
    }));
  }

  /**
   * Tạo dự báo dòng tiền cho 3 tháng tiếp theo
   */
  async generateForecast(): Promise<void> {
    // Retired monthly API: never generate fabricated values or overwrite stored forecasts.
    throw new Error('Use ai:generateDailyBaseline; restart Electron to load the daily forecast.');
  }

  async getScenarios(): Promise<AiScenarioModel[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM ai_scenarios ORDER BY id DESC LIMIT 10');
    return rows.map((r) => {
      let params = {};
      let result = {};
      try {
        params = typeof r.parameters === 'string' ? JSON.parse(r.parameters) : r.parameters || {};
        result = typeof r.simulation_result === 'string' ? JSON.parse(r.simulation_result) : r.simulation_result || {};
      } catch {
        // ignore
      }
      return {
        id: Number(r.id),
        name: String(r.name),
        scenario_type: String(r.scenario_type),
        parameters: params,
        simulation_result: result,
        ai_evaluation: String(r.ai_evaluation || ''),
        created_at: r.created_at ? String(r.created_at) : undefined,
      };
    });
  }

  /**
   * Chạy mô phỏng kịch bản mua sắm lớn hoặc mất việc
   */
  async runScenario(data: ScenarioInput): Promise<AiScenarioModel> {
    // Validate before any database reads; calculate again with the real snapshot.
    calculateScenario(data, { totalBalance: 0, monthlyIncome: 0, monthlyExpense: 0 });
    const pool = getPool();
    const summary = await this.reportService.getDashboardSummary();
    const { evaluation: aiEvaluation, ...simResult } = calculateScenario(data, summary);

    const [res] = await pool.query<ResultSetHeader>(
      `INSERT INTO ai_scenarios (name, scenario_type, parameters, simulation_result, ai_evaluation)
       VALUES (?, ?, ?, ?, ?)`,
      [data.name, data.scenario_type, JSON.stringify(data), JSON.stringify(simResult), aiEvaluation]
    );

    return {
      id: res.insertId,
      name: data.name,
      scenario_type: data.scenario_type,
      parameters: { ...data },
      simulation_result: simResult,
      ai_evaluation: aiEvaluation,
    };
  }

  /**
   * Lấy danh sách khuyến nghị quyết định AI (Module 5.5)
   */
  async getRecommendations(): Promise<AiRecommendationModel[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM ai_recommendations WHERE status != 'dismissed' ORDER BY status ASC, created_at DESC LIMIT 15"
    );
    return rows.map((r) => {
      let payload = null;
      try {
        payload = typeof r.action_payload === 'string' ? JSON.parse(r.action_payload) : r.action_payload || null;
      } catch {
        // ignore
      }
      return {
        id: Number(r.id),
        type: String(r.type),
        title: String(r.title),
        summary: String(r.summary),
        detailed_reasoning: String(r.detailed_reasoning || ''),
        potential_savings: Number(r.potential_savings || 0),
        action_payload: payload,
        status: r.status as 'pending' | 'accepted' | 'rejected' | 'dismissed',
        confidence_score: Number(r.confidence_score || 0.9),
        created_at: r.created_at ? String(r.created_at) : undefined,
        applied_at: r.applied_at ? String(r.applied_at) : undefined,
      };
    });
  }

  /**
   * Gọi Google Gemini AI phân tích dữ liệu thực tế và sinh khuyến nghị
   */
  async generateRecommendations(): Promise<AiRecommendationModel[]> {
    const pool = getPool();
    const config = await this.getConfig();
    const summary = await this.reportService.getDashboardSummary();
    const [categories] = await pool.query<RowDataPacket[]>('SELECT id, name, type FROM categories');
    const [debts] = await pool.query<RowDataPacket[]>(
      "SELECT id, person_name, type, remaining_amount, due_date FROM debts WHERE status IN ('unpaid', 'partial')"
    );

    const apiKey = config.api_key || process.env.AI_API_KEY || '';
    const modelName = config.model_name || process.env.AI_MODEL || 'gemini-3-flash-preview';

    if (!apiKey) {
      throw new Error('Chưa cấu hình API Key AI. Vui lòng vào Cài đặt để nạp Gemini API Key.');
    }

    const contextData = {
      totalBalance: summary.totalBalance,
      monthlyIncome: summary.monthlyIncome,
      monthlyExpense: summary.monthlyExpense,
      netCashFlow: summary.netCashFlow,
      categories: categories.map((c) => ({ id: c.id, name: c.name, type: c.type })),
      debts: debts.map((d) => ({
        id: d.id,
        person: d.person_name,
        type: d.type,
        remaining: Number(d.remaining_amount),
        dueDate: d.due_date,
      })),
    };

    const prompt = `
Bạn là Hệ thống Hỗ trợ Ra Quyết định Tài chính Cá nhân (AI-FDSS).
Dựa trên dữ liệu tài chính thực tế của người dùng:
${JSON.stringify(contextData, null, 2)}

Hãy đóng vai trò chuyên gia phân tích và đưa ra 2 khuyến nghị hỗ trợ ra quyết định tài chính quan trọng và thiết thực nhất (ví dụ: cắt giảm chi tiêu danh mục nào, chiến lược trả nợ tối ưu, hoặc tối ưu tiền tiết kiệm).
Bắt buộc trả về đúng định dạng JSON Array chứa các object sau, không thêm lời chào hay markdown ngoài JSON:
[
  {
    "type": "spending_cut" hoặc "debt_strategy" hoặc "budget_adjustment" hoặc "saving_boost",
    "title": "Tiêu đề khuyến nghị ngắn gọn",
    "summary": "Tóm tắt trong 1-2 câu",
    "detailed_reasoning": "Lập luận chi tiết dựa trên số liệu cụ thể",
    "potential_savings": 500000,
    "confidence_score": 0.95,
    "action_payload": { "target": "category", "suggested_action": "cut_20_percent" }
  }
]
`;

    try {
      const resData = await geminiRequest(apiKey, `models/${modelName}:generateContent`, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
      }) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };

      const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      const items = JSON.parse(text || '[]');

      for (const item of items) {
        await pool.query(
          `INSERT INTO ai_recommendations (type, title, summary, detailed_reasoning, potential_savings, action_payload, confidence_score)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            item.type || 'spending_cut',
            item.title,
            item.summary,
            item.detailed_reasoning || item.summary,
            item.potential_savings || 0,
            JSON.stringify(item.action_payload || {}),
            item.confidence_score || 0.95,
          ]
        );
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Không thể tạo khuyến nghị từ Gemini.');
    }

    return this.getRecommendations();
  }

  /**
   * Áp dụng khuyến nghị 1-Click (Module 5.5 Actionable Loop)
   */
  async applyRecommendation(id: number): Promise<void> {
    const pool = getPool();
    await pool.query(
      "UPDATE ai_recommendations SET status = 'accepted', applied_at = NOW() WHERE id = ?",
      [id]
    );
  }

  /**
   * Bỏ qua khuyến nghị
   */
  async dismissRecommendation(id: number): Promise<void> {
    const pool = getPool();
    await pool.query("UPDATE ai_recommendations SET status = 'dismissed' WHERE id = ?", [id]);
  }

  /**
   * Trợ lý ảo AI Copilot Chat (Module 5.6)
   */
  async getChatSessions(): Promise<{ id: number; title: string; created_at: string }[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, title, created_at FROM ai_chat_sessions ORDER BY updated_at DESC LIMIT 10'
    );
    return rows.map((r) => ({
      id: Number(r.id),
      title: String(r.title),
      created_at: String(r.created_at),
    }));
  }

  async getChatMessages(sessionId: number): Promise<{ id: number; role: string; content: string }[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, role, content FROM ai_chat_messages WHERE session_id = ? ORDER BY id ASC',
      [sessionId]
    );
    return rows.map((r) => ({
      id: Number(r.id),
      role: String(r.role),
      content: String(r.content),
    }));
  }

  async sendChatMessage(sessionId: number, userMessage: string): Promise<string> {
    if (!Number.isSafeInteger(sessionId) || sessionId <= 0) throw new Error('Phiên trò chuyện không hợp lệ.');
    const pool = getPool();
    const config = await this.getConfig();
    const apiKey = config.api_key || process.env.AI_API_KEY || '';
    const modelName = config.model_name || process.env.AI_MODEL || 'gemini-3-flash-preview';

    // New AI tables have no chat sessions yet. Create the session on first use.
    await pool.query(
      'INSERT INTO ai_chat_sessions (id, title) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = id',
      [sessionId, 'Hội thoại chính']
    );
    // 1. Lưu tin nhắn của người dùng
    await pool.query(
      'INSERT INTO ai_chat_messages (session_id, role, content) VALUES (?, ?, ?)',
      [sessionId, 'user', userMessage]
    );

    // 2. Trích xuất dữ liệu tài chính làm RAG Context
    const summary = await this.reportService.getDashboardSummary();
    const ragContext = `
Dữ liệu tài chính hiện tại của người dùng:
- Tổng số dư các ví: ${summary.totalBalance.toLocaleString('vi-VN')} VND
- Thu nhập tháng này: ${summary.monthlyIncome.toLocaleString('vi-VN')} VND
- Chi tiêu tháng này: ${summary.monthlyExpense.toLocaleString('vi-VN')} VND
- Nợ phải thu: ${summary.totalReceivable.toLocaleString('vi-VN')} VND
- Nợ phải trả: ${summary.totalPayable.toLocaleString('vi-VN')} VND
- Tiền tiết kiệm đã tích lũy: ${summary.totalSavings.toLocaleString('vi-VN')} VND
`;

    // 3. Lấy 4 tin nhắn gần nhất để giữ mạch trò chuyện
    const [history] = await pool.query<RowDataPacket[]>(
      'SELECT role, content FROM ai_chat_messages WHERE session_id = ? ORDER BY id DESC LIMIT 4',
      [sessionId]
    );
    const historyParts = history.reverse().map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(h.content) }],
    }));

    let aiReply = '';
    try {
      const payload = {
        systemInstruction: {
          parts: [
            {
              text: `Bạn là Trợ lý Cố vấn Quyết định Tài chính Cá nhân thông minh và thân thiện. 
Hãy dựa trên số liệu thực tế của người dùng dưới đây để trả lời câu hỏi một cách ngắn gọn, súc tích và có căn cứ số liệu rõ ràng:
${ragContext}`,
            },
          ],
        },
        contents: historyParts,
      };

      const data = await geminiRequest(apiKey, `models/${modelName}:generateContent`, payload) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, tôi chưa thể trả lời lúc này.';
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Không kết nối được Gemini.');
    }

    // 4. Lưu câu trả lời của AI
    await pool.query(
      'INSERT INTO ai_chat_messages (session_id, role, content) VALUES (?, ?, ?)',
      [sessionId, 'assistant', aiReply]
    );
    await pool.query('UPDATE ai_chat_sessions SET updated_at = NOW() WHERE id = ?', [sessionId]);

    return aiReply;
  }
}
