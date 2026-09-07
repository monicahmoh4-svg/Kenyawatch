const express = require('express');
const router = express.Router();
const { pool, seed } = require('../db');

router.post('/reseed', async (req, res) => {
  const key = req.header('x-admin-key');
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const force = req.body?.force === true;
    if (force) {
      await pool.query("DELETE FROM contracts WHERE data_type = 'live_sync'");
      await pool.query("DELETE FROM contracts WHERE data_type = 'reference'");
    }
    await seed();
    const count = await pool.query('SELECT COUNT(*) FROM contracts');
    res.json({ ok: true, total_contracts: Number(count.rows[0].count) });
  } catch (e) {
    res.status(500).json({ error: 'Reseed failed', detail: e.message });
  }
});

router.get('/stats', async (req, res) => {
  const key = req.header('x-admin-key');
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const counts = await pool.query(`
      SELECT data_type, COUNT(*) as count FROM contracts GROUP BY data_type
    `);
    const total = await pool.query('SELECT COUNT(*) FROM contracts');
    const ghosts = await pool.query('SELECT COUNT(*) FROM ghost_projects');
    const reports = await pool.query('SELECT COUNT(*) FROM reports');
    res.json({
      total_contracts: Number(total.rows[0].count),
      by_data_type: counts.rows,
      ghost_projects: Number(ghosts.rows[0].count),
      reports: Number(reports.rows[0].count)
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;
