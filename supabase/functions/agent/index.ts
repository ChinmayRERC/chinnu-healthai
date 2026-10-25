import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const SYSTEM = `You are Chinnu, a fully agentic health & fitness AI assistant. Be practical, action-oriented. Safety first.`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  try {
    const { message, context, history = [] } = await req.json()
    if (!message) return new Response(JSON.stringify({ error: 'Message required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const keys = [
      Deno.env.get('NVIDIA_API_KEY'),
      Deno.env.get('NVIDIA_OCR_KEY'),
      Deno.env.get('NVIDIA_API_KEY_1'),
      Deno.env.get('NVIDIA_API_KEY_2'),
      Deno.env.get('NVIDIA_API_KEY_3'),
    ].filter(Boolean) as string[]

    const messages = [
      { role: 'system', content: SYSTEM + '\n\nContext:\n' + JSON.stringify(context || {}) },
      ...history.slice(-10).map((h: any) => ({ role: h.from === 'me' ? 'user' : 'assistant', content: h.text })),
      { role: 'user', content: message }
    ]

    for (const key of keys) {
      try {
        const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'meta/llama-3.1-70b-instruct', messages, temperature: 0.7, max_tokens: 1024 }),
        })
        if (resp.ok) {
          const data = await resp.json()
          const text = data.choices?.[0]?.message?.content
          if (text) return new Response(JSON.stringify({ text, source: 'cloud' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
      } catch {}
    }
    return new Response(JSON.stringify({ text: null, source: 'unavailable' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
