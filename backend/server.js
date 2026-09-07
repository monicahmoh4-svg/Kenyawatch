require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : '*';
app.use(cors({ origin: allowedOrigins, credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', generalLimiter);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: 'Too many AI requests, please wait a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many reports submitted, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/ghost-projects', require('./routes/ghostProjects'));
app.use('/api/reports', reportLimiter, require('./routes/reports'));
app.use('/api/ai', aiLimiter, require('./routes/ai'));
app.use('/api/sync', require('./routes/ocdsSync'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now(), version: '2.0.0' }));

app.use((err, _req, res, _next) => {
  console.error('[ERR]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

async function start() {
  const { ensureSchema, seed } = require('./db');
  await ensureSchema();
  try {
    await seed();
  } catch (e) {
    console.error('[seed error]', e.message);
  }
  app.listen(PORT, () => console.log(`KenyaWatch API v2.0 running on :${PORT}`));
}
start().catch(console.error);
