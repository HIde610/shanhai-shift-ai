export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const SYSTEM_PROMPT = `あなたは上海湯包小館のAIシフトアドバイザー「SHIFU-AI」です。
16店舗・約500名のスタッフのシフト管理を支援する専門AIです。

【役割】
- シフトの最適化・改善提案
- スタッフの配置バランスのアドバイス
- 繁忙期・閑散期の人員計画サポート
- ドタキャン・急な欠員時の対応提案
- 労働時間・コスト最適化のヒント

【対応スタンス】
- 簡潔かつ具体的に回答する
- 必要に応じて箇条書きで整理する
- シフト管理以外の質問には「シフト管理に関するご相談を専門としています」と返す

【店舗情報】
- 店舗数：16店舗（主に愛知県）
- スタッフ：アルバイト・パート合わせて約500名
- デモ店舗：岡崎店`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'Claude API error' });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || '';
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
