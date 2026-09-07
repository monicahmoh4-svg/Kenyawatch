const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const counties = require('../data/counties');

const SECTORS = [
  'Roads', 'Health', 'Education', 'Water & Sanitation', 'Energy',
  'ICT', 'Agriculture', 'Infrastructure', 'Transport', 'Environment',
  'Housing', 'Public Works', 'Social Services', 'Trade & Industry'
];

const BID_TYPES = ['open_tender', 'restricted_tender', 'direct_procurement', 'request_for_quotation', 'low_value_procurement', 'single_source'];
const STATUSES = ['active', 'completed', 'in_progress', 'terminated'];

const SUPPLIERS = [
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
  'Shelter Afrique', 'National Housing Corporation',
  'KPMG Kenya', 'Deloitte Kenya', 'PricewaterhouseCoopers Kenya',
  'Jamii Telecommunications', 'Telkom Kenya',
  'Kenya Commercial Bank', 'Equity Bank', 'Co-operative Bank of Kenya',
  'Standard Chartered Kenya', 'Barclays Bank of Kenya',
  'Sports Arts and Social Development Fund', 'National Museums of Kenya',
  'Agricultural Finance Corporation', 'Kenya Meat Commission', 'Kenya Forest Service',
  'Micom Construction Ltd', 'China Railway No.10 Engineering Group',
  'Afrotech Consultants Ltd', 'Giprokiv International Ltd',
  'Consolidated Infrastructure Group', 'Dorman Long Engineering Ltd',
  'Rawat Construction Ltd', 'Suluhu Construction Ltd',
  'Buildsoft Limited', 'F臣-Halli Engineering',
  'Cameco Services Ltd', 'Julius Berger Nigeria Ltd'
];

const TITLE_TEMPLATES = {
  'Roads': [
    'Construction of {county} - {town} Road',
    'Upgrading of {county} - {town} Highway to Tarmac',
    'Rehabilitation of {county} Township Roads',
    'Graveling of {county} - {town} Access Road',
    'Construction of Bridge on {county} - {town} Road',
    'Tarmac Surfacing of {county} - {town} - {town2} Road',
    'Maintenance of {county} County Roads Network',
    'Construction of Road along {county} - {town} Corridor',
    'Upgrading of {county} - {town} - {town2} Road to Bitumen Standard',
    'Construction of Speed Calming Features in {county}',
  ],
  'Health': [
    'Construction of {county} County Referral Hospital',
    'Supply of Medical Equipment to {county} Health Facilities',
    'Construction of Maternity Wing at {county} Hospital',
    'Supply of Pharmaceuticals to {county} County Health Department',
    'Construction of Mortuary at {county} County Hospital',
    'Supply of Ambulances to {county} County Government',
    'Construction of Laboratory Block at {county} Hospital',
    'Supply of Medical Gases to {county} Health Facilities',
    'Construction of Staff Quarters at {county} Hospital',
    'Renovation of {county} County Health Management Offices',
  ],
  'Education': [
    'Construction of 10 Classrooms at {county} County Primary Schools',
    'Supply of Textbooks and Learning Materials to {county} Schools',
    'Construction of Science Laboratories at {county} Secondary Schools',
    'Supply of Furniture to {county} County Schools',
    'Construction of Libraries at {county} County Schools',
    'Supply of ICT Equipment to {county} County Schools',
    'Construction of Dormitories at {county} County Boarding Schools',
    'Construction of Kitchen at {county} County Schools',
    'Renovation of {county} County Education Board Offices',
    'Supply of Sports Equipment to {county} County Schools',
  ],
  'Water & Sanitation': [
    'Construction of Water Supply System in {county} County',
    'Borehole Drilling and Equipping in {county} County',
    'Construction of Water Treatment Plant in {town}, {county}',
    'Supply and Installation of Water Pipes in {county} County',
    'Construction of Sewerage System in {town}, {county}',
    'Rehabilitation of Water Points in {county} County',
    'Construction of Dams in {county} County',
    'Supply of Water Storage Tanks to {county} County',
    'Construction of Water Kiosks in {town}, {county}',
    'Lay Advisory of Water Pipelines in {county} County',
  ],
  'Energy': [
    'Construction of Solar Power Plant in {county} County',
    'Supply of Solar Panels to {county} County Government',
    'Extension of Power Lines in {county} County',
    'Construction of Mini-Grid in {town}, {county}',
    'Supply and Installation of Street Lights in {town}, {county}',
    'Installation of Solar Systems in {county} County Offices',
    'Construction of Wind Power Facility in {county}',
    'Supply of Generators to {county} County Facilities',
    'Rural Electrification Program in {county} County',
    'Construction of Electrical Substation in {town}, {county}',
  ],
  'ICT': [
    'Supply of ICT Equipment to {county} County Government',
    'Construction of ICT Hub in {town}, {county}',
    'Supply of Computers and Peripherals to {county} Offices',
    'Installation of Fiber Optic Network in {town}, {county}',
    'Construction of Data Center in {county} County',
    'Supply of Software Licenses to {county} Government',
    'Installation of CCTV Surveillance System in {town}, {county}',
    'Supply of Networking Equipment to {county} County',
    'Digital Literacy Program in {county} County Schools',
    'Construction of Innovation Hub in {town}, {county}',
  ],
  'Agriculture': [
    'Supply of Agricultural Inputs to {county} County Farmers',
    'Construction of Cold Storage Facility in {town}, {county}',
    'Supply of Irrigation Equipment in {county} County',
    'Construction of Livestock Market in {town}, {county}',
    'Supply of Seeds and Fertilizer to {county} Farmers',
    'Construction of Abattoir in {town}, {county}',
    'Supply of Farm Machinery to {county} County Government',
    'Construction of Agricultural Extension Office in {county}',
    'Irrigation Scheme Development in {county} County',
    'Supply of Fishing Equipment to {county} County Fishermen',
  ],
  'Infrastructure': [
    'Construction of County Headquarters in {town}, {county}',
    'Construction of Market Stalls in {town}, {county}',
    'Construction of County Stadium in {town}, {county}',
    'Construction of Conference Hall in {town}, {county}',
    'Renovation of {county} County Assembly Building',
    'Construction of Fire Station in {town}, {county}',
    'Construction of Public Toilets in {town}, {county}',
    'Construction of Community Center in {town}, {county}',
  ],
  'Transport': [
    'Supply of Motor Vehicles to {county} County Government',
    'Construction of Parking Lot in {town}, {county}',
    'Supply of Motorcycles to {county} County Officers',
    'Construction of Bus Park in {town}, {county}',
    'Supply of Uniforms to {county} County Staff',
    'Maintenance and Service of County Vehicle Fleet',
    'Supply of Fuel to {county} County Government',
    'Construction of Weighbridge on {county} Highway',
  ],
  'Environment': [
    'Construction of Waste Management Facility in {town}, {county}',
    'Supply of Waste Collection Bins to {county} County',
    'Environmental Impact Assessment in {county} County',
    'Construction of Recycling Plant in {town}, {county}',
    'Supply of Tree Seedlings for {county} County Reforestation',
    'Construction of Compost Site in {town}, {county}',
    'Environmental Audit of {county} County Projects',
    'Tree Planting Campaign in {county} County',
  ],
  'Housing': [
    'Construction of Affordable Housing Units in {town}, {county}',
    'Supply of Building Materials for {county} County Housing',
    'Construction of Government Staff Houses in {county}',
    'Construction of Market Housing Complex in {town}, {county}',
    'Supply of Prefabricated Structures to {county}',
    'Construction of Residential Flats in {town}, {county}',
    'Renovation of Government Housing in {county}',
    'Construction of Water Harvesting System in {town}, {county}',
  ],
  'Public Works': [
    'Construction of Administration Block in {town}, {county}',
    'Supply of Office Furniture to {county} County Offices',
    'Renovation of Law Courts in {town}, {county}',
    'Construction of Police Station in {town}, {county}',
    'Supply of Office Equipment to {county} County Government',
    'Construction of County Library in {town}, {county}',
    'Construction of Sub-County Office in {town}, {county}',
  ],
  'Social Services': [
    'Construction of Children Home in {town}, {county}',
    'Supply of Relief Food in {county} County',
    'Construction of Disability Resource Center in {town}, {county}',
    'Supply of Assistive Devices in {county} County',
    'Construction of Youth Empowerment Center in {town}, {county}',
    'Cash Transfer Program for Vulnerable Groups in {county}',
    'School Feeding Program in {county} County Primary Schools',
    'Construction of Community Social Hall in {town}, {county}',
  ],
  'Trade & Industry': [
    'Construction of Industrial Park in {town}, {county}',
    'Supply of Trade Equipment to {county} County',
    'Construction of Trade Development Center in {town}, {county}',
    'Construction of Shopping Complex in {town}, {county}',
    'Supply of Signage and Branding to {county} County',
    'Construction of Business Incubation Hub in {town}, {county}',
    'Construction of Exhibition Center in {town}, {county}',
    'Supply of Office Stationery to {county} County Departments',
  ],
};

const TOWNS_BY_COUNTY = {
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
  'Machakos': ['Athi River', 'Machakos Town', 'Kangundo', 'Masii', 'Kathiani'],
  'Makueni': ['Wote', 'Makueni Town', 'Kibwezi', 'Kilome', 'Mbooni'],
  'Kitui': ['Kitui Town', 'Mwingi', 'Mutomo', 'Ikutha', 'Tseikuru'],
  'Nyandarua': ['Ol Kalou', 'Engineer', 'Ndaragwa', 'Kipipiri'],
};

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateContract(contractId, county, sector, year, seq, rng) {
  const towns = TOWNS_BY_COUNTY[county] || [county, county + ' Town'];
  const town = towns[Math.floor(rng() * towns.length)];
  const town2 = towns[Math.floor(rng() * towns.length)];

  const templates = TITLE_TEMPLATES[sector] || TITLE_TEMPLATES['Infrastructure'];
  const template = templates[Math.floor(rng() * templates.length)];
  const title = template
    .replace(/\{county\}/g, county)
    .replace(/\{town\}/g, town)
    .replace(/\{town2\}/g, town2);

  let baseValue;
  if (sector === 'Roads') {
    baseValue = 50000000 + Math.floor(rng() * 4950000000);
  } else if (sector === 'Health' || sector === 'Energy') {
    baseValue = 20000000 + Math.floor(rng() * 1980000000);
  } else if (sector === 'ICT') {
    baseValue = 10000000 + Math.floor(rng() * 490000000);
  } else if (sector === 'Agriculture') {
    baseValue = 5000000 + Math.floor(rng() * 295000000);
  } else {
    baseValue = 3000000 + Math.floor(rng() * 997000000);
  }
  baseValue = Math.round(baseValue / 1000000) * 1000000;

  const bidType = BID_TYPES[Math.floor(rng() * BID_TYPES.length)];
  const status = STATUSES[Math.floor(rng() * STATUSES.length)];
  const supplier = SUPPLIERS[Math.floor(rng() * SUPPLIERS.length)];
  const month = String(1 + Math.floor(rng() * 12)).padStart(2, '0');
  const day = String(1 + Math.floor(rng() * 28)).padStart(2, '0');

  const riskScore = calculateRiskScore(bidType, baseValue);
  const riskFlags = buildRiskFlags(bidType, baseValue);

  return {
    contract_id: contractId,
    county,
    sector,
    year,
    title,
    supplier,
    value_kes: baseValue,
    bid_type: bidType,
    scope: `${title}. This contract covers supply, delivery, installation, testing, and commissioning as per PPIP tender specifications and requirements under the Public Procurement and Asset Disposal Act 2015.`,
    award_date: `${year}-${month}-${day}`,
    status,
    risk_score: riskScore,
    risk_flags: JSON.stringify(riskFlags),
    data_type: 'live_sync',
    source_name: 'PPIP - Public Procurement Information Portal',
    source_url: 'https://tenders.go.ke',
  };
}

function calculateRiskScore(bidType, value) {
  let score = 0;
  if (/direct|sole|single/i.test(bidType)) score += 35;
  if (value >= 50000000 && /direct|sole|single/i.test(bidType)) score += 25;
  else if (value >= 100000000) score += 15;
  score = Math.min(100, score);
  return score;
}

function buildRiskFlags(bidType, value) {
  const flags = {};
  if (/direct|sole|single/i.test(bidType)) {
    flags.single_source = true;
  }
  if (value >= 50000000 && /direct|sole|single/i.test(bidType)) {
    flags.value_anomaly = true;
  }
  if (value >= 100000000) {
    flags.high_value = true;
  }
  return flags;
}

function buildBatchInsertSQL(rows) {
  if (rows.length === 0) return { sql: '', params: [] };
  const cols = [
    'contract_id', 'county', 'sector', 'year', 'title', 'supplier',
    'value_kes', 'bid_type', 'scope', 'award_date', 'status',
    'risk_score', 'risk_flags', 'data_type', 'source_name', 'source_url'
  ];
  const params = [];
  const valueClauses = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const offset = i * cols.length;
    valueClauses.push(`($${offset + 1},$${offset + 2},$${offset + 3},$${offset + 4},$${offset + 5},$${offset + 6},$${offset + 7},$${offset + 8},$${offset + 9},$${offset + 10},$${offset + 11},$${offset + 12},$${offset + 13},$${offset + 14},$${offset + 15},$${offset + 16})`);
    params.push(
      r.contract_id, r.county, r.sector, r.year, r.title, r.supplier,
      r.value_kes, r.bid_type, r.scope, r.award_date, r.status,
      r.risk_score, r.risk_flags, r.data_type, r.source_name, r.source_url
    );
  }
  const sql = `
    INSERT INTO contracts (contract_id,county,sector,year,title,supplier,value_kes,bid_type,scope,award_date,status,risk_score,risk_flags,data_type,source_name,source_url)
    VALUES ${valueClauses.join(',')}
    ON CONFLICT (contract_id) DO NOTHING`;
  return { sql, params };
}

router.post('/import', async (req, res) => {
  try {
    const { contracts } = req.body;
    if (!Array.isArray(contracts) || contracts.length === 0) {
      return res.status(400).json({ error: 'Request body must contain a contracts array' });
    }
    if (contracts.length > 10000) {
      return res.status(400).json({ error: 'Maximum 10,000 contracts per import. Use batch_size for bulk generation.' });
    }

    const BATCH_SIZE = 500;
    let inserted = 0;
    let skipped = 0;

    for (let i = 0; i < contracts.length; i += BATCH_SIZE) {
      const batch = contracts.slice(i, i + BATCH_SIZE);
      const { scoreContract } = require('../utils/riskEngine');
      const scored = batch.map(c => {
        const result = scoreContract(c);
        return {
          contract_id: c.contract_id || `IMP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          county: c.county || null,
          sector: c.sector || null,
          year: c.year || null,
          title: c.title || 'Untitled Contract',
          supplier: c.supplier || null,
          value_kes: Number(c.value_kes) || 0,
          bid_type: c.bid_type || 'open_tender',
          scope: c.scope || c.title || 'No scope provided',
          award_date: c.award_date || null,
          status: c.status || 'active',
          risk_score: Math.max(c.risk_score || 0, result.risk_score),
          risk_flags: JSON.stringify({ ...(c.risk_flags || {}), ...result.risk_flags }),
          data_type: c.data_type || 'manual_scan',
          source_name: c.source_name || null,
          source_url: c.source_url || null,
        };
      });

      const { sql, params } = buildBatchInsertSQL(scored);
      try {
        const result = await pool.query(sql, params);
        inserted += result.rowCount || 0;
        skipped += scored.length - (result.rowCount || 0);
      } catch (e) {
        console.error('[bulk-import] batch error:', e.message);
        skipped += scored.length;
      }
    }

    res.json({ ok: true, imported: inserted, skipped, total: contracts.length });
  } catch (e) {
    console.error('[bulk-import]', e.message);
    res.status(500).json({ error: 'Bulk import failed' });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { batch_size = 15, year_start = 2015, year_end = 2026 } = req.body || {};
    const batchSize = Math.min(Math.max(Number(batch_size) || 15, 1), 1000);
    const startYear = Math.max(Number(year_start) || 2015, 2010);
    const endYear = Math.min(Number(year_end) || 2026, 2030);

    if (startYear > endYear) {
      return res.status(400).json({ error: 'year_start must be <= year_end' });
    }

    const totalExpected = counties.length * SECTORS.length * batchSize;
    if (totalExpected > 1000000) {
      return res.status(400).json({ error: `batch_size=${batchSize} would generate ${totalExpected.toLocaleString()} contracts which exceeds the 1M limit. Use a smaller batch_size.` });
    }

    const years = [];
    for (let y = startYear; y <= endYear; y++) years.push(y);

    const baseSeed = Date.now();
    let globalId = 0;
    let inserted = 0;
    let skipped = 0;

    for (const county of counties) {
      for (const sector of SECTORS) {
        const batch = [];
        for (let i = 0; i < batchSize; i++) {
          const year = years[Math.floor(Math.random() * years.length)];
          const seq = globalId + i + 1;
          const contractId = `PPIP-${year}-${String(seq).padStart(6, '0')}`;
          batch.push(generateContract(contractId, county.name, sector, year, seq, Math.random));
        }
        globalId += batchSize;

        const BATCH_DB = 500;
        for (let j = 0; j < batch.length; j += BATCH_DB) {
          const chunk = batch.slice(j, j + BATCH_DB);
          const { sql, params } = buildBatchInsertSQL(chunk);
          try {
            const result = await pool.query(sql, params);
            inserted += result.rowCount || 0;
            skipped += chunk.length - (result.rowCount || 0);
          } catch (e) {
            console.error('[bulk-gen] batch error:', e.message);
            skipped += chunk.length;
          }
        }
      }
    }

    res.json({
      ok: true,
      generated: inserted,
      skipped,
      params: { batch_size: batchSize, year_start: startYear, year_end: endYear, counties: counties.length, sectors: SECTORS.length },
      total_expected: totalExpected
    });
  } catch (e) {
    console.error('[bulk-gen]', e.message);
    res.status(500).json({ error: 'Data generation failed' });
  }
});

router.get('/status', async (_req, res) => {
  try {
    const [totalRes, byCounty, bySector, byYear, byDataType] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM contracts'),
      pool.query('SELECT county, COUNT(*) as count FROM contracts GROUP BY county ORDER BY count DESC'),
      pool.query('SELECT sector, COUNT(*) as count FROM contracts WHERE sector IS NOT NULL GROUP BY sector ORDER BY count DESC'),
      pool.query('SELECT year, COUNT(*) as count FROM contracts WHERE year IS NOT NULL GROUP BY year ORDER BY year DESC'),
      pool.query('SELECT data_type, COUNT(*) as count FROM contracts GROUP BY data_type ORDER BY count DESC'),
    ]);

    const totalValue = await pool.query('SELECT COALESCE(SUM(value_kes), 0) as total FROM contracts');
    const ghostCount = await pool.query('SELECT COUNT(*) FROM ghost_projects');
    const reportCount = await pool.query('SELECT COUNT(*) FROM reports');

    res.json({
      total_contracts: Number(totalRes.rows[0].count),
      total_value_kes: Number(totalValue.rows[0].total),
      ghost_projects: Number(ghostCount.rows[0].count),
      reports: Number(reportCount.rows[0].count),
      by_county: byCounty.rows.map(r => ({ county: r.county, count: Number(r.count) })),
      by_sector: bySector.rows.map(r => ({ sector: r.sector, count: Number(r.count) })),
      by_year: byYear.rows.map(r => ({ year: r.year, count: Number(r.count) })),
      by_data_type: byDataType.rows.map(r => ({ data_type: r.data_type, count: Number(r.count) })),
    });
  } catch (e) {
    console.error('[bulk-status]', e.message);
    res.status(500).json({ error: 'Failed to get bulk status' });
  }
});

module.exports = router;
