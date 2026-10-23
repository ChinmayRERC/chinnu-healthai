export const config = { runtime: 'nodejs' };

const NVIDIA_KEYS = [
  process.env.NVIDIA_OCR_KEY || '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',
  process.env.NVIDIA_API_KEY_1 || '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',
  process.env.NVIDIA_API_KEY_2 || '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',
];

const PROMPT = `You are an expert food recognition and nutrition estimator for Indian and global foods.

Look at this food image carefully. Identify the food(s), estimate portion size.

Return ONLY valid JSON in this exact format:
{
  "name": "exact food name",
  "serving": "e.g. 100g or 1 bowl",
  "calories": 250,
  "protein": 12,
  "carbs": 28,
  "fat": 10,
  "fiber": 6,
  "confidence": 0.92,
  "alternatives": [{"name": "...", "calories": 240}],
  "notes": "brief reasoning"
}

Be realistic with values. If mixed dish, estimate total. Don't add extra text.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'image (base64 data URL or base64) required' });

    const imageUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;

    for (const key of NVIDIA_KEYS) {
      if (!key) continue;
      try {
        const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'nvidia/nemotron-nano-12b-v2-vl',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: PROMPT },
                  { type: 'image_url', image_url: { url: imageUrl } }
                ]
              }
            ],
            temperature: 0.1,
            max_tokens: 512,
            top_p: 0.9
          }),
          signal: AbortSignal.timeout(30000)
        });

        if (resp.ok) {
          const data = await resp.json();
          const text = data.choices?.[0]?.message?.content || '';
          const match = text.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            return res.status(200).json({ ok: true, result: parsed, provider: 'nvidia-llava' });
          }
        }
      } catch (e) {
        continue;
      }
    }

    // fallback to smaller model
    for (const key of NVIDIA_KEYS) {
      try {
        const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'microsoft/phi-3.5-vision-instruct',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: PROMPT },
                  { type: 'image_url', image_url: { url: imageUrl } }
                ]
              }
            ],
            temperature: 0.1,
            max_tokens: 400
          }),
          signal: AbortSignal.timeout(25000)
        });
        if (resp.ok) {
          const data = await resp.json();
          const text = data.choices?.[0]?.message?.content || '';
          const match = text.match(/\{[\s\S]*\}/);
          if (match) return res.status(200).json({ ok: true, result: JSON.parse(match[0]), provider: 'nvidia-phi' });
        }
      } catch {}
    }

    return res.status(200).json({ ok: false, error: 'Could not recognize food' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
