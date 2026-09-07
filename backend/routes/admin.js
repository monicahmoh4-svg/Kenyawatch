const express = require('express');
const router = express.Router();
const { pool, seed } = require('../db');

const ADMIN_KEY = process.env.ADMIN_KEY || 'kenyawatch-admin-2024';

function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Provide a valid token in Authorization header.' });
  }
  const expectedToken = `kw_${Buffer.from(ADMIN_KEY).toString('base64')}`;
  if (token === ADMIN_KEY || token.startsWith(expectedToken)) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
}

router.post('/login', async (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (password !== ADMIN_KEY) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    const token = `kw_${Buffer.from(ADMIN_KEY).toString('base64')}_${Date.now()}`;
    res.json({ token, message: 'Login successful. Use this token in Authorization header as Bearer <token>.' });
  } catch (e) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/dashboard', adminAuth, async (_req, res) => {
  try {
    const [
      totalContracts,
      totalReports,
      totalGhosts,
      byCounty,
      bySector,
      byYear,
      byDataType,
      riskDist,
      recentReports,
      recentSyncLogs,
      criticalContracts,
      totalValue,
      avgRisk,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM contracts'),
      pool.query('SELECT COUNT(*) FROM reports'),
      pool.query('SELECT COUNT(*) FROM ghost_projects'),
      pool.query('SELECT county, COUNT(*) as count FROM contracts GROUP BY county ORDER BY count DESC'),
      pool.query("SELECT sector, COUNT(*) as count FROM contracts WHERE sector IS NOT NULL GROUP BY sector ORDER BY count DESC"),
      pool.query('SELECT year, COUNT(*) as count FROM contracts WHERE year IS NOT NULL GROUP BY year ORDER BY year DESC'),
      pool.query('SELECT data_type, COUNT(*) as count FROM contracts GROUP BY data_type ORDER BY count DESC'),
      pool.query(`
        SELECT
          CASE
            WHEN risk_score >= 75 THEN 'critical'
            WHEN risk_score >= 50 THEN 'high'
            WHEN risk_score >= 25 THEN 'medium'
            ELSE 'low'
          END as risk_level,
          COUNT(*) as count
        FROM contracts GROUP BY risk_level ORDER BY
          CASE risk_level WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END
      `),
      pool.query('SELECT * FROM reports ORDER BY created_at DESC LIMIT 10'),
      pool.query('SELECT * FROM ocds_sync_log ORDER BY created_at DESC LIMIT 10'),
      pool.query("SELECT contract_id, county, title, supplier, value_kes, risk_score FROM contracts WHERE risk_score >= 75 AND data_type <> 'reference' ORDER BY risk_score DESC LIMIT 10"),
      pool.query("SELECT COALESCE(SUM(value_kes), 0) as total FROM contracts WHERE data_type <> 'reference'"),
      pool.query("SELECT COALESCE(AVG(risk_score), 0) as avg FROM contracts WHERE data_type <> 'reference'"),
    ]);

    res.json({
      overview: {
        total_contracts: Number(totalContracts.rows[0].count),
        total_reports: Number(totalReports.rows[0].count),
        total_ghost_projects: Number(totalGhosts.rows[0].count),
        total_value_kes: Number(totalValue.rows[0].total),
        avg_risk_score: Math.round(Number(avgRisk.rows[0].avg)),
      },
      by_county: byCounty.rows.map(r => ({ county: r.county, count: Number(r.count) })),
      by_sector: bySector.rows.map(r => ({ sector: r.sector, count: Number(r.count) })),
      by_year: byYear.rows.map(r => ({ year: r.year, count: Number(r.count) })),
      by_data_type: byDataType.rows.map(r => ({ data_type: r.data_type, count: Number(r.count) })),
      risk_distribution: riskDist.rows.map(r => ({ level: r.risk_level, count: Number(r.count) })),
      recent_reports: recentReports.rows,
      recent_sync_logs: recentSyncLogs.rows,
      critical_contracts: criticalContracts.rows,
    });
  } catch (e) {
    console.error('[admin-dashboard]', e.message);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

router.get('/reports', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const lim = Math.min(Number(limit) || 20, 100);
    const off = (Math.max(Number(page) || 1, 1) - 1) * lim;
    const params = [];
    let where = '';

    if (status) {
      params.push(status);
      where = `WHERE status = $${params.length}`;
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM reports ${where}`, params);
    const rowsRes = await pool.query(
      `SELECT * FROM reports ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, lim, off]
    );

    res.json({
      total: Number(countRes.rows[0].count),
      page: Number(page) || 1,
      limit: lim,
      results: rowsRes.rows,
    });
  } catch (e) {
    console.error('[admin-reports]', e.message);
    res.status(500).json({ error: 'Failed to list reports' });
  }
});

router.put('/reports/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body || {};
    const validStatuses = ['received', 'under_review', 'investigating', 'escalated', 'resolved', 'dismissed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const existing = await pool.query('SELECT * FROM reports WHERE id = $1 OR case_number = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const updates = [];
    const params = [];
    if (status) {
      params.push(status);
      updates.push(`status = $${params.length}`);
    }
    if (notes) {
      params.push(notes);
      updates.push(`details = COALESCE(details, '') || E'\n\n[Admin Note - ' || NOW() || ']: ' || $${params.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    params.push(existing.rows[0].id);
    const result = await pool.query(
      `UPDATE reports SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );

    res.json({ ok: true, report: result.rows[0] });
  } catch (e) {
    console.error('[admin-reports-update]', e.message);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

router.get('/contracts', adminAuth, async (req, res) => {
  try {
    const { county, sector, year, risk_level, data_type, search, page = 1, limit = 20 } = req.query;
    const where = [];
    const params = [];

    if (county) { params.push(county); where.push(`county = $${params.length}`); }
    if (sector) { params.push(sector); where.push(`sector = $${params.length}`); }
    if (year) { params.push(Number(year)); where.push(`year = $${params.length}`); }
    if (data_type) { params.push(data_type); where.push(`data_type = $${params.length}`); }
    if (risk_level) {
      const bands = { low: [0, 24], medium: [25, 49], high: [50, 74], critical: [75, 100] };
      const b = bands[risk_level];
      if (b) { params.push(b[0], b[1]); where.push(`risk_score BETWEEN $${params.length - 1} AND $${params.length}`); }
    }
    if (search) {
      params.push(`%${search}%`);
      where.push(`(title ILIKE $${params.length} OR supplier ILIKE $${params.length} OR county ILIKE $${params.length} OR contract_id ILIKE $${params.length})`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const lim = Math.min(Number(limit) || 20, 100);
    const off = (Math.max(Number(page) || 1, 1) - 1) * lim;

    const countRes = await pool.query(`SELECT COUNT(*) FROM contracts ${whereClause}`, params);
    const rowsRes = await pool.query(
      `SELECT * FROM contracts ${whereClause} ORDER BY risk_score DESC, year DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, lim, off]
    );

    res.json({
      total: Number(countRes.rows[0].count),
      page: Number(page) || 1,
      limit: lim,
      results: rowsRes.rows,
    });
  } catch (e) {
    console.error('[admin-contracts]', e.message);
    res.status(500).json({ error: 'Failed to list contracts' });
  }
});

router.delete('/contracts/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM contracts WHERE id = $1 OR contract_id = $1 RETURNING contract_id, county, title',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json({ ok: true, deleted: result.rows[0] });
  } catch (e) {
    console.error('[admin-contracts-delete]', e.message);
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

router.post('/seed', adminAuth, async (req, res) => {
  try {
    const { force } = req.body || {};
    if (force) {
      await pool.query("DELETE FROM contracts WHERE data_type = 'live_sync'");
      await pool.query("DELETE FROM contracts WHERE data_type = 'reference'");
    }
    await seed();
    const count = await pool.query('SELECT COUNT(*) FROM contracts');
    const ghosts = await pool.query('SELECT COUNT(*) FROM ghost_projects');

    await pool.query(
      `INSERT INTO ocds_sync_log (year, county, records_added, status)
       VALUES (EXTRACT(YEAR FROM NOW())::INT, 'ALL', $1, 'seeded')`,
      [Number(count.rows[0].count)]
    );

    res.json({
      ok: true,
      total_contracts: Number(count.rows[0].count),
      total_ghosts: Number(ghosts.rows[0].count),
    });
  } catch (e) {
    console.error('[admin-seed]', e.message);
    res.status(500).json({ error: 'Reseed failed' });
  }
});

router.get('/audit-log', adminAuth, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const lim = Math.min(Number(limit) || 50, 200);

    const [reports, syncLogs, recentContracts] = await Promise.all([
      pool.query(`SELECT 'report' as type, id, case_number as ref, county, status, created_at FROM reports ORDER BY created_at DESC LIMIT $1`, [lim]),
      pool.query(`SELECT 'sync' as type, id, county, records_added as ref, status, created_at FROM ocds_sync_log ORDER BY created_at DESC LIMIT $1`, [lim]),
      pool.query(`SELECT 'contract' as type, id, contract_id as ref, county, data_type as status, created_at FROM contracts ORDER BY created_at DESC LIMIT $1`, [lim]),
    ]);

    const allEvents = [...reports.rows, ...syncLogs.rows, ...recentContracts.rows]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, lim);

    res.json({ events: allEvents });
  } catch (e) {
    console.error('[admin-audit]', e.message);
    res.status(500).json({ error: 'Failed to load audit log' });
  }
});

router.get('/stats', adminAuth, async (_req, res) => {
  try {
    const [total, byDataType, ghosts, reports] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM contracts'),
      pool.query('SELECT data_type, COUNT(*) as count FROM contracts GROUP BY data_type'),
      pool.query('SELECT COUNT(*) FROM ghost_projects'),
      pool.query('SELECT COUNT(*) FROM reports'),
    ]);
    res.json({
      total_contracts: Number(total.rows[0].count),
      by_data_type: byDataType.rows,
      ghost_projects: Number(ghosts.rows[0].count),
      reports: Number(reports.rows[0].count),
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;
