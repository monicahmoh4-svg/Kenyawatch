const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const zlib = require('zlib');
const readline = require('readline');
const { pool } = require('../db');
const { scoreContract } = require('../utils/riskEngine');

const OCDS_BASE = 'https://data.open-contracting.org/en/publication/147/download';
const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

function extractCounty(release) {
  if (release.parties) {
    const buyer = release.parties.find(p => p.roles && p.roles.includes('buyer'));
    if (buyer && buyer.name) return buyer.name;
  }
  if (release.buyer && release.buyer.name) return release.buyer.name;
  return null;
}

function extractSupplier(release) {
  if (release.awards && release.awards[0] && release.awards[0].suppliers) {
    return release.awards[0].suppliers[0]?.name || null;
  }
  return null;
}

function extractValue(release) {
  if (release.awards && release.awards[0] && release.awards[0].value) {
    return Math.round(release.awards[0].value.amount || 0);
  }
  if (release.contracts && release.contracts[0] && release.contracts[0].value) {
    return Math.round(release.contracts[0].value.amount || 0);
  }
  if (release.tender && release.tender.value) {
    return Math.round(release.tender.value.amount || 0);
  }
  return 0;
}

function extractDate(release) {
  if (release.awards && release.awards[0] && release.awards[0].date) return release.awards[0].date;
  if (release.contracts && release.contracts[0] && release.contracts[0].dateSigned) return release.contracts[0].dateSigned;
  if (release.tender && release.tender.tenderPeriod && release.tender.tenderPeriod.endDate) return release.tender.tenderPeriod.endDate;
  return null;
}

function extractYear(release) {
  const date = extractDate(release);
  if (date) {
    const y = new Date(date).getFullYear();
    if (y >= 2018 && y <= 2026) return y;
  }
  return null;
}

function extractTitle(release) {
  if (release.awards && release.awards[0] && release.awards[0].title) return release.awards[0].title;
  if (release.contracts && release.contracts[0] && release.contracts[0].title) return release.contracts[0].title;
  if (release.tender && release.tender.title) return release.tender.title;
  return null;
}

function extractSector(release) {
  if (release.tender && release.tender.mainProcurementCategory) return release.tender.mainProcurementCategory;
  if (release.tender && release.tender.additionalProcurementCategories && release.tender.additionalProcurementCategories[0]) {
    return release.tender.additionalProcurementCategories[0];
  }
  return null;
}

function extractBidType(release) {
  if (release.tender && release.tender.procurementMethod) return release.tender.procurementMethod;
  if (release.tender && release.tender.procurementMethodDetails) return release.tender.procurementMethodDetails;
  return null;
}

function extractStatus(release) {
  if (release.awards && release.awards[0] && release.awards[0].status) return release.awards[0].status;
  if (release.contracts && release.contracts[0] && release.contracts[0].status) return release.contracts[0].status;
  if (release.tender && release.tender.status) return release.tender.status;
  return null;
}

async function downloadYear(year) {
  const url = `${OCDS_BASE}?name=${year}.jsonl.gz`;
  console.log(`[ocds-sync] Downloading ${year} from ${url}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 600000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'KenyaWatch/3.0 (Procurement Transparency Platform)',
        'Accept-Encoding': 'gzip, deflate',
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);

    const gunzip = zlib.createGunzip();
    const stream = response.body.pipe(gunzip);
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    let batch = [];
    let added = 0;
    let total = 0;
    let skipped = 0;

    for await (const line of rl) {
      if (!line.trim()) continue;
      total++;

      try {
        const release = JSON.parse(line);
        const title = extractTitle(release);
        const valueKes = extractValue(release);

        if (!title && valueKes === 0) { skipped++; continue; }

        const contractYear = extractYear(release) || year;
        const contractId = `OCDS-${release.ocid || release.id || `rel-${total}`}`;
        const contractCounty = extractCounty(release);
        const supplier = extractSupplier(release);

        const contract = {
          contract_id: contractId,
          county: contractCounty,
          sector: extractSector(release),
          year: contractYear,
          title,
          supplier,
          value_kes: valueKes,
          bid_type: extractBidType(release),
          scope: release.tender?.description || title,
          award_date: extractDate(release),
          status: extractStatus(release),
          data_type: 'live_sync',
          source_name: 'PPIP OCDS - Kenya',
          source_url: 'https://tenders.go.ke/ocds',
        };

        const scored = scoreContract(contract);
        batch.push([
          contract.contract_id, contract.county, contract.sector, contract.year,
          contract.title, contract.supplier, contract.value_kes, contract.bid_type,
          contract.scope, contract.award_date, contract.status || 'active', scored.risk_score,
          JSON.stringify(scored.risk_flags), contract.data_type,
          contract.source_name, contract.source_url,
        ]);

        if (batch.length >= 500) {
          await insertBatch(batch);
          added += batch.length;
          batch = [];
          if (total % 1000 === 0) {
            console.log(`[ocds-sync] ${year}: ${total} processed, ${added} inserted, ${skipped} skipped`);
          }
        }
      } catch (e) {
        skipped++;
      }
    }

    if (batch.length > 0) {
      await insertBatch(batch);
      added += batch.length;
    }

    clearTimeout(timeout);

    await pool.query(
      'INSERT INTO ocds_sync_log (year,county,records_added,status) VALUES ($1,$2,$3,$4)',
      [year, null, added, 'ok']
    ).catch(() => {});

    console.log(`[ocds-sync] ${year} complete: ${total} releases, ${added} inserted, ${skipped} skipped`);
    return { year, total_releases: total, inserted: added, skipped };
  } catch (e) {
    clearTimeout(timeout);
    console.error(`[ocds-sync] ${year} failed:`, e.message);
    await pool.query(
      'INSERT INTO ocds_sync_log (year,county,records_added,status,error) VALUES ($1,$2,0,$3,$4)',
      [year, null, 'failed', e.message]
    ).catch(() => {});
    throw e;
  }
}

router.post('/ocds', async (req, res) => {
  const { year, years: requestedYears } = req.body || {};

  const yearsToSync = requestedYears || (year ? [Number(year)] : YEARS);

  console.log(`[ocds-sync] Starting sync for years: ${yearsToSync.join(', ')}`);

  res.json({
    status: 'started',
    years: yearsToSync,
    message: 'OCDS sync started in background',
  });

  for (const y of yearsToSync) {
    try {
      await downloadYear(y);
    } catch (e) {
      console.error(`[ocds-sync] Failed year ${y}:`, e.message);
    }
  }
  console.log('[ocds-sync] All years sync complete');
});

router.get('/ocds/status', async (_req, res) => {
  try {
    const r = await pool.query('SELECT * FROM ocds_sync_log ORDER BY created_at DESC LIMIT 20');
    const contractCount = await pool.query("SELECT COUNT(*) FROM contracts WHERE data_type = 'live_sync'");
    res.json({
      sync_log: r.rows,
      live_contracts: Number(contractCount.rows[0].count),
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load sync status' });
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
    console.warn(`[ocds-sync] Batch insert error: ${e.message.substring(0, 200)}`);
  }
}

module.exports = router;
