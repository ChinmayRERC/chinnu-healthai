export const config = { runtime: 'nodejs' };

const SYSTEM = `You are Chinnu, a fully agentic health & fitness AI assistant. Be practical, action-oriented. Safety first.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, context, history = [] } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Message required' });

    const keys = [
      process.env.NVIDIA_OCR_KEY || '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',
      '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',
      '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',
    ];
    const messages = [
      { role: 'system', content: SYSTEM + '\n\nContext:\n' + JSON.stringify(context || {}) },
      ...history.slice(-10).map(h => ({ role: h.from === 'me' ? 'user' : 'assistant', content: h.text })),
      { role: 'user', content: message }
    ];

    for (const key of keys) {
      try {
        const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'meta/llama-3.1-70b-instruct', messages, temperature: 0.7, max_tokens: 1024 }),
          signal: AbortSignal.timeout(20000)
        });
        if (resp.ok) {
          const data = await resp.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) return res.status(200).json({ text, source: 'cloud' });
        }
      } catch {}
    }
    return res.status(200).json({ text: null, source: 'unavailable' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
