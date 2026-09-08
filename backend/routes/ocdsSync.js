const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const zlib = require('zlib');
const readline = require('readline');
const { pool } = require('../db');
const { scoreContract } = require('../utils/riskEngine');

router.post('/ocds', async (req, res) => {
  const { year, county } = req.body || {};
  if (!year) return res.status(400).json({ error: 'year required' });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 600000);

  try {
    const url = `https://data.open-contracting.org/en/publication/147/download?name=${year}.jsonl.gz`;
    console.log(`[ocds-sync] Downloading ${year} data from ${url}`);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'KenyaWatch/3.0', 'Accept-Encoding': 'gzip, deflate' },
      timeout: 120000,
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const gunzip = zlib.createGunzip();
    const stream = response.body.pipe(gunzip);
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    
    let batch = [];
    let added = 0;
    let total = 0;
    
    for await (const line of rl) {
      if (!line.trim()) continue;
      total++;
      
      try {
        const release = JSON.parse(line);
        const contractId = `OCDS-${release.ocid || release.id || `rel-${total}`}`;
        const contractCounty = release.buyer?.name || county || null;
        const sector = release.tender?.mainProcurementCategory || null;
        const title = release.tender?.title || null;
        const supplier = release.awards?.[0]?.suppliers?.[0]?.name || null;
        const valueKes = Math.round(release.awards?.[0]?.value?.amount || release.tender?.value?.amount || 0);
        const bidType = release.tender?.procurementMethod || null;
        const scope = release.tender?.description || null;
        const awardDate = release.awards?.[0]?.date || release.tender?.tenderPeriod?.endDate || null;
        
        if (!title && !valueKes) continue;
        
        const contract = {
          contract_id: contractId,
          county: contractCounty,
          sector,
          year,
          title,
          supplier,
          value_kes: valueKes,
          bid_type: bidType,
          scope,
          award_date: awardDate,
          data_type: 'live_sync',
          source_name: 'PPIP OCDS - Kenya',
          source_url: 'https://tenders.go.ke/ocds',
        };
        
        const scored = scoreContract(contract);
        batch.push([
          contract.contract_id, contract.county, contract.sector, contract.year,
          contract.title, contract.supplier, contract.value_kes, contract.bid_type,
          contract.scope, contract.award_date, 'active', scored.risk_score,
          JSON.stringify(scored.risk_flags), contract.data_type,
          contract.source_name, contract.source_url,
        ]);
        
        if (batch.length >= 500) {
          await insertBatch(batch);
          added += batch.length;
          batch = [];
          if (total % 1000 === 0) {
            console.log(`[ocds-sync] Progress: ${total} processed, ${added} inserted`);
          }
        }
      } catch (e) {
        // Skip invalid JSON lines
      }
    }
    
    if (batch.length > 0) {
      await insertBatch(batch);
      added += batch.length;
    }
    
    clearTimeout(timeout);
    
    await pool.query(
      'INSERT INTO ocds_sync_log (year,county,records_added,status) VALUES ($1,$2,$3,$4)',
      [year, county || null, added, 'ok']
    );
    
    res.json({ year, county: county || null, added, total_releases: total });
  } catch (e) {
    clearTimeout(timeout);
    await pool.query(
      'INSERT INTO ocds_sync_log (year,county,records_added,status,error) VALUES ($1,$2,0,$3,$4)',
      [year, county || null, 'failed', e.message]
    ).catch(() => {});
    res.status(500).json({ error: 'OCDS sync failed', detail: e.message });
  }
});

async function insertBatch(batch) {
  if (batch.length === 0) return;
  const cols = [
    'contract_id', 'county', 'sector', 'year', 'title', 'supplier',
    'value_kes', 'bid_type', 'scope', 'award_date', 'status', 'risk_score',
    'risk_flags', 'data_type', 'source_name', 'source_url',
  ];
  const valueClauses = [];
  const params = [];
  for (let i = 0; i < batch.length; i++) {
    const offset = i * cols.length;
    const placeholders = cols.map((_, j) => `$${offset + j + 1}`);
    valueClauses.push(`(${placeholders.join(',')})`);
    params.push(...batch[i]);
  }
  const sql = `INSERT INTO contracts (${cols.join(',')}) VALUES ${valueClauses.join(',')} ON CONFLICT (contract_id) DO NOTHING`;
  try {
    await pool.query(sql, params);
  } catch (e) {
    console.warn(`[ocds-sync] Batch insert error: ${e.message.substring(0, 120)}`);
  }
}

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
