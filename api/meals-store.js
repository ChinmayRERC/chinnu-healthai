import pg from 'pg';
const { Pool } = pg;

export const config = { runtime: 'nodejs' };

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }
  return pool;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const pool = getPool();
    
    if (req.method === 'POST') {
      const { userId, mealType, name, calories, protein, carbs, fat, fiber, quantity, source, imageData, recognizedAt } = req.body;
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS meals (
          id SERIAL PRIMARY KEY,
          user_id TEXT,
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
          recognized_at TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      const result = await pool.query(
        `INSERT INTO meals (user_id, meal_type, name, calories, protein, carbs, fat, fiber, quantity, source, image_data, recognized_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [userId || 'guest', mealType, name, calories, protein, carbs, fat, fiber, quantity, source || 'camera', imageData?.substring(0, 50000), recognizedAt || new Date().toISOString()]
      );
      
      return res.status(200).json({ ok: true, meal: result.rows[0] });
    }
    
    if (req.method === 'GET') {
      const { userId } = req.query;
      const result = await pool.query(
        `SELECT id, user_id, meal_type, name, calories, protein, carbs, fat, fiber, quantity, source, recognized_at, created_at 
         FROM meals WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
        [userId || 'guest']
      );
      return res.status(200).json({ ok: true, meals: result.rows });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
