import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    if (req.method === 'POST') {
      const { userId, mealType, name, calories, protein, carbs, fat, fiber, quantity, source, imageData, recognizedAt } = await req.json()
      
      const { data, error } = await supabase.from('meals').insert({
        user_id: userId || 'guest',
        meal_type: mealType,
        name,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        quantity,
        source: source || 'camera',
        image_data: imageData?.substring(0, 50000),
        recognized_at: recognizedAt || new Date().toISOString(),
      }).select().single()
      
      if (error) throw error
      return new Response(JSON.stringify({ ok: true, meal: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const userId = url.searchParams.get('userId') || 'guest'
      const { data, error } = await supabase.from('meals').select('id,user_id,meal_type,name,calories,protein,carbs,fat,fiber,quantity,source,recognized_at,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(100)
      if (error) throw error
      return new Response(JSON.stringify({ ok: true, meals: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
