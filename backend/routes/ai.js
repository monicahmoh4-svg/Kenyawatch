const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { pool } = require('../db');

router.post('/chat', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI chat not configured (GEMINI_API_KEY missing)' });
  try {
    const { message } = req.body || {};
    if (!message || message.length > 1000) return res.status(400).json({ error: 'Message must be 1-1000 characters' });

    const ctx = await pool.query(
      "SELECT contract_id, county, sector, title, supplier, value_kes, bid_type, risk_score, risk_flags, data_type FROM contracts WHERE data_type <> 'reference' ORDER BY risk_score DESC LIMIT 20"
    );

    const ghostCtx = await pool.query(
      "SELECT project_id, county, title, description, claimed_status FROM ghost_projects LIMIT 10"
    );

    const statsCtx = await pool.query(
      "SELECT county, COUNT(*) as count, AVG(risk_score) as avg_risk FROM contracts WHERE data_type <> 'reference' GROUP BY county ORDER BY count DESC LIMIT 15"
    );

    const contextText = ctx.rows.length
      ? ctx.rows.map(r => {
          const flags = r.risk_flags ? Object.keys(r.risk_flags).filter(k => r.risk_flags[k]).join(', ') : 'none';
          return `- [${r.data_type.toUpperCase()}] ${r.county}: ${r.title} | Supplier: ${r.supplier || 'Unknown'} | Value: KES ${(r.value_kes || 0).toLocaleString()} | Bid: ${r.bid_type || 'N/A'} | Risk: ${r.risk_score}/100 (${flags})`;
        }).join('\n')
      : 'No non-reference contracts currently in database.';

    const ghostText = ghostCtx.rows.length
      ? ghostCtx.rows.map(r => `- ${r.title} (${r.county}): ${r.description} [Status: ${r.claimed_status}]`).join('\n')
      : 'No documented ghost projects.';

    const statsText = statsCtx.rows.length
      ? statsCtx.rows.map(r => `- ${r.county}: ${r.count} contracts, avg risk: ${Math.round(r.avg_risk || 0)}`).join('\n')
      : 'No county statistics available.';

    const systemPrompt = `You are KenyaWatch AI, a civic-tech assistant for Kenyan public procurement accountability. You help citizens, journalists, and oversight bodies understand procurement data and detect corruption patterns.

CRITICAL RULES:
- Always cite the data_type badge — NEVER present a "reference" record as a real case
- Reference records are synthetic/illustrative data used for demonstration
- Documented records are verified cases with official sources
- Live Sync records come from the Open Contracting Data Standard (OCDS) feeds
- If you don't know something, say so honestly

You can help with:
- Analyzing procurement patterns across counties
- Identifying red flags in contracts (single-source bids, high values, vague scopes)
- Explaining risk scoring methodology
- Discussing documented corruption cases
- County-level procurement analysis
- Ghost project identification

Available Data:
--- CONTRACTS (non-reference) ---
${contextText}

--- GHOST PROJECTS ---
${ghostText}

--- COUNTY STATISTICS ---
${statsText}

Always be factual, cite specific data when possible, and remind users to verify information independently.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nUser question: ${message}` }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('[AI API Error]', data.error);
      return res.status(500).json({ error: 'AI service temporarily unavailable. Please try again.' });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated. Please try rephrasing your question.';
    res.json({ reply: text });
  } catch (e) {
    console.error('[AI Error]', e.message);
    res.status(500).json({ error: 'AI request failed. Please try again later.' });
  }
});

module.exports = router;
