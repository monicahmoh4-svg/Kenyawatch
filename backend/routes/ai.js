const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { pool } = require('../db');

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];

async function fetchGemini(apiKey, prompt, modelIndex = 0) {
  if (modelIndex >= GEMINI_MODELS.length) {
    throw new Error('All Gemini models failed');
  }
  const model = GEMINI_MODELS[modelIndex];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1200 }
    })
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    if (response.status === 429 || response.status === 503) {
      console.warn(`[AI] Model ${model} returned ${response.status}, trying next...`);
      return fetchGemini(apiKey, prompt, modelIndex + 1);
    }
    throw new Error(errBody?.error?.message || `Gemini API error: ${response.status}`);
  }
  const data = await response.json();
  if (data.error) {
    if (data.error.code === 429 || data.error.code === 503) {
      console.warn(`[AI] Model ${model} rate limited, trying next...`);
      return fetchGemini(apiKey, prompt, modelIndex + 1);
    }
    throw new Error(data.error.message || 'Gemini API returned an error');
  }
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

function localRuleBasedResponse(message, contracts, ghosts, stats) {
  const lower = message.toLowerCase();

  if (/ghost|phantom|missing|disappear/i.test(lower)) {
    if (ghosts.length === 0) return 'No documented ghost projects found in the database.';
    const list = ghosts.slice(0, 5).map(g =>
      `- ${g.title} (${g.county}): ${g.description?.substring(0, 120)}... [Status: ${g.claimed_status}]`
    ).join('\n');
    return `KenyaWatch has documented ${ghosts.length} ghost projects:\n\n${list}\n\nGhost projects are infrastructure projects where public funds were allocated and sometimes paid, but the project was never completed or does not exist as claimed. Use the Ghost Projects section of the dashboard for full details.`;
  }

  if (/risk|score|flag|red.flag/i.test(lower)) {
    return `KenyaWatch Risk Scoring System:\n\nRisk scores range from 0-100 and are calculated based on:\n- Single-source/direct procurement (+35 points)\n- High contract value with single-source (+25 points)\n- High contract value over KES 100M (+15 points)\n- Vague contract scope under 40 chars (+15 points)\n- Placeholder/unknown supplier (+10 points)\n- Auditor-General flagged (+30 points)\n\nRisk Levels: Low (0-24), Medium (25-49), High (50-74), Critical (75-100)\n\nCurrently in the database: ${stats.total || 0} total contracts. Critical risk contracts are flagged for priority review.`;
  }

  if (/report|corrupt|fraud|whistle|complain/i.test(lower)) {
    return `How to Report Corruption in Kenya:\n\n1. KenyaWatch Online: Use the Report Corruption form on this platform to submit an anonymous tip. You do not need to provide personal details.\n\n2. Ethics and Anti-Corruption Commission (EACC): Call 0800 723 203 (toll-free) or visit eacc.go.ke\n\n3. Auditor-General: Report procurement irregularities at ago.go.ke\n\n4. Public Procurement Regulatory Authority (PPRA): File complaints at ppra.go.ke\n\n5. Directorate of Criminal Investigations (DCI): For criminal matters\n\nAlways gather evidence safely. KenyaWatch protects reporter anonymity.`;
  }

  if (/how.*work|about|what.*is.*kenyawatch|purpose/i.test(lower)) {
    return `KenyaWatch is a civic-tech platform for Kenyan public procurement transparency.\n\nFeatures:\n- Track government contracts across all 47 counties\n- AI-powered corruption risk analysis\n- Ghost project documentation\n- Anonymous corruption reporting\n- OCDS (Open Contracting Data Standard) integration\n- Dashboard with procurement analytics\n\nData Sources:\n- PPIP (Public Procurement Information Portal)\n- Auditor-General reports\n- Media investigations\n- Citizen reports\n\nDatabase: ${stats.total || 0} contracts tracked. ${stats.ghosts || 0} ghost projects documented.`;
  }

  if (/county|counties/i.test(lower)) {
    const countyMatch = lower.match(/\b(nairobi|mombasa|kisumu|nakuru|kiambu|uasin.gishu|trans.nzoia|nandi|bungoma|kakamega|vihiga|busia|siaya|homa.bay|migori|kisii|nyamira|bomet|kericho|narok|kajiado|laikipia|samburu|baringo|west.pokot|turkana|marsabit|isiolo|meru|tharaka.nithi|embu|kirinyaga|nyeri|murang.a|nyandarua|lamu|taita.taveta|kwale|kilifi|tana.river|garissa|wajir|mandera|elgeyo.marakwet|machakos|makueni|kitui)\b/);
    if (countyMatch) {
      const countyName = countyMatch[0].replace(/\./g, '-');
      const found = stats.countyBreakdown?.find(c => c.county.toLowerCase().includes(countyName));
      if (found) {
        return `${found.county} County:\n- Total contracts: ${found.count}\n- Average risk score: ${Math.round(found.avg_risk || 0)}\n\nYou can filter contracts by this county on the dashboard.`;
      }
      return `County "${countyMatch[0]}" not found in the database. There are 47 counties tracked. Try asking about Nairobi, Mombasa, Kisumu, Nakuru, or Kiambu.`;
    }
    return `KenyaWatch tracks procurement across all 47 Kenyan counties. Ask about a specific county for details. Top counties by contract volume: ${stats.countyBreakdown?.slice(0, 5).map(c => `${c.county} (${c.count})`).join(', ') || 'Data loading...'}`;
  }

  if (/sector|road|health|education|water|energy|ict|agriculture/i.test(lower)) {
    const sectorMatch = lower.match(/\b(road|health|education|water|energy|ict|agriculture|infrastructure|transport|environment|housing|public.works|social.services|trade)\b/);
    if (sectorMatch) {
      const s = stats.sectorBreakdown?.find(se => se.sector?.toLowerCase().includes(sectorMatch[0]));
      if (s) return `${s.sector} sector: ${s.count} contracts in the database.`;
    }
    return `Sectors tracked: Roads, Health, Education, Water & Sanitation, Energy, ICT, Agriculture, Infrastructure, Transport, Environment, Housing, Public Works, Social Services, Trade & Industry. Ask about a specific sector for details.`;
  }

  if (/search|find|contract/i.test(lower)) {
    const searchTerms = lower.replace(/search|find|contract|for|about|show/g, '').trim();
    if (searchTerms.length > 2 && contracts.length > 0) {
      const matches = contracts.filter(c =>
        c.title?.toLowerCase().includes(searchTerms) ||
        c.supplier?.toLowerCase().includes(searchTerms) ||
        c.county?.toLowerCase().includes(searchTerms)
      ).slice(0, 5);
      if (matches.length > 0) {
        return `Found ${matches.length} matching contracts:\n\n${matches.map(c =>
          `- ${c.contract_id}: ${c.title} (${c.county}) - KES ${(c.value_kes || 0).toLocaleString()} [Risk: ${c.risk_score}/100]`
        ).join('\n')}\n\nUse the contract search feature on the dashboard for full results.`;
      }
    }
    return `Use the contract search on the dashboard to find specific contracts. You can search by title, supplier, county, or contract ID.`;
  }

  return `I'm KenyaWatch AI Assistant. I can help you with:\n\n- Procurement data for Kenya's 47 counties\n- Corruption risk scoring explained\n- Ghost project information\n- How to report corruption\n- Contract search and analysis\n- Sector-specific procurement data\n\nDatabase: ${stats.total || 0} contracts, ${stats.ghosts || 0} ghost projects tracked.\n\nAsk me anything about Kenyan public procurement!`;
}

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required and must be a non-empty string' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message must be 2000 characters or fewer' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const [contractCtx, ghostCtx, statsCtx, totalCount, ghostCount] = await Promise.all([
      pool.query(
        "SELECT contract_id, county, sector, year, title, supplier, value_kes, bid_type, risk_score, risk_flags, data_type FROM contracts WHERE data_type <> 'reference' ORDER BY risk_score DESC LIMIT 50"
      ),
      pool.query(
        'SELECT project_id, county, title, description, claimed_status FROM ghost_projects LIMIT 15'
      ),
      pool.query(
        'SELECT county, COUNT(*) as count, AVG(risk_score) as avg_risk FROM contracts WHERE data_type <> \'reference\' GROUP BY county ORDER BY count DESC'
      ),
      pool.query("SELECT COUNT(*) FROM contracts WHERE data_type <> 'reference'"),
      pool.query('SELECT COUNT(*) FROM ghost_projects'),
    ]);

    const contracts = contractCtx.rows;
    const ghosts = ghostCtx.rows;
    const countyStats = statsCtx.rows;
    const totalContracts = Number(totalCount.rows[0].count);
    const totalGhosts = Number(ghostCount.rows[0].count);

    if (!apiKey) {
      const reply = localRuleBasedResponse(message, contracts, ghosts, {
        total: totalContracts,
        ghosts: totalGhosts,
        countyBreakdown: countyStats,
      });
      return res.json({ reply, source: 'local' });
    }

    const contextText = contracts.length
      ? contracts.map(r => {
          const flags = r.risk_flags ? Object.keys(r.risk_flags).filter(k => r.risk_flags[k]).join(', ') : 'none';
          return `- [${r.data_type.toUpperCase()}] ${r.county}: ${r.title} | Supplier: ${r.supplier || 'Unknown'} | Value: KES ${(r.value_kes || 0).toLocaleString()} | Bid: ${r.bid_type || 'N/A'} | Risk: ${r.risk_score}/100 (${flags})`;
        }).join('\n')
      : 'No non-reference contracts currently in database.';

    const ghostText = ghosts.length
      ? ghosts.map(r => `- ${r.title} (${r.county}): ${r.description?.substring(0, 150) || 'No description'} [Status: ${r.claimed_status}]`).join('\n')
      : 'No documented ghost projects.';

    const statsText = countyStats.length
      ? countyStats.map(r => `- ${r.county}: ${r.count} contracts, avg risk: ${Math.round(r.avg_risk || 0)}`).join('\n')
      : 'No county statistics available.';

    const systemPrompt = `You are KenyaWatch AI, a civic-tech assistant for Kenyan public procurement accountability. You help citizens, journalists, and oversight bodies understand procurement data and detect corruption patterns.

CRITICAL RULES:
- Always cite the data_type badge — NEVER present a "reference" record as a real case
- Reference records are synthetic/illustrative data used for demonstration
- Documented records are verified cases with official sources
- Live Sync records come from the Open Contracting Data Standard (OCDS) feeds
- If you don't know something, say so honestly
- Be concise but informative
- Use Kenyan Shillings (KES) for all monetary values

You can help with:
- Analyzing procurement patterns across counties
- Identifying red flags in contracts (single-source bids, high values, vague scopes)
- Explaining risk scoring methodology
- Discussing documented corruption cases
- County-level procurement analysis
- Ghost project identification
- How to report corruption

Available Data Summary:
- Total non-reference contracts: ${totalContracts}
- Total ghost projects: ${totalGhosts}
- Top counties by contract count: ${countyStats.slice(0, 10).map(r => `${r.county}(${r.count})`).join(', ')}

--- TOP 50 HIGHEST RISK CONTRACTS ---
${contextText}

--- DOCUMENTED GHOST PROJECTS ---
${ghostText}

--- COUNTY STATISTICS ---
${statsText}`;

    const messages = [];
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-6);
      for (const h of recentHistory) {
        if (h.role === 'user') {
          messages.push({ role: 'user', parts: [{ text: h.content }] });
        } else if (h.role === 'assistant') {
          messages.push({ role: 'model', parts: [{ text: h.content }] });
        }
      }
    }
    messages.push({ role: 'user', parts: [{ text: message }] });

    let reply = null;
    try {
      reply = await fetchGemini(apiKey, `${systemPrompt}\n\nConversation so far:\n${messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.parts[0].text}`).join('\n')}\n\nUser: ${message}`);
    } catch (aiError) {
      console.error('[AI] Gemini failed, using local fallback:', aiError.message);
    }

    if (!reply) {
      reply = localRuleBasedResponse(message, contracts, ghosts, {
        total: totalContracts,
        ghosts: totalGhosts,
        countyBreakdown: countyStats,
      });
      return res.json({ reply, source: 'local_fallback' });
    }

    res.json({ reply, source: 'gemini' });
  } catch (e) {
    console.error('[AI Error]', e.message);
    res.status(500).json({ error: 'AI request failed. Please try again later.' });
  }
});

module.exports = router;
