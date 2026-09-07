const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { pool } = require('../db');
const { scoreContract } = require('../utils/riskEngine');

router.post('/ocds', async (req, res) => {
  const { year, county } = req.body || {};
  if (!year) return res.status(400).json({ error: 'year required' });
  try {
    const url = `https://data.open-contracting.org/api/v0/releases.json?year=${year}` + (county ? `&buyer.name=${encodeURIComponent(county)}` : '');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const r = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeout);
    if (!r.ok) throw new Error(`OCDS registry returned ${r.status}`);
    const data = await r.json();
    const releases = data?.releases || [];
    let added = 0;
    for (const rel of releases.slice(0, 100)) {
      const contract = {
        contract_id: `OCDS-${rel.ocid || rel.id}`,
        county: rel.buyer?.name || county || null,
        sector: rel.tender?.procurementMethodDetails || null,
        year,
        title: rel.tender?.title || 'Untitled',
        supplier: rel.awards?.[0]?.suppliers?.[0]?.name || null,
        value_kes: Math.round(rel.tender?.value?.amount || 0),
        bid_type: rel.tender?.procurementMethod || null,
        scope: rel.tender?.description || null,
        award_date: rel.awards?.[0]?.date || null,
        data_type: 'live_sync'
      };
      const scored = scoreContract(contract);
      try {
        await pool.query(`INSERT INTO contracts (contract_id,county,sector,year,title,supplier,value_kes,bid_type,scope,award_date,risk_score,risk_flags,data_type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (contract_id) DO NOTHING`,
          [contract.contract_id,contract.county,contract.sector,contract.year,contract.title,contract.supplier,contract.value_kes,contract.bid_type,contract.scope,contract.award_date,scored.risk_score,JSON.stringify(scored.risk_flags),contract.data_type]);
        added++;
      } catch (e) { console.warn('[ocds insert]', e.message); }
    }
    await pool.query('INSERT INTO ocds_sync_log (year,county,records_added,status) VALUES ($1,$2,$3,$4)', [year, county || null, added, 'ok']);
    res.json({ year, county: county || null, added, total_releases: releases.length });
  } catch (e) {
    await pool.query('INSERT INTO ocds_sync_log (year,county,records_added,status,error) VALUES ($1,$2,0,$3,$4)', [year, county || null, 'failed', e.message]).catch(()=>{});
    res.status(500).json({ error: 'OCDS sync failed', detail: e.message });
  }
});
router.get('/status', async (_req, res) => {
  try { const r = await pool.query('SELECT * FROM ocds_sync_log ORDER BY created_at DESC LIMIT 20'); res.json(r.rows); }
  catch (e) { res.status(500).json({ error: 'Failed to load sync status' }); }
});
module.exports = router;