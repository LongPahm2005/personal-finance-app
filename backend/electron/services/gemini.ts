/** Only server-side code may receive the key. Errors never echo provider payloads. */
export async function geminiRequest(apiKey: string, resource: string, body?: unknown): Promise<unknown> {
  if (!apiKey.trim()) throw new Error('Chưa cấu hình AI_API_KEY trong file .env. Thêm khóa Gemini rồi khởi động lại ứng dụng.');
  let response: Response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${resource}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey.trim() },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    if (error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name)) {
      throw new Error('Gemini không phản hồi trong 20 giây. Vui lòng thử lại.');
    }
    throw new Error('Không kết nối được Gemini. Kiểm tra quyền truy cập mạng, proxy hoặc tường lửa rồi thử lại.');
  }
  if (!response.ok) {
    const messages: Record<number, string> = {
      400: 'Khóa API hoặc yêu cầu Gemini không hợp lệ. Kiểm tra AI_API_KEY trong .env.',
      401: 'Khóa API Gemini không hợp lệ.',
      403: 'Gemini từ chối truy cập. Kiểm tra quyền của khóa API và khu vực sử dụng.',
      404: 'Mô hình Gemini đã chọn không khả dụng. Chọn một mô hình được tài khoản hỗ trợ.',
      429: 'Gemini hết hạn mức hoặc đang giới hạn tốc độ. Kiểm tra quota rồi thử lại.',
    };
    throw new Error(messages[response.status] || `Dịch vụ Gemini gặp lỗi (HTTP ${response.status}). Vui lòng thử lại sau.`);
  }
  return response.json();
}

export async function testGeminiConnection(apiKey: string, model: string) {
  if (!/^[a-zA-Z0-9._-]+$/.test(model)) throw new Error('Tên mô hình Gemini không hợp lệ.');
  const models: string[] = [];
  let pageToken = '';
  do {
    const data = await geminiRequest(apiKey, `models?pageSize=1000${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`) as {
      models?: Array<{ name: string; supportedGenerationMethods?: string[] }>; nextPageToken?: string;
    };
    models.push(...(data.models || []).filter(item => item.supportedGenerationMethods?.includes('generateContent')).map(item => item.name.replace(/^models\//, '')));
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  if (!models.includes(model)) return { connected: false, model, models, message: 'Khóa API hoạt động nhưng mô hình đang chọn không khả dụng. Hãy chọn mô hình bên dưới và lưu.' };
  // Thinking and final output share the output budget on thinking models.
  // A 64-token cap can end generation before any answer is produced.
  type Probe = { promptFeedback?: { blockReason?: string }; candidates?: Array<{
    finishReason?: string; content?: { parts?: Array<{ text?: string; thought?: boolean }> };
  }> };
  try {
    for (const maxOutputTokens of [1024, 4096]) {
      const probe = await geminiRequest(apiKey, `models/${model}:generateContent`, {
        contents: [{ parts: [{ text: 'Reply with the single word OK.' }] }],
        generationConfig: { maxOutputTokens },
      }) as Probe;
      if (probe.candidates?.some(item => item.content?.parts?.some(part => !part.thought && part.text?.trim()))) {
        return { connected: true, model, models, message: 'Đã kết nối Gemini và nhận được phản hồi thực tế.' };
      }
      if (probe.promptFeedback?.blockReason || probe.candidates?.some(item => ['SAFETY', 'BLOCKLIST', 'PROHIBITED_CONTENT', 'RECITATION'].includes(item.finishReason || ''))) {
        return { connected: false, model, models, message: 'Gemini đã kết nối nhưng chặn lời nhắn kiểm tra. Hãy chọn mô hình khác hoặc kiểm tra chính sách tài khoản.' };
      }
      if (!probe.candidates?.some(item => item.finishReason === 'MAX_TOKENS')) break;
    }
    return { connected: false, model, models, message: 'Khóa API đã truy cập được Gemini nhưng mô hình chưa trả về văn bản sau khi kiểm tra. Hãy chọn mô hình khác bên dưới.' };
  } catch (error) {
    // Preserve the available model list even when the chosen model fails its probe.
    return { connected: false, model, models, message: error instanceof Error ? error.message : 'Không kiểm tra được phản hồi Gemini.' };
  }
}
