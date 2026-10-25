-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.meals (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'guest',
  meal_type TEXT,
  name TEXT NOT NULL,
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC,
  fiber NUMERIC,
  quantity TEXT,
  source TEXT DEFAULT 'camera',
  image_data TEXT,
  recognized_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated and anon" ON public.meals;
CREATE POLICY "Allow all for authenticated and anon" ON public.meals FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_meals_user_id ON public.meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_created_at ON public.meals(created_at DESC);

-- Ensure health_state exists (for cloud sync)
CREATE TABLE IF NOT EXISTS public.health_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.health_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own state" ON public.health_state;
CREATE POLICY "Users can manage own state" ON public.health_state FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
