import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const KEYS = [
  Deno.env.get('NVIDIA_API_KEY'),
  Deno.env.get('NVIDIA_OCR_KEY'),
  Deno.env.get('NVIDIA_API_KEY_1'),
  Deno.env.get('NVIDIA_API_KEY_2'),
].filter(Boolean) as string[]

const PROMPT = `You are an expert food recognition and nutrition estimator for Indian and global foods.
Look at this food image carefully. Identify the food(s), estimate portion size.
Return ONLY valid JSON in this exact format:
{"name":"exact food name","serving":"e.g. 100g or 1 bowl","calories":250,"protein":12,"carbs":28,"fat":10,"fiber":6,"confidence":0.92,"alternatives":[{"name":"...","calories":240}],"notes":"brief reasoning"}
Be realistic with values. If mixed dish, estimate total. Don't add extra text.`

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const { image } = await req.json()
    if (!image) return new Response(JSON.stringify({ error: 'image required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const imageUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`

    for (const key of KEYS) {
      try {
        const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'nvidia/nemotron-nano-12b-v2-vl',
            messages: [{ role: 'user', content: [{ type: 'text', text: PROMPT }, { type: 'image_url', image_url: { url: imageUrl } }] }],
            temperature: 0.1,
            max_tokens: 512,
            top_p: 0.9
          }),
        })
        if (resp.ok) {
          const data = await resp.json()
          const text = data.choices?.[0]?.message?.content || ''
          const match = text.match(/\{[\s\S]*\}/)
          if (match) {
            const parsed = JSON.parse(match[0])
            return new Response(JSON.stringify({ ok: true, result: parsed, provider: 'nvidia' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
          }
        }
      } catch {}
    }
    return new Response(JSON.stringify({ ok: false, error: 'Could not recognize food' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
