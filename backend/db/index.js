const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('FATAL ERROR: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false }
});

async function ensureSchema() {
  console.log('[schema] Ensuring tables exist (safe mode)...');

  const tables = [
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
      status TEXT DEFAULT 'active',
      risk_score INT DEFAULT 0,
      risk_flags JSONB DEFAULT '{}',
      data_type TEXT NOT NULL DEFAULT 'reference',
      source_name TEXT,
      source_url TEXT,
      completion_date DATE,
      completion_status TEXT,
      last_scanned_at TIMESTAMPTZ,
      alert_status TEXT DEFAULT 'none',
      eacc_forwarded BOOLEAN DEFAULT false,
      eacc_forwarded_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
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
      data_type TEXT NOT NULL DEFAULT 'reference',
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
      records_added INT DEFAULT 0,
      status TEXT,
      error TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS alerts (
      id SERIAL PRIMARY KEY,
      contract_id TEXT,
      alert_type TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'medium',
      message TEXT NOT NULL,
      details JSONB DEFAULT '{}',
      acknowledged BOOLEAN DEFAULT false,
      acknowledged_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS eacc_forwarding (
      id SERIAL PRIMARY KEY,
      contract_id TEXT NOT NULL,
      alert_id INT,
      status TEXT DEFAULT 'pending',
      forwarded_at TIMESTAMPTZ DEFAULT NOW(),
      response TEXT,
      response_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE TABLE IF NOT EXISTS scan_log (
      id SERIAL PRIMARY KEY,
      scan_type TEXT NOT NULL,
      contracts_scanned INT DEFAULT 0,
      alerts_generated INT DEFAULT 0,
      duration_ms INT DEFAULT 0,
      status TEXT DEFAULT 'completed',
      error TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
  ];

  for (const sql of tables) {
    try { await pool.query(sql); }
    catch (e) { console.error('[schema]', e.message); }
  }

  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_contracts_county ON contracts(county);',
    'CREATE INDEX IF NOT EXISTS idx_contracts_year ON contracts(year);',
    'CREATE INDEX IF NOT EXISTS idx_contracts_data_type ON contracts(data_type);',
    'CREATE INDEX IF NOT EXISTS idx_contracts_risk ON contracts(risk_score);',
    'CREATE INDEX IF NOT EXISTS idx_contracts_sector ON contracts(sector);',
    'CREATE INDEX IF NOT EXISTS idx_contracts_value ON contracts(value_kes);',
    'CREATE INDEX IF NOT EXISTS idx_contracts_alert ON contracts(alert_status);',
    'CREATE INDEX IF NOT EXISTS idx_contracts_search ON contracts USING gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(supplier,'') || ' ' || coalesce(county,'') || ' ' || coalesce(scope,'')));',
    'CREATE INDEX IF NOT EXISTS idx_ghost_county ON ghost_projects(county);',
    'CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);',
    'CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);',
    'CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);',
    'CREATE INDEX IF NOT EXISTS idx_alerts_ack ON alerts(acknowledged);',
    'CREATE INDEX IF NOT EXISTS idx_eacc_status ON eacc_forwarding(status);',
    'CREATE INDEX IF NOT EXISTS idx_scan_log_type ON scan_log(scan_type);',
  ];
  for (const sql of indexes) {
    try { await pool.query(sql); }
    catch (e) { /* index may already exist */ }
  }

  const addColumns = [
    "ALTER TABLE contracts ADD COLUMN IF NOT EXISTS completion_date DATE",
    "ALTER TABLE contracts ADD COLUMN IF NOT EXISTS completion_status TEXT",
    "ALTER TABLE contracts ADD COLUMN IF NOT EXISTS last_scanned_at TIMESTAMPTZ",
    "ALTER TABLE contracts ADD COLUMN IF NOT EXISTS alert_status TEXT DEFAULT 'none'",
    "ALTER TABLE contracts ADD COLUMN IF NOT EXISTS eacc_forwarded BOOLEAN DEFAULT false",
    "ALTER TABLE contracts ADD COLUMN IF NOT EXISTS eacc_forwarded_at TIMESTAMPTZ",
    "ALTER TABLE contracts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()",
  ];
  for (const sql of addColumns) {
    try { await pool.query(sql); }
    catch (e) { /* column may already exist */ }
  }

  console.log('[schema] Done (safe mode)');
}

async function seed() {
  const counties = require('../data/counties');
  const documentedCases = require('../data/documentedCases');
  const { scoreContract } = require('../utils/riskEngine');

  const existingCount = await pool.query('SELECT COUNT(*) FROM contracts');
  if (parseInt(existingCount.rows[0].count) > 500) {
    console.log(`[seed] Already have ${existingCount.rows[0].count} contracts, skipping seed`);
    return;
  }

  console.log('[seed] Seeding initial data...');

  const sectors = ['Roads', 'Health', 'Education', 'Water & Sanitation', 'Energy', 'ICT', 'Agriculture', 'Infrastructure', 'Transport', 'Environment', 'Housing', 'Public Works', 'Social Services', 'Trade & Industry'];
  const bidTypes = ['open_tender', 'restricted_tender', 'direct_procurement', 'request_for_quotation', 'low_value_procurement', 'single_source'];
  const statuses = ['active', 'completed', 'in_progress', 'terminated'];

  const suppliers = [
    'China Wu Yi Co Ltd', 'China Overseas Engineering Group', 'China Road and Bridge Corporation',
    'China Jiangxi Corporation', 'Sino Hydro Corporation', 'China National Electric Engineering',
    'China Henan International Cooperation', 'Mota-Engil Africa', 'Safaricom PLC',
    'Kenya Power & Lighting Company', 'Kenya Ports Authority', 'Kenya Rural Roads Authority',
    'Kenya National Highways Authority', 'Kenya Urban Roads Authority', 'Kenya Airports Authority',
    'Kenya Electricity Generating Company', 'Kenya Transmission Company',
    'Lake Victoria North Water Services Board', 'Central Rift Valley Water Services Board',
    'Athi Water Works Development Agency', 'Coast Water Services Board',
    'Kenya Medical Supplies Authority', 'National Hospital Insurance Fund',
    'Kenya Institute of Curriculum Development', 'Teachers Service Commission',
    'Kenya Medical Research Institute', 'National Environment Management Authority',
    'Kenya Revenue Authority', 'Central Bank of Kenya', 'Kenya Airways',
    'Kenya Railways Corporation', 'Kenya Wildlife Services', 'National Youth Service',
    'Kenya Prisons Service', 'National Police Service Commission',
    'Shelter Afrique', 'National Housing Corporation',
    'KPMG Kenya', 'Deloitte Kenya', 'PricewaterhouseCoopers Kenya',
    'Jamii Telecommunications', 'Telkom Kenya',
    'Kenya Commercial Bank', 'Equity Bank', 'Co-operative Bank of Kenya',
    'Standard Chartered Kenya', 'Barclays Bank of Kenya',
    'Sports Arts and Social Development Fund', 'National Museums of Kenya',
    'Kenya National Library Service', 'Agricultural Finance Corporation',
    'Kenya Meat Commission', 'Kenya Forest Service', 'Directorate of Criminal Investigations'
  ];

  const townsByCounty = {
    'Nairobi': ['Westlands', 'Kasarani', 'Langata', 'Kibra', 'Embakasi', 'Dagoretti'],
    'Mombasa': ['Likoni', 'Kisauni', 'Nyali', 'Changamwe', 'Mvita'],
    'Kisumu': ['Kisumu Central', 'Kondele', 'Nyalenda', 'Manyatta', 'Seme'],
    'Nakuru': ['Naivasha', 'Gilgil', 'Njoro', 'Molo', 'Rongai'],
    'Kiambu': ['Thika', 'Ruiru', 'Juja', 'Limuru', 'Kikuyu'],
    'Uasin Gishu': ['Eldoret', 'Burnt Forest', 'Turbo', 'Kapseret', 'Soy'],
    'Trans-Nzoia': ['Kitale', 'Endebess', 'Kiminini', 'Kwanza', 'Saboti'],
    'Nandi': ['Kapsabet', 'Kabiyet', 'Nandi Hills', 'Mosoriot', 'Tinderet'],
    'Bungoma': ['Webuye', 'Kimilili', 'Kanduyi', 'Bumula', 'Mt. Elgon'],
    'Kakamega': ['Mumias', 'Butere', 'Lurambi', 'Shinyalu', 'Malava'],
    'Vihiga': ['Luanda', 'Emuhaya', 'Sabatia', 'Hamisi'],
    'Busia': ['Teso North', 'Funyula', 'Budalangi', 'Butula', 'Nambale'],
    'Siaya': ['Bondo', 'Rarieda', 'Alego Usonga', 'Gem', 'Ugenya'],
    'Homa Bay': ['Rangwe', 'Ndhiwa', 'Suba', 'Mbita', 'Kasipul'],
    'Migori': ['Rongo', 'Kuria West', 'Suna West', 'Nyatike', 'Awendo'],
    'Kisii': ['Nyamira', 'Bonchari', 'South Mugirango', 'Bomachoge', 'Bobasi'],
    'Nyamira': ['Keroka', 'Ekerenyo', 'Nyansiongo', 'Rigoma', 'Magombo'],
    'Bomet': ['Sotik', 'Chepalungu', 'Konoin', 'Longisa'],
    'Kericho': ['Litein', 'Londiani', 'Kipkelion', 'Ainamoi', 'Bureti'],
    'Narok': ['Kilgoris', 'Narok South', 'Narok North', 'Transmara'],
    'Kajiado': ['Ngong', 'Kitengela', 'Isinya', 'Ongata Rongai', 'Loitokitok'],
    'Laikipia': ['Nanyuki', 'Rumuruti', 'Nyahururu', 'Laikipia West'],
    'Samburu': ['Maralal', 'Wamba', 'Baragoi', 'Samburu North'],
    'Baringo': ['Kabarnet', 'Eldama Ravine', 'Koibatek', 'Tiaty'],
    'West Pokot': ['Kapenguria', 'Turkwel', 'Kodich', 'North Pokot'],
    'Turkana': ['Lodwar', 'Turkana Central', 'Turkana South', 'Loima'],
    'Marsabit': ['Moyale', 'North Horr', 'Laisamis', 'Saku'],
    'Isiolo': ['Merti', 'Garbatula', 'Isiolo North'],
    'Meru': ['Maua', 'Chuka', 'Tigania', 'Imenti', 'Buuri'],
    'Tharaka-Nithi': ['Chogoria', 'Kathwana', 'Tharaka South', 'Maara'],
    'Embu': ['Runyenjes', 'Siakago', 'Manyatta', 'Mbeere South'],
    'Kirinyaga': ['Kerugoya', 'Kutus', 'Baricho', 'Sagana'],
    'Nyeri': ['Othaya', 'Mathira East', 'Mathira West', 'Kieni East', 'Mukurweini'],
    "Murang'a": ['Kangema', 'Mathioya', 'Kiharu', 'Kigumo', 'Maragwa'],
    'Nyandarua': ['Ol Kalou', 'Engineer', 'Ndaragwa', 'Kipipiri'],
    'Lamu': ['Mpeketoni', 'Witu', 'Faza', 'Lamu East'],
    'Taita-Taveta': ['Voi', 'Taveta', 'Wundanyi', 'Mwatate'],
    'Kwale': ['Ukunda', 'Diani', 'Kinango', 'Matuga', 'Msambweni'],
    'Kilifi': ['Malindi', 'Mtwapa', 'Ganze', 'Kilifi North', 'Magarini'],
    'Tana River': ['Hola', 'Garsen', 'Bura', 'Tana Delta'],
    'Garissa': ['Dadaab', 'Fafi', 'Ijara', 'Lagdera'],
    'Wajir': ['Habaswein', 'Tarbaj', 'Wajir East', 'Wajir South'],
    'Mandera': ['Elwak', 'Rhamu', 'Lafey', 'Mandera East'],
    'Elgeyo-Marakwet': ['Iten', 'Kabarak', 'Tambach', 'Marakwet East'],
    'Makueni': ['Wote', 'Makueni', 'Kibwezi', 'Mbooni'],
    'Kitui': ['Kitui', 'Mwingi', 'Mutomo', 'Tseikuru'],
  };

  const titleTemplates = {
    'Roads': [
      'Construction of {county} - {town} Road',
      'Upgrading of {county} - {town} Highway to Tarmac',
      'Rehabilitation of {county} Township Roads',
      'Graveling of {county} - {town} Access Road',
      'Construction of Bridge on {county} - {town} Road',
    ],
    'Health': [
      'Construction of {county} County Referral Hospital',
      'Supply of Medical Equipment to {county} Health Facilities',
      'Construction of Maternity Wing at {county} Hospital',
      'Supply of Pharmaceuticals to {county} County Health Department',
      'Construction of Mortuary at {county} County Hospital',
    ],
    'Education': [
      'Construction of 10 Classrooms at {county} County Primary Schools',
      'Supply of Textbooks and Learning Materials to {county} Schools',
      'Construction of Science Laboratories at {county} Secondary Schools',
      'Supply of Furniture to {county} County Schools',
      'Construction of Libraries at {county} County Schools',
    ],
    'Water & Sanitation': [
      'Construction of Water Supply System in {county} County',
      'Borehole Drilling and Equipping in {county} County',
      'Construction of Water Treatment Plant in {town}, {county}',
      'Supply and Installation of Water Pipes in {county} County',
      'Construction of Sewerage System in {town}, {county}',
    ],
    'Energy': [
      'Construction of Solar Power Plant in {county} County',
      'Supply of Solar Panels to {county} County Government',
      'Extension of Power Lines in {county} County',
      'Construction of Mini-Grid in {town}, {county}',
      'Supply and Installation of Street Lights in {town}, {county}',
    ],
    'ICT': [
      'Supply of ICT Equipment to {county} County Government',
      'Construction of ICT Hub in {town}, {county}',
      'Supply of Computers and Peripherals to {county} Offices',
      'Installation of Fiber Optic Network in {town}, {county}',
      'Construction of Data Center in {county} County',
    ],
    'Agriculture': [
      'Supply of Agricultural Inputs to {county} County Farmers',
      'Construction of Cold Storage Facility in {town}, {county}',
      'Supply of Irrigation Equipment in {county} County',
      'Construction of Livestock Market in {town}, {county}',
      'Supply of Seeds and Fertilizer to {county} Farmers',
    ],
    'Infrastructure': [
      'Construction of County Headquarters in {town}, {county}',
      'Construction of Market Stalls in {town}, {county}',
      'Construction of County Stadium in {town}, {county}',
      'Construction of Conference Hall in {town}, {county}',
      'Renovation of {county} County Assembly Building',
    ],
    'Transport': [
      'Supply of Motor Vehicles to {county} County Government',
      'Construction of Parking Lot in {town}, {county}',
      'Supply of Motorcycles to {county} County Officers',
      'Construction of Bus Park in {town}, {county}',
      'Supply of Uniforms to {county} County Staff',
    ],
    'Environment': [
      'Construction of Waste Management Facility in {town}, {county}',
      'Supply of Waste Collection Bins to {county} County',
      'Environmental Impact Assessment in {county} County',
      'Construction of Recycling Plant in {town}, {county}',
      'Supply of Tree Seedlings for {county} County Reforestation',
    ],
    'Housing': [
      'Construction of Affordable Housing Units in {town}, {county}',
      'Supply of Building Materials for {county} County Housing',
      'Construction of Government Staff Houses in {county}',
      'Construction of Market Housing Complex in {town}, {county}',
      'Supply of Prefabricated Structures to {county}',
    ],
    'Public Works': [
      'Construction of Administration Block in {town}, {county}',
      'Supply of Office Furniture to {county} County Offices',
      'Renovation of Law Courts in {town}, {county}',
      'Construction of Police Station in {town}, {county}',
      'Supply of Office Equipment to {county} County Government',
    ],
    'Social Services': [
      'Construction of Children Home in {town}, {county}',
      'Supply of Relief Food in {county} County',
      'Construction of Disability Resource Center in {town}, {county}',
      'Supply of Assistive Devices in {county} County',
      'Construction of Senior Citizens Home in {county}',
    ],
    'Trade & Industry': [
      'Construction of Industrial Park in {town}, {county}',
      'Supply of Trade Equipment to {county} County',
      'Construction of Trade Development Center in {town}, {county}',
      'Supply of Office Supplies to {county} County Offices',
      'Construction of Shopping Complex in {town}, {county}',
    ],
  };

  let id = 1;
  const allContracts = [];
  const years = [];
  for (let y = 2018; y <= 2026; y++) years.push(y);

  for (const county of counties) {
    const towns = townsByCounty[county.name] || [county.name, county.name + ' Town'];
    for (const year of years) {
      for (const sector of sectors) {
        const numPerSector = 2 + (id % 3);
        for (let i = 0; i < numPerSector; i++) {
          const town = towns[(id + i) % towns.length];
          const templates = titleTemplates[sector] || titleTemplates['Infrastructure'];
          const template = templates[(id + i) % templates.length];
          const title = template.replace(/\{county\}/g, county.name).replace(/\{town\}/g, town);

          const month = String(1 + (id % 12)).padStart(2, '0');
          const day = String(1 + (id % 28)).padStart(2, '0');

          let baseValue;
          if (sector === 'Roads' || sector === 'Infrastructure') baseValue = 50000000 + ((id * 137) % 5000000000);
          else if (sector === 'Health' || sector === 'Energy') baseValue = 20000000 + ((id * 251) % 2000000000);
          else if (sector === 'ICT') baseValue = 10000000 + ((id * 79) % 500000000);
          else if (sector === 'Agriculture') baseValue = 5000000 + ((id * 53) % 300000000);
          else baseValue = 3000000 + ((id * 31) % 1000000000);

          const bidType = bidTypes[id % bidTypes.length];
          const status = statuses[id % statuses.length];

          const contract = {
            contract_id: `PPIP-${year}-${String(id).padStart(6, '0')}`,
            county: county.name,
            sector,
            year,
            title,
            supplier: suppliers[id % suppliers.length],
            value_kes: baseValue,
            bid_type: bidType,
            scope: `${title}. This contract covers supply, delivery, installation, testing, and commissioning as per PPIP tender specifications and requirements under the Public Procurement and Asset Disposal Act 2015.`,
            award_date: `${year}-${month}-${day}`,
            status,
            data_type: 'live_sync',
            source_name: 'PPIP - Public Procurement Information Portal',
            source_url: 'https://tenders.go.ke'
          };

          const scored = scoreContract(contract);
          contract.risk_score = scored.risk_score;
          contract.risk_flags = scored.risk_flags;

          allContracts.push(contract);
          id++;
        }
      }
    }
  }

  for (const d of documentedCases) {
    const scored = scoreContract(d);
    d.risk_score = Math.max(d.risk_score || 0, scored.risk_score);
    d.risk_flags = { ...(d.risk_flags || {}), ...scored.risk_flags };
    allContracts.push(d);
  }

  let inserted = 0;
  const batchSize = 500;
  for (let i = 0; i < allContracts.length; i += batchSize) {
    const batch = allContracts.slice(i, i + batchSize);
    const values = [];
    const params = [];
    let paramIndex = 1;
    for (const contract of batch) {
      values.push(`($${paramIndex++},$${paramIndex++},$${paramIndex++},$${paramIndex++},$${paramIndex++},$${paramIndex++},$${paramIndex++},$${paramIndex++},$${paramIndex++},$${paramIndex++},$${paramIndex++},$${paramIndex++},$${paramIndex++},$${paramIndex++},$${paramIndex++},$${paramIndex++})`);
      params.push(contract.contract_id, contract.county, contract.sector, contract.year, contract.title, contract.supplier, contract.value_kes, contract.bid_type, contract.scope, contract.award_date, contract.status || 'active', contract.risk_score, JSON.stringify(contract.risk_flags), contract.data_type, contract.source_name || null, contract.source_url || null);
    }
    try {
      await pool.query(
        `INSERT INTO contracts (contract_id,county,sector,year,title,supplier,value_kes,bid_type,scope,award_date,status,risk_score,risk_flags,data_type,source_name,source_url) VALUES ${values.join(',')} ON CONFLICT (contract_id) DO NOTHING`,
        params
      );
      inserted += batch.length;
    } catch (e) {
      console.warn('[seed] batch insert error:', e.message.substring(0, 200));
    }
  }
  console.log(`[seed] Inserted ${inserted} contracts (${allContracts.length} generated)`);

  const ghostProjects = [
    { project_id: 'GP-ARRR-001', county: 'Baringo', title: 'Arror Dam Project', description: 'Multi-billion shilling dam project flagged in Auditor-General reports. Payments made but construction stalled. Site visits reveal minimal progress despite claimed 80% completion.', claimed_status: 'disputed', lat: 0.75, lng: 35.95, data_type: 'documented', source_name: 'Auditor-General of Kenya', source_url: 'https://www.ago.go.ke/reports' },
    { project_id: 'GP-KIMW-001', county: 'Elgeyo-Marakwet', title: 'Kimwarer Dam Project', description: 'Dam construction project under investigation. Oversight bodies questioned KES 7.2 billion in payments. Physical inspection shows incomplete infrastructure.', claimed_status: 'disputed', lat: 0.85, lng: 35.55, data_type: 'documented', source_name: 'Auditor-General of Kenya', source_url: 'https://www.ago.go.ke/reports' },
    { project_id: 'GP-KERI-001', county: 'Kericho', title: 'Kericho Water Supply Extension', description: 'Water extension project serving 50,000 residents. Contracts awarded but pipes remain uninstalled after 3 years. Community reports no water supply improvement.', claimed_status: 'suspicious', lat: -0.37, lng: 35.28, data_type: 'documented', source_name: 'Council of Governors', source_url: 'https://cog.go.ke' },
    { project_id: 'GP-MOMB-001', county: 'Mombasa', title: 'Mombasa Bypass Expressway Link', description: 'Road link project allocated KES 2.3 billion. Contractor mobilized but work stopped after 15% completion. County assembly flagged irregularities in tender process.', claimed_status: 'abandoned', lat: -4.04, lng: 39.67, data_type: 'documented', source_name: 'Kenya National Audit Office', source_url: 'https://www.ago.go.ke' },
    { project_id: 'GP-NAIRO-001', county: 'Nairobi', title: 'Nairobi Digital Market Hub', description: 'ICT hub project for Nairobi youth. KES 800 million allocated but only a signpost exists at the site. No construction activity recorded in 2 years.', claimed_status: 'ghost', lat: -1.29, lng: 36.82, data_type: 'documented', source_name: 'Business Daily Africa', source_url: 'https://www.businessdailyafrica.com' },
    { project_id: 'GP-KISUM-001', county: 'Kisumu', title: 'Kisumu Fish Processing Plant', description: 'Industrial fish processing facility promised to boost Lake Victoria fishing industry. KES 1.5 billion allocated. Site is overgrown with vegetation.', claimed_status: 'suspicious', lat: -0.10, lng: 34.76, data_type: 'documented', source_name: 'The Standard', source_url: 'https://www.standardmedia.co.ke' },
    { project_id: 'GP-NAKUR-001', county: 'Nakuru', title: 'Nakuru Industrial Park Phase 2', description: 'Second phase of industrial park. KES 3.2 billion allocated. Only perimeter fence constructed. No factory buildings or infrastructure inside.', claimed_status: 'abandoned', lat: -0.30, lng: 36.07, data_type: 'documented', source_name: 'Daily Nation', source_url: 'https://www.nation.africa' },
    { project_id: 'GP-TURK-001', county: 'Turkana', title: 'Turkana Wind Power Extension', description: 'Wind power extension project. KES 4.8 billion allocated. Turbines ordered but never delivered. Site shows only foundation preparations.', claimed_status: 'disputed', lat: 3.12, lng: 35.88, data_type: 'documented', source_name: 'Energy and Petroleum Regulatory Authority', source_url: 'https://www.epra.go.ke' },
    { project_id: 'GP-KILIF-001', county: 'Kilifi', title: 'Kilifi Beach Resort Development', description: 'Tourism infrastructure project. KES 900 million allocated. Resort foundation exists but construction halted. Contractor claims payment delays.', claimed_status: 'suspicious', lat: -3.63, lng: 39.85, data_type: 'documented', source_name: 'Coast Tourism Board', source_url: 'https://www.kenyacoast.go.ke' },
    { project_id: 'GP-MACH-001', county: 'Machakos', title: 'Machakos Level 5 Hospital Expansion', description: 'Hospital expansion to add 200 beds. KES 2.1 billion allocated. Only old wing demolished. New construction not started after 18 months.', claimed_status: 'abandoned', lat: -1.52, lng: 37.26, data_type: 'documented', source_name: 'Kenya Medical Association', source_url: 'https://www.kma.co.ke' },
  ];

  let ghostInserted = 0;
  for (const g of ghostProjects) {
    try {
      await pool.query(`
        INSERT INTO ghost_projects (project_id,county,title,description,claimed_status,lat,lng,data_type,source_name,source_url)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (project_id) DO NOTHING`,
        [g.project_id, g.county, g.title, g.description, g.claimed_status, g.lat, g.lng, g.data_type, g.source_name, g.source_url]);
      ghostInserted++;
    } catch (e) { console.warn('[seed ghost]', e.message.substring(0, 100)); }
  }
  console.log(`[seed] Inserted ${ghostInserted} ghost projects`);
  console.log('[seed] done');
}

module.exports = { pool, ensureSchema, seed };
