const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (_req, res) => {
  const stats = {};
  const queries = {
    total: 'SELECT COUNT(*) FROM contracts',
    by_data_type: 'SELECT data_type, COUNT(*) FROM contracts GROUP BY data_type',
    by_county: 'SELECT county, COUNT(*) as count FROM contracts GROUP BY county ORDER BY count DESC LIMIT 10',
    by_sector: 'SELECT sector, COUNT(*) as count FROM contracts WHERE sector IS NOT NULL GROUP BY sector ORDER BY count DESC LIMIT 10',
    critical: "SELECT COUNT(*) FROM contracts WHERE risk_score >= 75 AND data_type <> 'reference'",
    documented: "SELECT COUNT(*) FROM contracts WHERE data_type = 'documented'",
    live_sync: "SELECT COUNT(*) FROM contracts WHERE data_type = 'live_sync'",
    reports_total: 'SELECT COUNT(*) FROM reports',
    total_value: "SELECT COALESCE(SUM(value_kes), 0) as total FROM contracts WHERE data_type <> 'reference'",
    avg_risk: "SELECT COALESCE(AVG(risk_score), 0) as avg FROM contracts WHERE data_type <> 'reference'",
    high_value: "SELECT COUNT(*) FROM contracts WHERE value_kes >= 100000000 AND data_type <> 'reference'",
    ghost_projects: 'SELECT COUNT(*) FROM ghost_projects',
  };

  for (const [key, sql] of Object.entries(queries)) {
    try {
      const r = await pool.query(sql);
      if (key === 'by_data_type' || key === 'by_county' || key === 'by_sector') {
        stats[key] = r.rows;
      } else if (key === 'total_value' || key === 'avg_risk') {
        stats[key] = Math.round(Number(r.rows[0][Object.keys(r.rows[0])[0]]));
      } else {
        stats[key] = Number(r.rows[0].count);
      }
    } catch (e) {
      stats[key] = (key === 'by_data_type' || key === 'by_county' || key === 'by_sector') ? [] : 0;
    }
  }
  res.json(stats);
});

module.exports = router;
