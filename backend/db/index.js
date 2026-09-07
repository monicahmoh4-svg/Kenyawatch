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

  const sectors = ['Infrastructure','Health','Education','Water','Agriculture','ICT','Transport','Energy'];
  const suppliers = ['Giant Construction Ltd', 'Savannah Engineering Co', 'Highway Builders Ltd', 'EastAfrica Contractors', 'Safeway Construction', 'Micom Construction Ltd', 'KenBuild Associates', 'AfriTech Solutions', 'BlueOcean Infrastructure', 'Prime Construction Group'];
  let id = 1;
  for (const c of counties) {
    for (let i = 0; i < 3; i++) {
      const sector = sectors[(id + i) % sectors.length];
      const year = 2021 + (id % 4);
      const value = 5000000 + ((id * 7919) % 400000000);
      const month = ((id % 12) + 1).toString().padStart(2, '0');
      const contract = {
        contract_id: `REF-${c.code}-${String(id).padStart(4,'0')}`,
        county: c.name, sector, year,
        title: `${sector} project in ${c.name} County`,
        supplier: suppliers[id % suppliers.length], value_kes: value,
        bid_type: ['open','limited','direct'][id % 3],
        scope: `${sector} works in ${c.name} County including planning, procurement, and construction supervision.`,
        award_date: `${year}-${month}-15`,
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
    { project_id: 'GP-ARRR-001', county: 'Baringo', title: 'Arror Dam Project', description: 'Multi-billion shilling dam project flagged in Auditor-General reports. Payments made but construction stalled. Site visits reveal minimal progress despite claimed 80% completion.', claimed_status: 'disputed', lat: 0.75, lng: 35.95, data_type: 'documented', source_name: 'Auditor-General of Kenya', source_url: 'https://www.ago.go.ke/reports' },
    { project_id: 'GP-KIMW-001', county: 'Elgeyo-Marakwet', title: 'Kimwarer Dam Project', description: 'Dam construction project under investigation. Oversight bodies questioned KES 7.2 billion in payments. Physical inspection shows incomplete infrastructure.', claimed_status: 'disputed', lat: 0.85, lng: 35.55, data_type: 'documented', source_name: 'Auditor-General of Kenya', source_url: 'https://www.ago.go.ke/reports' },
    { project_id: 'GP-KERI-001', county: 'Kericho', title: 'Kericho Water Supply Extension', description: 'Water extension project serving 50,000 residents. Contracts awarded but pipes remain uninstalled after 3 years. Community reports no water supply improvement.', claimed_status: 'suspicious', lat: -0.37, lng: 35.28, data_type: 'documented', source_name: 'Council of Governors', source_url: 'https://cog.go.ke' },
    { project_id: 'GP-MOMB-001', county: 'Mombasa', title: 'Mombasa-Nairobi Expressway Link', description: 'Road link project allocated KES 2.3 billion. Contractor mobilized but work stopped after 15% completion. County assembly flagged irregularities in tender process.', claimed_status: 'abandoned', lat: -4.04, lng: 39.67, data_type: 'documented', source_name: 'Kenya National Audit Office', source_url: 'https://www.ago.go.ke' },
    { project_id: 'GP-NAIRO-001', county: 'Nairobi', title: 'Nairobi Digital Market Hub', description: 'ICT hub project for Nairobi youth. KES 800 million allocated but only a signpost exists at the site. No construction activity recorded in 2 years.', claimed_status: 'ghost', lat: -1.29, lng: 36.82, data_type: 'documented', source_name: 'Business Daily Africa', source_url: 'https://www.businessdailyafrica.com' },
    { project_id: 'GP-KISUM-001', county: 'Kisumu', title: 'Kisumu Fish Processing Plant', description: 'Industrial fish processing facility promised to boost Lake Victoria fishing industry. KES 1.5 billion allocated. Site is overgrown with vegetation.', claimed_status: 'suspicious', lat: -0.10, lng: 34.76, data_type: 'documented', source_name: 'The Standard', source_url: 'https://www.standardmedia.co.ke' },
    { project_id: 'GP-NAKUR-001', county: 'Nakuru', title: 'Nakuru Industrial Park Phase 2', description: 'Second phase of industrial park. KES 3.2 billion allocated. Only perimeter fence constructed. No factory buildings or infrastructure inside.', claimed_status: 'abandoned', lat: -0.30, lng: 36.07, data_type: 'documented', source_name: 'Daily Nation', source_url: 'https://www.nation.africa' },
    { project_id: 'GP-TURK-001', county: 'Turkana', title: 'Turkana Wind Power Extension', description: 'Wind power extension project. KES 4.8 billion allocated. Turbines ordered but never delivered. Site shows only foundation preparations.', claimed_status: 'disputed', lat: 3.12, lng: 35.88, data_type: 'documented', source_name: 'Energy and Petroleum Regulatory Authority', source_url: 'https://www.epra.go.ke' },
    { project_id: 'GP-KILIF-001', county: 'Kilifi', title: 'Kilifi Beach Resort Development', description: 'Tourism infrastructure project. KES 900 million allocated. Resort foundation exists but construction halted. Contractor claims payment delays.', claimed_status: 'suspicious', lat: -3.63, lng: 39.85, data_type: 'documented', source_name: 'Coast Tourism Board', source_url: 'https://www.kenyacoast.go.ke' },
    { project_id: 'GP-MACH-001', county: 'Machakos', title: 'Machakos Level 5 Hospital Expansion', description: 'Hospital expansion to add 200 beds. KES 2.1 billion allocated. Only old wing demolished. New construction not started after 18 months.', claimed_status: 'abandoned', lat: -1.52, lng: 37.26, data_type: 'documented', source_name: 'Kenya Medical Association', source_url: 'https://www.kma.co.ke' }
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
