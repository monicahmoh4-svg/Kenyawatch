const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { scoreContract } = require('../utils/riskEngine');
const counties = require('../data/counties');

router.get('/meta', async (_req, res) => {
  let sectors = [], years = [];
  try { const s = await pool.query('SELECT DISTINCT sector FROM contracts WHERE sector IS NOT NULL ORDER BY sector'); sectors = s.rows.map(r => r.sector); } catch (e) {}
  try { const y = await pool.query('SELECT DISTINCT year FROM contracts WHERE year IS NOT NULL ORDER BY year DESC'); years = y.rows.map(r => r.year); } catch (e) {}
  res.json({ counties: counties.map(c => c.name), regions: [...new Set(counties.map(c => c.region))], sectors, years, data_types: ['documented', 'live_sync', 'manual_scan', 'reference'] });
});

router.get('/', async (req, res) => {
  try {
    const { county, sector, year, risk_level, data_type, search, page = 1, limit = 20 } = req.query;
    const where = [], params = [];
    if (county) { params.push(county); where.push(`county = $${params.length}`); }
    if (sector) { params.push(sector); where.push(`sector = $${params.length}`); }
    if (year) { params.push(Number(year)); where.push(`year = $${params.length}`); }
    if (data_type) { params.push(data_type); where.push(`data_type = $${params.length}`); }
    if (risk_level) {
      const bands = { low: [0,24], medium: [25,49], high: [50,74], critical: [75,100] };
      const b = bands[risk_level];
      if (b) { params.push(b[0], b[1]); where.push(`risk_score BETWEEN $${params.length-1} AND $${params.length}`); }
    }
    if (search) { params.push(`%${search}%`); where.push(`(title ILIKE $${params.length} OR supplier ILIKE $${params.length})`); }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const lim = Math.min(Number(limit) || 20, 100);
    const off = (Math.max(Number(page) || 1, 1) - 1) * lim;
    const countRes = await pool.query(`SELECT COUNT(*) FROM contracts ${whereClause}`, params);
    const rowsRes = await pool.query(`SELECT * FROM contracts ${whereClause} ORDER BY risk_score DESC, year DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, lim, off]);
    res.json({ total: Number(countRes.rows[0].count), page: Number(page) || 1, limit: lim, results: rowsRes.rows });
  } catch (e) { res.status(500).json({ error: 'Failed to list contracts' }); }
});

router.post('/scan', (req, res) => {
  try { res.json({ input: req.body || {}, ...scoreContract(req.body || {}) }); }
  catch (e) { res.status(400).json({ error: 'Invalid contract payload' }); }
});
module.exports = router;