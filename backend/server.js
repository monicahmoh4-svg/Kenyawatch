require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : '*';
app.use(cors({ origin: allowedOrigins, credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/ghost-projects', require('./routes/ghostProjects'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/sync', require('./routes/ocdsSync'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use((err, _req, res, _next) => {
  console.error('[ERR]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

async function start() {
  const { ensureSchema, seed } = require('./db');
  await ensureSchema();
  const { pool } = require('./db');
  const result = await pool.query("SELECT COUNT(*) FROM contracts WHERE data_type = 'reference'");
  if (parseInt(result.rows[0].count) === 0) await seed();
  app.listen(PORT, () => console.log(`✓ KenyaWatch API running on :${PORT}`));
}
start().catch(console.error);
