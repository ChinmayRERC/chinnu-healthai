import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: '20mb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=()');
  next();
});

// API routes - dynamic import
async function loadApi() {
  try {
    const agent = await import('./api/agent.js');
    const foodRec = await import('./api/food-recognize.js');
    const meals = await import('./api/meals-store.js');
    const coachVis = await import('./api/coach-vision.js');

    app.post('/api/agent', agent.default);
    app.post('/api/food-recognize', foodRec.default);
    app.post('/api/meals-store', meals.default);
    app.get('/api/meals-store', meals.default);
    app.post('/api/coach-vision', coachVis.default);
  } catch (e) {
    console.error('API load error:', e.message);
  }
}

await loadApi();

// Static files
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Server-side Supabase (service role) - never expose to client
import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', supabase: !!supabaseAdmin });
});
