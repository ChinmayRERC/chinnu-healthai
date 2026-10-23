export const config = { runtime: 'nodejs' };

const SYSTEM = `You are Chinnu, a fully agentic health & fitness AI assistant for the Chinnu HealthAI app.

You can take actions on behalf of the user. You have access to their full context (profile, today, routine, workouts, meals).
Be proactive, practical, and action-oriented. Give concrete advice and suggest specific actions.

Rules:
- Never diagnose medical conditions. For emergencies/crisis -> direct to emergency services
- For pregnancy, eating disorders, severe pain -> safety escalation
- Prioritize safety over optimization
- Keep advice realistic for their level/equipment
- Focus on habits they can actually do
- Be concise but helpful

You can recommend: generating/updating routines, logging meals, starting workouts, adjusting targets, etc.
Always respond in a helpful, actionable way.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Content-Type, Origin, Accept');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { message, context, history = [], tools = [] } = req.body || {};
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }
    
    // Try multiple providers - prioritize NVIDIA free models
    const providers = [
      { name: 'nvidia1', key: process.env.NVIDIA_API_KEY || process.env.NVIDIA_API_KEY_1 || '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', model: 'meta/llama-3.1-70b-instruct', url: 'https://integrate.api.nvidia.com/v1/chat/completions' },
      { name: 'nvidia2', key: process.env.NVIDIA_API_KEY_2 || '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', model: 'meta/llama-3.1-70b-instruct', url: 'https://integrate.api.nvidia.com/v1/chat/completions' },
      { name: 'groq', key: process.env.GROQ_API_KEY, model: 'llama-3.1-70b-versatile', url: 'https://api.groq.com/openai/v1/chat/completions' },
      { name: 'gemini', key: process.env.GEMINI_API_KEY, model: 'gemini-1.5-flash', url: null },
      { name: 'openrouter', key: process.env.OPENROUTER_API_KEY, model: 'meta-llama/llama-3.1-70b-instruct:free', url: 'https://openrouter.ai/api/v1/chat/completions' },
    ];
    
    const messages = [
      { role: 'system', content: SYSTEM + '\n\nUser Context:\n' + JSON.stringify(context, null, 2) },
      ...history.slice(-10).map(h => ({ role: h.from === 'me' ? 'user' : 'assistant', content: h.text })),
      { role: 'user', content: message }
    ];
    
    for (const p of providers) {
      if (!p.key) continue;
      try {
        if (p.name === 'gemini' && p.url === null) {
          const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${p.model}:generateContent?key=${p.key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: messages.map(m => m.role + ': ' + m.content).join('\n\n') }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
            }),
            signal: AbortSignal.timeout(20000)
          });
          if (resp.ok) {
            const data = await resp.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return res.status(200).json({ text, source: 'cloud', provider: p.name });
          }
        } else if (p.url) {
          const resp = await fetch(p.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${p.key}`,
              ...(p.name === 'openrouter' ? { 'HTTP-Referer': req.headers.host || 'https://chinnu.app', 'X-Title': 'Chinnu HealthAI' } : {})
            },
            body: JSON.stringify({
              model: p.model,
              messages,
              temperature: 0.7,
              max_tokens: 1024
            }),
            signal: AbortSignal.timeout(20000)
          });
          if (resp.ok) {
            const data = await resp.json();
            const text = data.choices?.[0]?.message?.content;
            if (text) return res.status(200).json({ text, source: 'cloud', provider: p.name });
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    return res.status(200).json({ text: null, source: 'unavailable' });
  } catch (error) {
    return res.status(500).json({ error: 'Agent error' });
  }
}
