const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 5000;

app.use(express.json());
app.use(express.static(__dirname));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      system TEXT,
      user_id TEXT,
      action TEXT,
      timestamp TIMESTAMPTZ,
      fine INTEGER DEFAULT 0,
      reason TEXT,
      break_type TEXT,
      break_start_time TEXT,
      duration INTEGER DEFAULT 0,
      checked_in BOOLEAN DEFAULT FALSE,
      date TEXT,
      work_days INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS revenue_records (
      id SERIAL PRIMARY KEY,
      employee_code TEXT,
      date TEXT,
      time TEXT,
      amount INTEGER,
      transaction_type TEXT,
      order_type TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  
  console.log('Database tables initialized');
}

app.get('/api/attendance', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM attendance_records ORDER BY created_at DESC'
    );
    const records = result.rows.map(row => ({
      id: row.id,
      system: row.system,
      userId: row.user_id,
      action: row.action,
      timestamp: row.timestamp,
      fine: row.fine,
      reason: row.reason,
      breakType: row.break_type,
      breakStartTime: row.break_start_time,
      duration: row.duration,
      checkedIn: row.checked_in,
      date: row.date,
      workDays: row.work_days
    }));
    res.json({ isOk: true, data: records });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.json({ isOk: false, error: error.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { id, system, userId, action, timestamp, fine, reason, breakType, breakStartTime, duration, checkedIn, date, workDays } = req.body;
    
    await pool.query(
      `INSERT INTO attendance_records (id, system, user_id, action, timestamp, fine, reason, break_type, break_start_time, duration, checked_in, date, work_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [id, system, userId, action, timestamp, fine || 0, reason, breakType || '', breakStartTime || '', duration || 0, checkedIn || false, date, workDays || 0]
    );
    
    res.json({ isOk: true });
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.json({ isOk: false, error: error.message });
  }
});

app.delete('/api/attendance/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM attendance_records WHERE id = $1', [req.params.id]);
    res.json({ isOk: true });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.json({ isOk: false, error: error.message });
  }
});

app.delete('/api/attendance', async (req, res) => {
  try {
    await pool.query('DELETE FROM attendance_records');
    res.json({ isOk: true });
  } catch (error) {
    console.error('Error deleting all attendance:', error);
    res.json({ isOk: false, error: error.message });
  }
});

app.delete('/api/attendance/user/:userId', async (req, res) => {
  try {
    await pool.query('DELETE FROM attendance_records WHERE user_id = $1', [req.params.userId]);
    res.json({ isOk: true });
  } catch (error) {
    console.error('Error deleting user attendance:', error);
    res.json({ isOk: false, error: error.message });
  }
});

app.get('/api/revenue', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM revenue_records ORDER BY created_at DESC'
    );
    const records = result.rows.map(row => ({
      id: row.id,
      employee_code: row.employee_code,
      date: row.date,
      time: row.time,
      amount: row.amount,
      transaction_type: row.transaction_type,
      order_type: row.order_type
    }));
    res.json({ isOk: true, data: records });
  } catch (error) {
    console.error('Error fetching revenue:', error);
    res.json({ isOk: false, error: error.message });
  }
});

app.post('/api/revenue', async (req, res) => {
  try {
    const { employee_code, date, time, amount, transaction_type, order_type } = req.body;
    
    await pool.query(
      `INSERT INTO revenue_records (employee_code, date, time, amount, transaction_type, order_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [employee_code, date, time, amount, transaction_type, order_type || '']
    );
    
    res.json({ isOk: true });
  } catch (error) {
    console.error('Error creating revenue:', error);
    res.json({ isOk: false, error: error.message });
  }
});

app.delete('/api/revenue/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM revenue_records WHERE id = $1', [req.params.id]);
    res.json({ isOk: true });
  } catch (error) {
    console.error('Error deleting revenue:', error);
    res.json({ isOk: false, error: error.message });
  }
});

app.delete('/api/revenue', async (req, res) => {
  try {
    await pool.query('DELETE FROM revenue_records');
    res.json({ isOk: true });
  } catch (error) {
    console.error('Error deleting all revenue:', error);
    res.json({ isOk: false, error: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/revenue', (req, res) => {
  res.sendFile(path.join(__dirname, 'revenue.html'));
});

initDb().then(() => {
  app.listen(port, '0.0.0.0', () => {
    console.log(`FeiYue System running on http://0.0.0.0:${port}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
