const express = require('express');
const router = express.Router();
const { pool } = require('../db');

const COUNTY_ALIASES = {
  'nairobi': 'Nairobi', 'mombasa': 'Mombasa', 'kisumu': 'Kisumu', 'nakuru': 'Nakuru',
  'kiambu': 'Kiambu', 'uasin gishu': 'Uasin Gishu', 'eldoret': 'Uasin Gishu',
  'trans nzoia': 'Trans-Nzoia', 'kitale': 'Trans-Nzoia', 'nandi': 'Nandi',
  'bungoma': 'Bungoma', 'kakamega': 'Kakamega', 'vihiga': 'Vihiga',
  'busia': 'Busia', 'siaya': 'Siaya', 'homa bay': 'Homa Bay', 'homabay': 'Homa Bay',
  'migori': 'Migori', 'kisii': 'Kisii', 'nyamira': 'Nyamira', 'bomet': 'Bomet',
  'kericho': 'Kericho', 'narok': 'Narok', 'kajiado': 'Kajiado',
  'laikipia': 'Laikipia', 'samburu': 'Samburu', 'baringo': 'Baringo',
  'west pokot': 'West Pokot', 'turkana': 'Turkana', 'marsabit': 'Marsabit',
  'isiolo': 'Isiolo', 'meru': 'Meru', 'tharaka nithi': 'Tharaka-Nithi',
  'tharaka-nithi': 'Tharaka-Nithi', 'embu': 'Embu', 'kirinyaga': 'Kirinyaga',
  'nyeri': 'Nyeri', "murang'a": "Murang'a", 'muranga': "Murang'a",
  'nyandarua': 'Nyandarua', 'lamu': 'Lamu', 'taita taveta': 'Taita-Taveta',
  'taita-taveta': 'Taita-Taveta', 'voi': 'Taita-Taveta',
  'kwale': 'Kwale', 'kilifi': 'Kilifi', 'malindi': 'Kilifi',
  'tana river': 'Tana River', 'garissa': 'Garissa', 'wajir': 'Wajir',
  'mandera': 'Mandera', 'elgeyo marakwet': 'Elgeyo-Marakwet',
  'elgeyo-marakwet': 'Elgeyo-Marakwet', 'machakos': 'Machakos',
  'makueni': 'Makueni', 'kitui': 'Kitui', 'kenyatta': 'Nairobi',
};

const SECTOR_KEYWORDS = {
  'roads': 'Roads', 'road': 'Roads', 'highway': 'Roads', 'tarmac': 'Roads',
  'health': 'Health', 'hospital': 'Health', 'medical': 'Health', 'maternity': 'Health',
  'pharmaceutical': 'Health', 'clinic': 'Health',
  'education': 'Education', 'school': 'Education', 'classroom': 'Education',
  'university': 'Education', 'textbook': 'Education',
  'water': 'Water & Sanitation', 'sanitation': 'Water & Sanitation', 'borehole': 'Water & Sanitation',
  'sewer': 'Water & Sanitation', 'dam': 'Water & Sanitation',
  'energy': 'Energy', 'solar': 'Energy', 'power': 'Energy', 'electricity': 'Energy',
  'wind': 'Energy', 'electrification': 'Energy',
  'ict': 'ICT', 'computer': 'ICT', 'digital': 'ICT', 'fiber': 'ICT',
  'software': 'ICT', 'cctv': 'ICT', 'network': 'ICT',
  'agriculture': 'Agriculture', 'farming': 'Agriculture', 'crop': 'Agriculture',
  'livestock': 'Agriculture', 'irrigation': 'Agriculture', 'fertilizer': 'Agriculture',
  'infrastructure': 'Infrastructure', 'stadium': 'Infrastructure', 'market': 'Infrastructure',
  'transport': 'Transport', 'vehicle': 'Transport', 'bus': 'Transport', 'parking': 'Transport',
  'environment': 'Environment', 'waste': 'Environment', 'recycling': 'Environment',
  'tree': 'Environment', 'reforestation': 'Environment',
  'housing': 'Housing', 'apartment': 'Housing', 'residential': 'Housing',
  'public works': 'Public Works', 'office': 'Public Works', 'court': 'Public Works',
  'police': 'Public Works',
  'social': 'Social Services', 'youth': 'Social Services', 'children': 'Social Services',
  'trade': 'Trade & Industry', 'industrial': 'Trade & Industry', 'business': 'Trade & Industry',
};

async function getCountyData(countyName) {
  const [contractsRes, ghostsRes] = await Promise.all([
    pool.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(value_kes), 0) as total_value, COALESCE(AVG(risk_score), 0) as avg_risk
       FROM contracts WHERE county = $1 AND data_type <> 'reference'`,
      [countyName]
    ),
    pool.query(
      'SELECT title, description, claimed_status FROM ghost_projects WHERE county = $1 LIMIT 5',
      [countyName]
    ),
  ]);

  const stats = contractsRes.rows[0];
  const topContracts = await pool.query(
    `SELECT contract_id, title, supplier, value_kes, risk_score, bid_type
     FROM contracts WHERE county = $1 AND data_type <> 'reference'
     ORDER BY risk_score DESC LIMIT 5`,
    [countyName]
  );

  return {
    name: countyName,
    total_contracts: Number(stats.count),
    total_value: Number(stats.total_value),
    avg_risk: Math.round(Number(stats.avg_risk)),
    top_risk_contracts: topContracts.rows,
    ghost_projects: ghostsRes.rows,
  };
}

function formatKES(value) {
  if (value >= 1e9) return `KES ${(value / 1e9).toFixed(1)} billion`;
  if (value >= 1e6) return `KES ${(value / 1e6).toFixed(1)} million`;
  return `KES ${value.toLocaleString()}`;
}

async function generateResponse(message) {
  const lower = message.toLowerCase().trim();

  // Check for ghost projects query
  if (/ghost|phantom|missing project|disappear|non.?exist/i.test(lower)) {
    const ghosts = await pool.query(
      'SELECT county, title, claimed_status FROM ghost_projects ORDER BY created_at DESC LIMIT 10'
    );
    if (ghosts.rows.length === 0) {
      return 'No ghost projects documented in the database yet.';
    }
    const list = ghosts.rows.map(g =>
      `  - ${g.title} (${g.county}) - Status: ${g.claimed_status}`
    ).join('\n');
    return `KenyaWatch has documented ${ghosts.rows.length} ghost projects:\n\n${list}\n\nGhost projects are infrastructure projects where public funds were allocated but the project was never completed or does not exist as claimed. You can view the full list on the Ghost Projects page.`;
  }

  // Check for report/corruption reporting query
  if (/report|corrupt|fraud|whistle|tip|complain|how to report/i.test(lower)) {
    return `To report corruption through KenyaWatch:\n\n1. Use the "Report Corruption" form on this platform - your submission is anonymous\n2. Provide as much detail as possible: county, project name, what you observed\n3. If you have evidence (photos, documents), include them in the details\n\nExternal channels:\n  - Ethics and Anti-Corruption Commission (EACC): 0800 723 203 (toll-free)\n  - Auditor-General: ago.go.ke\n  - Public Procurement Regulatory Authority (PPRA): ppra.go.ke\n  - Kenya Bribery Reporting Portal: reportbribery.go.ke\n\nKenyaWatch protects reporter anonymity. Your identity is never stored.`;
  }

  // Check for risk scoring query
  if (/risk|score|flag|red.?flag|how.*calculat|method/i.test(lower)) {
    return `KenyaWatch Risk Scoring System (0-100):\n\nScoring Factors:\n  - Single-source/direct procurement: +35 points\n  - High value (>=50M) with single-source: +25 points\n  - High value (>=100M) without single-source: +15 points\n  - Vague scope (under 40 characters): +15 points\n  - Placeholder/unknown supplier: +10 points\n  - Auditor-General flagged: +30 points\n\nRisk Levels:\n  - Low: 0-24 (standard procurement)\n  - Medium: 25-49 (some concerns)\n  - High: 50-74 (significant red flags)\n  - Critical: 75-100 (multiple red flags, priority review)\n\nThe engine automatically scores every contract in the database.`;
  }

  // Check for about/general info query
  if (/about|what is|how.*work|kenyawatch|purpose|explain/i.test(lower)) {
    const stats = await pool.query("SELECT COUNT(*) as c FROM contracts WHERE data_type <> 'reference'");
    const ghosts = await pool.query('SELECT COUNT(*) as c FROM ghost_projects');
    return `KenyaWatch is a civic-tech platform for Kenyan public procurement transparency.\n\nWhat we do:\n  - Track government contracts across all 47 counties\n  - Apply AI-powered corruption risk analysis\n  - Document ghost projects (projects that exist on paper but not in reality)\n  - Enable anonymous corruption reporting\n  - Aggregate data from PPIP, OCDS feeds, and media investigations\n\nDatabase: ${Number(stats.rows[0].c).toLocaleString()} contracts tracked, ${Number(ghosts.rows[0].c).toLocaleString()} ghost projects documented.\n\nData Sources:\n  - PPIP (Public Procurement Information Portal)\n  - Auditor-General reports\n  - Media investigations\n  - Citizen reports`;
  }

  // Check for sector query
  if (/sector|department|ministry/i.test(lower)) {
    const sectorRes = await pool.query(
      "SELECT sector, COUNT(*) as count FROM contracts WHERE sector IS NOT NULL AND data_type <> 'reference' GROUP BY sector ORDER BY count DESC"
    );
    if (sectorRes.rows.length > 0) {
      const list = sectorRes.rows.map(s => `  - ${s.sector}: ${s.count} contracts`).join('\n');
      return `Contract distribution by sector:\n\n${list}\n\nYou can filter contracts by sector on the dashboard. Which sector would you like to explore?`;
    }
    return 'Sector data is being loaded. Please check the dashboard for current statistics.';
  }

  // Check for county query
  let matchedCounty = null;
  for (const [alias, countyName] of Object.entries(COUNTY_ALIASES)) {
    if (lower.includes(alias)) {
      matchedCounty = countyName;
      break;
    }
  }
  if (matchedCounty) {
    const data = await getCountyData(matchedCounty);
    let response = `${data.name} County Overview:\n`;
    response += `  - Total contracts: ${data.total_contracts}\n`;
    response += `  - Total value: ${formatKES(data.total_value)}\n`;
    response += `  - Average risk score: ${data.avg_risk}/100\n`;

    if (data.top_risk_contracts.length > 0) {
      response += `\nHighest Risk Contracts:\n`;
      for (const c of data.top_risk_contracts) {
        response += `  - ${c.contract_id}: ${c.title} (${formatKES(Number(c.value_kes))}) [Risk: ${c.risk_score}] - ${c.supplier || 'Unknown supplier'}\n`;
      }
    }

    if (data.ghost_projects.length > 0) {
      response += `\nGhost Projects in ${data.name}:\n`;
      for (const g of data.ghost_projects) {
        response += `  - ${g.title} [Status: ${g.claimed_status}]\n`;
      }
    }

    response += `\nView all contracts for ${data.name} on the dashboard.`;
    return response;
  }

  // Check for contract search query
  if (/search|find|contract|tender/i.test(lower)) {
    const searchTerm = lower.replace(/search|find|show|contract|tender|for|about|me|all|the/g, '').trim();
    if (searchTerm.length > 2) {
      const results = await pool.query(
        `SELECT contract_id, county, title, value_kes, risk_score
         FROM contracts
         WHERE (title ILIKE $1 OR supplier ILIKE $1 OR county ILIKE $1 OR contract_id ILIKE $1)
         AND data_type <> 'reference'
         ORDER BY risk_score DESC LIMIT 5`,
        [`%${searchTerm}%`]
      );
      if (results.rows.length > 0) {
        let response = `Found ${results.rows.length} contracts matching "${searchTerm}":\n\n`;
        for (const r of results.rows) {
          response += `  - ${r.contract_id}: ${r.title} (${r.county}) - ${formatKES(Number(r.value_kes))} [Risk: ${r.risk_score}]\n`;
        }
        response += '\nUse the full search on the dashboard for more results.';
        return response;
      }
      return `No contracts found matching "${searchTerm}". Try a different search term, or browse by county or sector.`;
    }
  }

  // Check for statistics query
  if (/stat|number|count|how many|total/i.test(lower)) {
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total,
        COALESCE(SUM(value_kes), 0) as total_value,
        COUNT(DISTINCT county) as counties,
        COUNT(DISTINCT sector) as sectors
      FROM contracts WHERE data_type <> 'reference'
    `);
    const s = stats.rows[0];
    return `Database Statistics:\n  - Total contracts: ${Number(s.total).toLocaleString()}\n  - Total value: ${formatKES(Number(s.total_value))}\n  - Counties covered: ${s.counties}\n  - Sectors covered: ${s.sectors}\n\nData includes contracts from PPIP, OCDS feeds, and documented cases.`;
  }

  // Check for help query
  if (/help|what can|option|menu|command/i.test(lower)) {
    return `I can help you with:\n\n  - County data: Ask about any of Kenya's 47 counties (e.g., "Tell me about Nairobi")\n  - Sector info: Ask about procurement sectors (e.g., "Show me health contracts")\n  - Ghost projects: Ask "What are ghost projects?" or "Show ghost projects"\n  - Report corruption: Ask "How do I report corruption?"\n  - Risk scoring: Ask "How does risk scoring work?"\n  - Contract search: Ask "Search for road contracts in Nakuru"\n  - Statistics: Ask "How many contracts are in the database?"\n  - About: Ask "What is KenyaWatch?"\n\nJust type your question in natural language!`;
  }

  // Default response
  return `I'm the KenyaWatch Assistant. I can help you with:\n\n  - Procurement data for Kenya's 47 counties\n  - Contract search and analysis\n  - Corruption risk scoring explanations\n  - Ghost project information\n  - How to report corruption\n  - Sector-specific procurement data\n\nTry asking something like:\n  - "Tell me about Nairobi procurement"\n  - "How does risk scoring work?"\n  - "Show ghost projects"\n  - "How do I report corruption?"`;
}

router.post('/', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message must be 1000 characters or fewer' });
    }

    const reply = await generateResponse(message);
    res.json({ reply, source: 'chatbot' });
  } catch (e) {
    console.error('[chatbot]', e.message);
    res.status(500).json({ error: 'Chatbot request failed. Please try again.' });
  }
});

module.exports = router;
