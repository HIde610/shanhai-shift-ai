exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  try {
    const LSTEP_TOKEN = process.env.LSTEP_TOKEN;
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

    const body = JSON.parse(event.body);
    const userMessage = body.message || '';

    // ルステップ取得
    const lstepRes = await fetch('https://api.lineml.jp/v2/api/friends', {
      headers: { 'Authorization': 'Bearer ' + LSTEP_TOKEN }
    });
    const lstepData = await lstepRes.text();

    // Claude API呼び出し
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: userMessage + '\n\n[ルステップ友だちデータ]\n' + lstepData }]
      })
    });

    const claudeData = await claudeRes.json();
    const resultText = claudeData.content[0].text;

    return {
      statusCode: 200,
      headers,
      body: resultText
    };
  } catch (err) {
    return { statusCode: 500, headers, body: 'エラー: ' + err.message };
  }
};
