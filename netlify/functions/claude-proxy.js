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
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
    const body = JSON.parse(event.body);
    const userMessage = body.message || '';
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: userMessage
        }]
      })
    });
    const claudeData = await claudeRes.json();
    if (!claudeRes.ok) {
      return { statusCode: claudeRes.status, headers, body: JSON.stringify(claudeData) };
    }
    const resultText = claudeData.content[0].text;
    return {
      statusCode: 200,
      headers,
      body: resultText
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: 'エラー: ' + err.message
    };
  }
};
