const assert = require('node:assert/strict');
const { geminiRequest, testGeminiConnection } = require('../../backend/dist-electron/services/gemini.js');

async function main() {
  const original = global.fetch;
  try {
    await assert.rejects(geminiRequest('', 'models'), /AI_API_KEY/);
    global.fetch = async () => ({ ok: false, status: 429 });
    await assert.rejects(geminiRequest('secret-key', 'models'), /quota/);
    global.fetch = async () => { throw new Error('secret-key'); };
    await assert.rejects(geminiRequest('secret-key', 'models'), error => !error.message.includes('secret-key'));
    global.fetch = async (url, options) => {
      assert.ok(!url.includes('secret-key'));
      assert.equal(options.headers['x-goog-api-key'], 'secret-key');
      return { ok: true, json: async () => url.includes(':generateContent')
        ? { candidates: [{ content: { parts: [{ text: 'OK' }] } }] }
        : { models: [{ name: 'models/available', supportedGenerationMethods: ['generateContent'] }] } };
    };
    assert.equal((await testGeminiConnection('secret-key', 'missing')).connected, false);
    assert.equal((await testGeminiConnection('secret-key', 'available')).connected, true);
    let probes = 0;
    global.fetch = async (url, options) => ({ ok: true, json: async () => {
      if (!url.includes(':generateContent')) return { models: [{ name: 'models/available', supportedGenerationMethods: ['generateContent'] }] };
      probes++;
      assert.equal(JSON.parse(options.body).generationConfig.maxOutputTokens, probes === 1 ? 1024 : 4096);
      return probes === 1 ? { candidates: [{ finishReason: 'MAX_TOKENS' }] }
        : { candidates: [{ content: { parts: [{ text: 'OK' }] } }] };
    } });
    assert.equal((await testGeminiConnection('secret-key', 'available')).connected, true);
    assert.equal(probes, 2);
    global.fetch = async url => ({ ok: true, json: async () => url.includes(':generateContent')
      ? { candidates: [{ finishReason: 'STOP', content: { parts: [{ thought: true, text: 'reasoning only' }] } }] }
      : { models: [{ name: 'models/available', supportedGenerationMethods: ['generateContent'] }] } });
    const empty = await testGeminiConnection('secret-key', 'available');
    assert.equal(empty.connected, false);
    assert.deepEqual(empty.models, ['available']);
    global.fetch = async url => ({ ok: true, json: async () => url.includes(':generateContent')
      ? { promptFeedback: { blockReason: 'SAFETY' } }
      : { models: [{ name: 'models/available', supportedGenerationMethods: ['generateContent'] }] } });
    const blocked = await testGeminiConnection('secret-key', 'available');
    assert.equal(blocked.connected, false);
    assert.match(blocked.message, /Gemini/);
    global.fetch = async url => url.includes(':generateContent') ? { ok: false, status: 429 }
      : { ok: true, json: async () => ({ models: [{ name: 'models/available', supportedGenerationMethods: ['generateContent'] }] }) };
    const quota = await testGeminiConnection('secret-key', 'available');
    assert.equal(quota.connected, false);
    assert.deepEqual(quota.models, ['available']);
    assert.match(quota.message, /quota/);
    console.log('Regression checks passed: MAX_TOKENS retry, ignore thought-only output, safety block, keep model list after quota failure.');
    console.log('Gemini checks passed: missing key, quota, network error redaction, key header, unavailable model, actual response probe.');
  } finally { global.fetch = original; }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
