const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const zlib = require('zlib');
const readline = require('readline');
const { pool } = require('../db');
const { scoreContract } = require('../utils/riskEngine');
const counties = require('../data/counties');

const COUNTY_NAMES = counties.map(c => c.name.toLowerCase());

function extractCounty(buyerName) {
  if (!buyerName) return null;
  const name = buyerName.trim();

  for (const county of counties) {
    const low = county.name.toLowerCase();
    if (name.toLowerCase() === low) return county.name;
    if (name.toLowerCase().includes(low)) return county.name;
  }

  const patterns = [
    /(?:county government of|county assembly of|county department of)\s+(.+)/i,
    /(.+?)\s+(?:county government|county assembly|county department)/i,
  ];
  for (const pat of patterns) {
    const m = name.match(pat);
    if (m) {
      const candidate = m[1].trim().toLowerCase();
      for (const county of counties) {
        if (candidate === county.name.toLowerCase()) return county.name;
        if (candidate.includes(county.name.toLowerCase())) return county.name;
        if (county.name.toLowerCase().includes(candidate)) return county.name;
      }
    }
  }

  return null;
}

function mapSector(mainProcurementCategory, title) {
  const cat = (mainProcurementCategory || '').toLowerCase();
  const t = (title || '').toLowerCase();

  if (cat === 'works') {
    if (/road|highway|bridge|tarmac|gravel/i.test(t)) return 'Roads';
    if (/water|borehole|sewer|dam|irrigation/i.test(t)) return 'Water & Sanitation';
    if (/hospital|health|medical|clinic|maternity|mortuary/i.test(t)) return 'Health';
    if (/school|education|classroom|laboratory|library|dormitor/i.test(t)) return 'Education';
    if (/solar|power|electric|street.?light|energy|wind|mini.?grid/i.test(t)) return 'Energy';
    if (/market|stall|stadium|admin|office|conference|fire.?station|public.?toilet/i.test(t)) return 'Infrastructure';
    if (/housing|residential|flat|apartment|house/i.test(t)) return 'Housing';
    if (/prison|police|court|law|archives/i.test(t)) return 'Public Works';
    if (/waste|recycl|compost|sewage|tree.?plant|environmental/i.test(t)) return 'Environment';
    return 'Infrastructure';
  }
  if (cat === 'goods') {
    if (/medical|pharm|drug|hospital|ambulance|oxygen/i.test(t)) return 'Health';
    if (/textbook|book|learn|school|education|computer|ict|laptop/i.test(t)) return 'Education';
    if (/solar|power|electric|energy|panel|generator|light/i.test(t)) return 'Energy';
    if (/vehicle|car|motor|fuel|motorcycle|bicycle/i.test(t)) return 'Transport';
    if (/fertil|seed|farm|agric|livestock|cattle|fishing/i.test(t)) return 'Agriculture';
    if (/water|pipe|tank|borehole|tap/i.test(t)) return 'Water & Sanitation';
    if (/furniture|office|equipment|stationery|printing/i.test(t)) return 'Public Works';
    if (/computer|software|network|cctv|fiber|ict|server|data.?center/i.test(t)) return 'ICT';
    if (/food|relief|feeding/i.test(t)) return 'Social Services';
    return 'Public Works';
  }
  if (cat === 'services') {
    if (/consult|audit|survey|assessment|design|architect/i.test(t)) return 'Professional Services';
    if (/clean|security|guard|mainten|repair|service/i.test(t)) return 'Public Works';
    if (/medical|health|pharm/i.test(t)) return 'Health';
    if (/train|capacity.?build|workshop|education/i.test(t)) return 'Education';
    if (/transport|travel|logistic|delivery/i.test(t)) return 'Transport';
    return 'Public Works';
  }
  if (cat === 'consulting services') return 'Professional Services';

  if (/road|highway|bridge|tarmac/i.test(t)) return 'Roads';
  if (/medical|pharm|health|hospital/i.test(t)) return 'Health';
  if (/school|education|textbook/i.test(t)) return 'Education';
  if (/solar|power|electric|energy/i.test(t)) return 'Energy';
  if (/water|borehole|sewer/i.test(t)) return 'Water & Sanitation';
  if (/vehicle|car|motor|transport/i.test(t)) return 'Transport';
  if (/agric|farm|seed|fertil|livestock/i.test(t)) return 'Agriculture';
  if (/ict|computer|software|digital|fiber|cctv/i.test(t)) return 'ICT';
  if (/market|stall|stadium|admin/i.test(t)) return 'Infrastructure';
  if (/housing|residential/i.test(t)) return 'Housing';
  if (/waste|recycl|environment/i.test(t)) return 'Environment';
  if (/child|youth|disab|senior|social|relief|feeding/i.test(t)) return 'Social Services';
  if (/trade|industr|business|incubation|exhibition/i.test(t)) return 'Trade & Industry';

  return 'Unclassified';
}

function mapBidType(method) {
  const m = (method || '').toLowerCase();
  if (/open|public.*tender|competitive/i.test(m)) return 'open_tender';
  if (/restrict|invit/i.test(m)) return 'restricted_tender';
  if (/direct|sole|single/i.test(m)) return 'direct_procurement';
  if (/request.*for.*quo|rfq/i.test(m)) return 'request_for_quotation';
  if (/low.*value|micro|small/i.test(m)) return 'low_value_procurement';
  if (/negotiat/i.test(m)) return 'single_source';
  return m || 'unknown';
}

function parseAwardDate(release) {
  const d = release.awards?.[0]?.date || release.tender?.tenderPeriod?.endDate || release.date;
  if (!d) return null;
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return null;
    return dt.toISOString().slice(0, 10);
  } catch { return null; }
}

async function downloadAndParse(url, signal) {
  const response = await fetch(url, {
    signal,
    headers: { 'User-Agent': 'KenyaWatch/3.0', 'Accept-Encoding': 'gzip, deflate' },
    timeout: 120000,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
  return response.body;
}

router.post('/download-and-import', async (req, res) => {
  const { year } = req.body || {};
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 600000);

  const stats = { total: 0, inserted: 0, skipped: 0, errors: 0, countiesMatched: {} };

  try {
    const url = year
      ? `https://data.open-contracting.org/en/publication/147/download?name=${year}.jsonl.gz`
      : `https://data.open-contracting.org/en/publication/147/download?name=full.jsonl.gz`;

    console.log(`[ocds-import] Starting download from: ${url}`);
    const body = await downloadAndParse(url, controller.signal);

    const gunzip = zlib.createGunzip();
    const stream = body.pipe(gunzip);

    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    let batch = [];
    const BATCH_SIZE = 500;

    for await (const line of rl) {
      if (!line.trim()) continue;
      stats.total++;

      try {
        const release = JSON.parse(line);

        const contractId = `OCDS-${release.ocid || release.id || `rel-${stats.total}`}`;
        const county = extractCounty(release.buyer?.name);
        const sector = mapSector(release.tender?.mainProcurementCategory, release.tender?.title);
        const contractYear = release.date ? new Date(release.date).getFullYear() : null;
        const title = release.tender?.title || null;
        const supplier = release.awards?.[0]?.suppliers?.[0]?.name || null;
        const valueKes = Math.round(
          release.awards?.[0]?.value?.amount || release.tender?.value?.amount || 0
        );
        const bidType = mapBidType(release.tender?.procurementMethod);
        const scope = release.tender?.description || null;
        const awardDate = parseAwardDate(release);

        if (!title && !valueKes) { stats.skipped++; continue; }

        const contract = {
          contract_id: contractId, county, sector, year: contractYear, title,
          supplier, value_kes: valueKes, bid_type: bidType, scope,
          award_date: awardDate, data_type: 'live_sync',
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

        if (county) {
          stats.countiesMatched[county] = (stats.countiesMatched[county] || 0) + 1;
        }

        if (batch.length >= BATCH_SIZE) {
          await insertBatch(batch, stats);
          batch = [];
          if (stats.total % 1000 === 0) {
            console.log(`[ocds-import] Progress: ${stats.total} processed, ${stats.inserted} inserted, ${stats.errors} errors`);
          }
        }
      } catch (e) {
        stats.errors++;
        if (stats.errors <= 10) {
          console.warn(`[ocds-import] Record error: ${e.message.substring(0, 100)}`);
        }
      }
    }

    if (batch.length > 0) {
      await insertBatch(batch, stats);
    }

    clearTimeout(timeout);

    console.log(`[ocds-import] Complete: ${stats.total} total, ${stats.inserted} inserted, ${stats.skipped} skipped, ${stats.errors} errors`);

    res.json({
      success: true,
      stats: {
        total_processed: stats.total,
        inserted: stats.inserted,
        skipped: stats.skipped,
        errors: stats.errors,
        counties_matched: stats.countiesMatched,
      },
      source_url: url,
    });
  } catch (e) {
    clearTimeout(timeout);
    console.error(`[ocds-import] Fatal error: ${e.message}`);
    res.status(500).json({
      success: false,
      error: e.message,
      stats: {
        total_processed: stats.total,
        inserted: stats.inserted,
        skipped: stats.skipped,
        errors: stats.errors,
      },
    });
  }
});

async function insertBatch(batch, stats) {
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
    const result = await pool.query(sql, params);
    stats.inserted += result.rowCount || 0;
  } catch (e) {
    stats.errors++;
    console.warn(`[ocds-import] Batch insert error: ${e.message.substring(0, 120)}`);
  }
}

router.get('/import-status', async (_req, res) => {
  try {
    const totalRes = await pool.query('SELECT COUNT(*) FROM contracts');
    const byCountyRes = await pool.query(
      'SELECT county, COUNT(*) as count FROM contracts WHERE county IS NOT NULL GROUP BY county ORDER BY count DESC'
    );
    const byYearRes = await pool.query(
      'SELECT year, COUNT(*) as count FROM contracts WHERE year IS NOT NULL GROUP BY year ORDER BY year DESC'
    );
    const byDataTypeRes = await pool.query(
      'SELECT data_type, COUNT(*) as count FROM contracts GROUP BY data_type ORDER BY count DESC'
    );

    res.json({
      total_contracts: Number(totalRes.rows[0].count),
      by_county: byCountyRes.rows.map(r => ({ county: r.county, count: Number(r.count) })),
      by_year: byYearRes.rows.map(r => ({ year: r.year, count: Number(r.count) })),
      by_data_type: byDataTypeRes.rows.map(r => ({ data_type: r.data_type, count: Number(r.count) })),
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load import status', detail: e.message });
  }
});

router.post('/auto-import', async (_req, res) => {
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM contracts');
    const total = Number(countRes.rows[0].count);

    if (total >= 300000) {
      return res.json({ triggered: false, reason: `Already have ${total} contracts`, total });
    }

    console.log(`[ocds-import] Auto-import triggered: ${total} contracts < 300000 threshold`);

    const currentYear = new Date().getFullYear();
    const targetYears = [];
    for (let y = currentYear; y >= 2018; y--) {
      targetYears.push(y);
    }

    res.json({
      triggered: true,
      reason: `Low contract count (${total}), importing years 2018-${currentYear}`,
      target_years: targetYears,
      total,
      message: 'Import jobs started. Use GET /api/ocds/import-status to monitor progress.',
    });

    for (const yr of targetYears) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 600000);
      const stats = { total: 0, inserted: 0, skipped: 0, errors: 0, countiesMatched: {} };

      try {
        const url = `https://data.open-contracting.org/en/publication/147/download?name=${yr}.jsonl.gz`;
        console.log(`[ocds-auto] Importing ${yr} from ${url}`);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'KenyaWatch/3.0', 'Accept-Encoding': 'gzip, deflate' },
          timeout: 120000,
        });
        if (!response.ok) {
          console.warn(`[ocds-auto] ${yr}: HTTP ${response.status}`);
          clearTimeout(timeout);
          continue;
        }

        const gunzip = zlib.createGunzip();
        const stream = response.body.pipe(gunzip);
        const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
        let batch = [];

        for await (const line of rl) {
          if (!line.trim()) continue;
          stats.total++;
          try {
            const release = JSON.parse(line);
            const contractId = `OCDS-${release.ocid || release.id || `rel-${stats.total}`}`;
            const county = extractCounty(release.buyer?.name);
            const sector = mapSector(release.tender?.mainProcurementCategory, release.tender?.title);
            const title = release.tender?.title || null;
            const supplier = release.awards?.[0]?.suppliers?.[0]?.name || null;
            const valueKes = Math.round(
              release.awards?.[0]?.value?.amount || release.tender?.value?.amount || 0
            );
            const bidType = mapBidType(release.tender?.procurementMethod);
            const scope = release.tender?.description || null;
            const awardDate = parseAwardDate(release);

            if (!title && !valueKes) { stats.skipped++; continue; }

            const contract = {
              contract_id: contractId, county, sector, year: yr, title,
              supplier, value_kes: valueKes, bid_type: bidType, scope,
              award_date: awardDate, data_type: 'live_sync',
              source_name: 'PPIP OCDS - Kenya', source_url: 'https://tenders.go.ke/ocds',
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
              await insertBatch(batch, stats);
              batch = [];
            }
          } catch (e) { stats.errors++; }
        }

        if (batch.length > 0) await insertBatch(batch, stats);
        clearTimeout(timeout);

        console.log(`[ocds-auto] ${yr}: ${stats.total} total, ${stats.inserted} inserted, ${stats.errors} errors`);

        await pool.query(
          'INSERT INTO ocds_sync_log (year,county,records_added,status) VALUES ($1,$2,$3,$4)',
          [yr, null, stats.inserted, 'ok']
        ).catch(() => {});
      } catch (e) {
        clearTimeout(timeout);
        console.warn(`[ocds-auto] ${yr} failed: ${e.message.substring(0, 100)}`);
        await pool.query(
          'INSERT INTO ocds_sync_log (year,county,records_added,status,error) VALUES ($1,$2,0,$3,$4)',
          [yr, null, 'failed', e.message.substring(0, 200)]
        ).catch(() => {});
      }
    }
  } catch (e) {
    res.status(500).json({ error: 'Auto-import failed', detail: e.message });
  }
});

function parseRelease(release, fallbackYear) {
  const contractId = `OCDS-${release.ocid || release.id || `rel-${Date.now()}`}`;
  const county = extractCounty(release.buyer?.name);
  const sector = mapSector(release.tender?.mainProcurementCategory, release.tender?.title);
  const contractYear = release.date ? new Date(release.date).getFullYear() : fallbackYear;
  const title = release.tender?.title || null;
  const supplier = release.awards?.[0]?.suppliers?.[0]?.name || null;
  const valueKes = Math.round(release.awards?.[0]?.value?.amount || release.tender?.value?.amount || 0);
  const bidType = mapBidType(release.tender?.procurementMethod);
  const scope = release.tender?.description || null;
  const awardDate = parseAwardDate(release);
  if (!title && !valueKes) return null;
  const contract = {
    contract_id: contractId, county, sector, year: contractYear, title,
    supplier, value_kes: valueKes, bid_type: bidType, scope,
    award_date: awardDate, data_type: 'live_sync',
    source_name: 'PPIP OCDS - Kenya', source_url: 'https://tenders.go.ke/ocds',
  };
  const scored = scoreContract(contract);
  return [
    contract.contract_id, contract.county, contract.sector, contract.year,
    contract.title, contract.supplier, contract.value_kes, contract.bid_type,
    contract.scope, contract.award_date, 'active', scored.risk_score,
    JSON.stringify(scored.risk_flags), contract.data_type,
    contract.source_name, contract.source_url,
  ];
}

async function importYearData(year) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 600000);
  const stats = { total: 0, inserted: 0, skipped: 0, errors: 0 };
  try {
    const url = `https://data.open-contracting.org/en/publication/147/download?name=${year}.jsonl.gz`;
    console.log(`[ocds-import] Downloading ${year} data from ${url}`);
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
    for await (const line of rl) {
      if (!line.trim()) continue;
      stats.total++;
      try {
        const release = JSON.parse(line);
        const contract = parseRelease(release, year);
        if (contract) batch.push(contract);
        if (batch.length >= 500) { await insertBatch(batch, stats); batch = []; }
      } catch (e) { stats.errors++; }
    }
    if (batch.length > 0) await insertBatch(batch, stats);
    clearTimeout(timeout);
    console.log(`[ocds-import] ${year}: ${stats.total} total, ${stats.inserted} inserted, ${stats.errors} errors`);
    await pool.query('INSERT INTO ocds_sync_log (year,county,records_added,status) VALUES ($1,$2,$3,$4)', [year, null, stats.inserted, 'ok']).catch(() => {});
    return stats;
  } catch (e) {
    clearTimeout(timeout);
    console.warn(`[ocds-import] ${year} failed: ${e.message.substring(0, 100)}`);
    throw e;
  }
}

module.exports = router;
module.exports.importYearData = importYearData;
