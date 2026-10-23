import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: '50mb' }));

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
EOF