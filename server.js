const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: '50mb' }));

// API routes
try {
  app.post('/api/agent', require('./api/agent.js').default || require('./api/agent.js'));
  app.post('/api/food-recognize', require('./api/food-recognize.js').default || require('./api/food-recognize.js'));
  app.post('/api/meals-store', require('./api/meals-store.js').default || require('./api/meals-store.js'));
  app.get('/api/meals-store', require('./api/meals-store.js').default || require('./api/meals-store.js'));
  app.post('/api/coach-vision', require('./api/coach-vision.js').default || require('./api/coach-vision.js'));
} catch (e) {
  console.error('API load error:', e.message);
}

// Static files
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
EOF