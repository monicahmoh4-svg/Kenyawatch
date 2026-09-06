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
    const ctx = await pool.query("SELECT contract_id, county, title, value_kes, risk_score, data_type FROM contracts WHERE data_type <> 'reference' ORDER BY risk_score DESC LIMIT 10");
    const contextText = ctx.rows.length ? ctx.rows.map(r => `- [${r.data_type}] ${r.county}: ${r.title} — KES ${r.value_kes?.toLocaleString()} (risk ${r.risk_score})`).join('\n') : 'No non-reference contracts currently in database.';
    const systemPrompt = `You are KenyaWatch AI, a civic-tech assistant for Kenyan public procurement accountability. Answer based on the context below. Always cite the data_type badge — never present a "reference" record as a real case. If you don't know, say so. Keep answers under 200 words.\n\nContext:\n${contextText}`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\nUser question: ${message}` }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 500 } })
    });
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    res.json({ reply: text });
  } catch (e) { res.status(500).json({ error: 'AI request failed' }); }
});
module.exports = router;