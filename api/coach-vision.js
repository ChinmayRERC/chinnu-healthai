export const config = { runtime: 'nodejs' };

const KEYS = [
  process.env.NVIDIA_API_KEY || process.env.NVIDIA_OCR_KEY,
  process.env.NVIDIA_API_KEY_1,
  process.env.NVIDIA_API_KEY_2,
].filter(Boolean);
];

const SYSTEM = `You are a friendly, motivating AI fitness coach doing REAL-TIME coaching via camera.

You're coaching someone doing gym/yoga/pranayama/fitness exercises.

Rules:
- Speak naturally like a human coach - warm, encouraging but corrective
- Don't repeatedly say "fit in frame" - guide subtly: "step back a bit", "tilt slightly" only when truly needed
- Give ONE clear cue at a time
- Correct form issues specifically: alignment, breathing, stability
- Push them appropriately based on their effort
- For yoga/pranayama: focus on breath, alignment, calm tone
- For strength: focus on tension, range of motion, safety
- Keep responses SHORT (15-40 words max) for natural speech
- Be encouraging even when correcting
- Prioritize safety - if dangerous form, say stop immediately
- Adapt to what you see

Return ONLY the spoken cue text, nothing else. No JSON, no extra commentary.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image, exercise, mode, reps, phase, lastCue, history = [] } = req.body;
    if (!image) return res.status(400).json({ error: 'image required' });

    const imageUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
    const context = `Exercise: ${exercise || 'general fitness'}. Mode: ${mode || 'strength'}. Reps so far: ${reps || 0}. Phase: ${phase || 'unknown'}. Last cue: ${lastCue || 'none'}. History: ${history.slice(-3).join(' | ')}`;

    for (const key of KEYS) {
      if (!key) continue;
      try {
        const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'nvidia/nemotron-nano-12b-v2-vl',
            messages: [
              { role: 'system', content: SYSTEM },
              { role: 'user', content: [
                { type: 'text', text: `Current state: ${context}. Give me your next coaching cue.` },
                { type: 'image_url', image_url: { url: imageUrl } }
              ]}
            ],
            temperature: 0.8,
            max_tokens: 60,
            top_p: 0.9
          }),
          signal: AbortSignal.timeout(12000)
        });
        if (resp.ok) {
          const data = await resp.json();
          const text = data.choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, '');
          if (text && text.length > 3) return res.status(200).json({ cue: text });
        }
      } catch {}
    }

    return res.status(200).json({ cue: null });
  } catch (err) {
    return res.status(500).json({ cue: null });
  }
}
