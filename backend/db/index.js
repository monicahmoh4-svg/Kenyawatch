const { Pool } = require('pg');

// Fail fast with a clear message if DATABASE_URL is missing
if (!process.env.DATABASE_URL) {
  console.error('FATAL ERROR: DATABASE_URL environment variable is not set.');
  console.error('Please add your Render PostgreSQL connection string to the Environment Variables in the Render Dashboard.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false }
});

async function ensureSchema() {
  const steps = [
    `CREATE TABLE IF NOT EXISTS contracts (
      id SERIAL PRIMARY KEY,
      contract_id TEXT UNIQUE,
      county TEXT,
      sector TEXT,
      year INT,
      title TEXT,
      supplier TEXT,
      value_kes BIGINT,
      bid_type TEXT,
      scope TEXT,
      award_date DATE,
      risk_score INT,
      risk_flags JSONB,
      data_type TEXT NOT NULL CHECK (data_type IN ('documented','live_sync','manual_scan','reference')),
      source_name TEXT,
      source_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    `CREATE TABLE IF NOT EXISTS ghost_projects (
      id SERIAL PRIMARY KEY,
      project_id TEXT UNIQUE,
      county TEXT,
      title TEXT,
      description TEXT,
      claimed_status TEXT,
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      data_type TEXT NOT NULL CHECK (data_type IN ('documented','live_sync','manual_scan','reference')),
      source_name TEXT,
      source_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    `CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      case_number TEXT UNIQUE,
      county TEXT,
      category TEXT,
      summary TEXT,
      details TEXT,
      status TEXT DEFAULT 'received',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    `CREATE TABLE IF NOT EXISTS ocds_sync_log (
      id SERIAL PRIMARY KEY,
      year INT,
      county TEXT,
      records_added INT,
      status TEXT,
      error TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`
  ];

  for (const sql of steps) {
    try { await pool.query(sql); }
    catch (e) { console.error('[schema]', e.message); }
  }

  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_contracts_county ON contracts(county);',
    'CREATE INDEX IF NOT EXISTS idx_contracts_year ON contracts(year);',
    'CREATE INDEX IF NOT EXISTS idx_contracts_data_type ON contracts(data_type);',
    'CREATE INDEX IF NOT EXISTS idx_contracts_risk ON contracts(risk_score);',
    'CREATE INDEX IF NOT EXISTS idx_ghost_county ON ghost_projects(county);',
    'CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);'
  ];
  for (const sql of indexes) {
    try { await pool.query(sql); }
    catch (e) { console.warn('[index skipped]', e.message); }
  }
}

async function seed() {
  const counties = require('../data/counties');
  const documentedCases = require('../data/documentedCases');
  const { scoreContract } = require('../utils/riskEngine');

  const sectors = ['Infrastructure','Health','Education','Water','Agriculture','ICT'];
  let id = 1;
  for (const c of counties) {
    for (let i = 0; i < 3; i++) {
      const sector = sectors[(id + i) % sectors.length];
      const year = 2021 + (id % 4);
      const value = 5000000 + ((id * 7919) % 400000000);
      const contract = { 
        contract_id: `REF-${c.code}-${String(id).padStart(4,'0')}`,
        county: c.name, sector, year, 
        title: `${sector} project — ${c.name} (illustrative)`, 
        supplier: `Supplier-${id}`, value_kes: value, 
        bid_type: ['open','limited','direct'][id % 3], 
        scope: `Illustrative scope for ${sector.toLowerCase()} works in ${c.name}.`, 
        award_date: `${year}-0${(id % 9) + 1}-15`, 
        data_type: 'reference' 
      };
      const scored = scoreContract(contract);
      try {
        await pool.query(`
          INSERT INTO contracts (contract_id,county,sector,year,title,supplier,value_kes,bid_type,scope,award_date,risk_score,risk_flags,data_type)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
          ON CONFLICT (contract_id) DO NOTHING`,
          [contract.contract_id,contract.county,contract.sector,contract.year,contract.title,contract.supplier,contract.value_kes,contract.bid_type,contract.scope,contract.award_date,scored.risk_score,JSON.stringify(scored.risk_flags),contract.data_type]);
      } catch (e) { console.warn('[seed ref]', e.message); }
      id++;
    }
  }

  for (const d of documentedCases) {
    try {
      await pool.query(`
        INSERT INTO contracts (contract_id,county,sector,year,title,supplier,value_kes,bid_type,scope,award_date,risk_score,risk_flags,data_type,source_name,source_url)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        ON CONFLICT (contract_id) DO UPDATE SET risk_score=EXCLUDED.risk_score, risk_flags=EXCLUDED.risk_flags`,
        [d.contract_id,d.county,d.sector,d.year,d.title,d.supplier,d.value_kes,d.bid_type,d.scope,d.award_date,d.risk_score,JSON.stringify(d.risk_flags),d.data_type,d.source_name,d.source_url]);
    } catch (e) { console.warn('[seed doc]', e.message); }
  }

  const ghosts = [
    { project_id: 'GP-ARRR-001', county: 'Baringo', title: 'Arror Dam (documented)', description: 'Flagged in Auditor-General reports.', claimed_status: 'disputed', lat: 0.75, lng: 35.95, data_type: 'documented', source_name: 'Auditor-General', source_url: 'https://www.ago.go.ke/reports' },
    { project_id: 'GP-KIMW-001', county: 'Elgeyo-Marakwet', title: 'Kimwarer Dam (documented)', description: 'Payments questioned by oversight bodies.', claimed_status: 'disputed', lat: 0.85, lng: 35.55, data_type: 'documented', source_name: 'Auditor-General', source_url: 'https://www.ago.go.ke/reports' }
  ];
  for (const g of ghosts) {
    try { 
      await pool.query(`
        INSERT INTO ghost_projects (project_id,county,title,description,claimed_status,lat,lng,data_type,source_name,source_url)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (project_id) DO NOTHING`, 
        [g.project_id,g.county,g.title,g.description,g.claimed_status,g.lat,g.lng,g.data_type,g.source_name,g.source_url]); 
    } catch (e) { console.warn('[seed ghost]', e.message); }
  }
  console.log('[seed] done');
}

module.exports = { pool, ensureSchema, seed };
