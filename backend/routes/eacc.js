const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const where = [];
    const params = [];

    if (status) { params.push(status); where.push(`ef.status = $${params.length}`); }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    params.push(Number(limit), Number(offset));
    const result = await pool.query(
      `SELECT ef.*, c.title as contract_title, c.county as contract_county,
              c.value_kes as contract_value, c.supplier as contract_supplier,
              c.risk_score as contract_risk_score
       FROM eacc_forwarding ef
       LEFT JOIN contracts c ON ef.contract_id = c.contract_id
       ${whereClause}
       ORDER BY ef.forwarded_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM eacc_forwarding ef ${whereClause}`,
      params.slice(0, -2)
    );

    res.json({
      total: Number(countResult.rows[0].count),
      forwards: result.rows,
    });
  } catch (e) {
    console.error('[EACC]', e.message);
    res.status(500).json({ error: 'Failed to fetch EACC forwarding records' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [total, byStatus, recent] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM eacc_forwarding'),
      pool.query('SELECT status, COUNT(*) FROM eacc_forwarding GROUP BY status'),
      pool.query(
        `SELECT ef.*, c.title as contract_title, c.county as contract_county
         FROM eacc_forwarding ef
         LEFT JOIN contracts c ON ef.contract_id = c.contract_id
         ORDER BY ef.forwarded_at DESC LIMIT 10`
      ),
    ]);

    res.json({
      total: Number(total.rows[0].count),
      by_status: byStatus.rows,
      recent: recent.rows,
    });
  } catch (e) {
    res.json({ total: 0, by_status: [], recent: [] });
  }
});

router.post('/:id/respond', async (req, res) => {
  try {
    const { response } = req.body;
    await pool.query(
      `UPDATE eacc_forwarding SET response = $1, response_at = NOW(), status = 'responded' WHERE id = $1`,
      [Number(req.params.id), response]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update response' });
  }
});

module.exports = router;
