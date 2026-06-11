export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
    const { message } = req.body;

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
        messages: [{ role: 'user', content: message || '' }]
      })
    });

    const claudeData = await claudeRes.json();
    if (!claudeRes.ok) {
      return res.status(claudeRes.status).json(claudeData);
    }

    const resultText = claudeData.content[0].text;
    return res.status(200).json({ result: resultText });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
