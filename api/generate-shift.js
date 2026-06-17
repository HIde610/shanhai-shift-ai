export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'CLAUDE_API_KEY not set' });

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{ role: 'user', content: message }]
      })
    });

    if (!claudeRes.ok) {
      const errorText = await claudeRes.text();
      return res.status(claudeRes.status).json({ error: 'Claude API error', detail: errorText });
    }

    const data = await claudeRes.json();
    const responseText = data.content[0].text;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(responseText);

  } catch (error) {
    return res.status(500).json({ error: 'Internal error', detail: error.message });
  }
}
