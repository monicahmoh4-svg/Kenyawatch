const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { pool } = require('../db');
const { scoreContract } = require('../utils/riskEngine');

router.post('/ocds', async (req, res) => {
  const { year, county } = req.body || {};
  if (!year) return res.status(400).json({ error: 'year required' });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    let releases = [];

    const urls = [
      `https://data.open-contracting.org/api/v0/releases.json?year=${year}${county ? `&buyer.name=${encodeURIComponent(county)}` : ''}`,
      `https://data.open-contracting.org/api/v0/releases.json?year=${year}`,
    ];

    let lastError = null;
    for (const url of urls) {
      try {
        const r = await fetch(url, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json', 'User-Agent': 'KenyaWatch/2.0' },
          timeout: 25000,
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const contentType = r.headers.get('content-type') || '';
        if (!contentType.includes('json')) throw new Error(`Not JSON: ${contentType}`);
        const data = await r.json();
        releases = data?.releases || data?.results || [];
        if (releases.length > 0) break;
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    clearTimeout(timeout);

    if (releases.length === 0) {
      await pool.query(
        'INSERT INTO ocds_sync_log (year,county,records_added,status,error) VALUES ($1,$2,0,$3,$4)',
        [year, county || null, 'no_data', lastError ? lastError.message : 'No releases found']
      ).catch(() => {});
      return res.json({
        year, county: county || null, added: 0,
        total_releases: 0,
        note: 'OCDS API returned no data for this year. This may be due to API availability. Use /api/sync/import for bulk data import.'
      });
    }

    let added = 0;
    for (const rel of releases.slice(0, 500)) {
      const contract = {
        contract_id: `OCDS-${year}-${rel.ocid || rel.id || `rel-${added}`}`,
        county: rel.buyer?.name || county || null,
        sector: rel.tender?.procurementMethodDetails || rel.tender?.mainProcurementCategory || null,
        year,
        title: rel.tender?.title || 'Untitled',
        supplier: rel.awards?.[0]?.suppliers?.[0]?.name || null,
        value_kes: Math.round(rel.tender?.value?.amount || 0),
        bid_type: rel.tender?.procurementMethod || null,
        scope: rel.tender?.description || null,
        award_date: rel.awards?.[0]?.date || rel.tender?.tenderPeriod?.endDate || null,
        data_type: 'live_sync',
        source_name: 'OCDS Open Contracting Data',
        source_url: 'https://data.open-contracting.org'
      };
      const scored = scoreContract(contract);
      try {
        await pool.query(
          `INSERT INTO contracts (contract_id,county,sector,year,title,supplier,value_kes,bid_type,scope,award_date,status,risk_score,risk_flags,data_type,source_name,source_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) ON CONFLICT (contract_id) DO NOTHING`,
          [contract.contract_id, contract.county, contract.sector, contract.year, contract.title, contract.supplier, contract.value_kes, contract.bid_type, contract.scope, contract.award_date, 'active', scored.risk_score, JSON.stringify(scored.risk_flags), contract.data_type, contract.source_name, contract.source_url]
        );
        added++;
      } catch (e) { /* skip duplicates */ }
    }

    await pool.query(
      'INSERT INTO ocds_sync_log (year,county,records_added,status) VALUES ($1,$2,$3,$4)',
      [year, county || null, added, 'ok']
    );
    res.json({ year, county: county || null, added, total_releases: releases.length });
  } catch (e) {
    clearTimeout(timeout);
    await pool.query(
      'INSERT INTO ocds_sync_log (year,county,records_added,status,error) VALUES ($1,$2,0,$3,$4)',
      [year, county || null, 'failed', e.message]
    ).catch(() => {});
    res.status(500).json({ error: 'OCDS sync failed', detail: e.message });
  }
});

router.post('/import', async (req, res) => {
  const { county, sector, year_from, year_to } = req.body || {};
  try {
    const where = ["data_type = 'live_sync'"];
    const params = [];
    if (county) { params.push(county); where.push(`county = $${params.length}`); }
    if (sector) { params.push(sector); where.push(`sector = $${params.length}`); }
    if (year_from) { params.push(Number(year_from)); where.push(`year >= $${params.length}`); }
    if (year_to) { params.push(Number(year_to)); where.push(`year <= $${params.length}`); }
    const whereClause = `WHERE ${where.join(' AND ')}`;
    const countRes = await pool.query(`SELECT COUNT(*) FROM contracts ${whereClause}`, params);
    const sampleRes = await pool.query(`SELECT * FROM contracts ${whereClause} ORDER BY risk_score DESC LIMIT 20`, params);
    res.json({
      total: Number(countRes.rows[0].count),
      sample: sampleRes.rows,
      filters: { county, sector, year_from, year_to }
    });
  } catch (e) {
    res.status(500).json({ error: 'Import query failed', detail: e.message });
  }
});

router.get('/status', async (_req, res) => {
  try {
    const r = await pool.query('SELECT * FROM ocds_sync_log ORDER BY created_at DESC LIMIT 20');
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load sync status' });
  }
});

module.exports = router;
