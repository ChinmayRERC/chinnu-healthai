import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const KEYS = [
  Deno.env.get('NVIDIA_API_KEY'),
  Deno.env.get('NVIDIA_OCR_KEY'),
  Deno.env.get('NVIDIA_API_KEY_1'),
  Deno.env.get('NVIDIA_API_KEY_2'),
].filter(Boolean) as string[]

const SYSTEM = `You are a friendly, motivating AI fitness coach doing REAL-TIME coaching via camera.
Rules:
- Speak naturally like a human coach - warm, encouraging but corrective
- Don't repeatedly say "fit in frame" - guide subtly only when truly needed
- Give ONE clear cue at a time
- Correct form issues specifically
- Keep responses SHORT (15-40 words max)
- Be encouraging even when correcting
- Prioritize safety - if dangerous form, say stop immediately
- Adapt to what you see
Return ONLY the spoken cue text, nothing else.`

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const { image, exercise, mode, reps, phase, lastCue, history = [] } = await req.json()
    if (!image) return new Response(JSON.stringify({ error: 'image required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const imageUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
    const context = `Exercise: ${exercise || 'general'} Mode: ${mode || 'strength'} Reps: ${reps || 0} Phase: ${phase || 'unknown'} Last: ${lastCue || 'none'} History: ${(history||[]).slice(-3).join(' | ')}`

    for (const key of KEYS) {
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
        })
        if (resp.ok) {
          const data = await resp.json()
          const text = data.choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, '')
          if (text && text.length > 3) return new Response(JSON.stringify({ cue: text }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
      } catch {}
    }
    return new Response(JSON.stringify({ cue: null }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ cue: null, error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
