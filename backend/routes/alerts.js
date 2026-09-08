const express = require('express');
const router = express.Router();
const monitorAgent = require('../services/monitorAgent');

router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, severity, acknowledged, alert_type } = req.query;
    const result = await monitorAgent.getAlerts({
      limit: Math.min(Number(limit) || 50, 200),
      offset: Number(offset) || 0,
      severity,
      acknowledged: acknowledged !== undefined ? acknowledged === 'true' : undefined,
      alert_type,
    });
    res.json(result);
  } catch (e) {
    console.error('[Alerts]', e.message);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.get('/unread-count', async (req, res) => {
  try {
    const result = await require('../db').pool.query(
      `SELECT COUNT(*) FROM alerts WHERE acknowledged = false`
    );
    res.json({ count: Number(result.rows[0].count) });
  } catch (e) {
    res.json({ count: 0 });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const { pool } = require('../db');
    const [total, bySeverity, byType, unread] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM alerts'),
      pool.query('SELECT severity, COUNT(*) FROM alerts GROUP BY severity'),
      pool.query('SELECT alert_type, COUNT(*) FROM alerts GROUP BY alert_type ORDER BY count DESC'),
      pool.query('SELECT COUNT(*) FROM alerts WHERE acknowledged = false'),
    ]);

    res.json({
      total: Number(total.rows[0].count),
      unread: Number(unread.rows[0].count),
      by_severity: bySeverity.rows,
      by_type: byType.rows,
    });
  } catch (e) {
    res.json({ total: 0, unread: 0, by_severity: [], by_type: [] });
  }
});

router.post('/:id/acknowledge', async (req, res) => {
  try {
    await monitorAgent.acknowledgeAlert(Number(req.params.id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

router.post('/acknowledge-all', async (req, res) => {
  try {
    const count = await monitorAgent.acknowledgeAllAlerts();
    res.json({ ok: true, acknowledged: count });
  } catch (e) {
    res.status(500).json({ error: 'Failed to acknowledge alerts' });
  }
});

router.post('/scan', async (req, res) => {
  try {
    const result = await monitorAgent.runFullScan();
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(500).json({ error: 'Scan failed' });
  }
});

router.get('/status', async (req, res) => {
  res.json(monitorAgent.getStatus());
});

module.exports = router;
