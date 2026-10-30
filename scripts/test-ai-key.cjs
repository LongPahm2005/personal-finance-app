const fs = require('node:fs');
const path = require('node:path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...values] = trimmed.split('=');
      env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

const env = loadEnv();
const apiKey = env.AI_API_KEY || process.env.AI_API_KEY;
const modelName = env.AI_MODEL || 'gemini-3-flash-preview';

console.log('==================================================');
console.log('   KIỂM TRA KẾT NỐI GOOGLE GEMINI API KEY');
console.log('==================================================');

if (!apiKey || apiKey.includes('your_gemini_api_key')) {
  console.error('\n❌ LỖI: Chưa tìm thấy API Key hợp lệ trong file .env');
  process.exit(1);
}

console.log(`🔑 Key đang dùng: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
console.log(`🤖 Model: ${modelName}`);
console.log('\n⏳ Đang gửi yêu cầu test đến Gemini API...');

async function testConnection() {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          parts: [
            {
              text: 'Hãy đưa ra 1 lời khuyên ngắn gọn (1 câu) về quản lý tài chính cá nhân.'
            }
          ]
        }
      ]
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || JSON.stringify(data));
    }

    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log('\n✅ KẾT NỐI GEMINI API THÀNH CÔNG RỰC RỠ!');
    console.log('\n💡 Phản hồi đầu tiên từ Trợ lý tài chính AI:');
    console.log('--------------------------------------------------');
    console.log(`"${answer.trim()}"`);
    console.log('--------------------------------------------------');
    console.log('\n🎉 API Key của bạn hoàn toàn chính xác và đã sẵn sàng sử dụng cho dự án!');
  } catch (err) {
    console.error('\n❌ KIỂM TRA THẤT BẠI:');
    console.error(err.message || err);
  }
}

testConnection();
