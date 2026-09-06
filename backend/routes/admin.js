const express = require('express');
const router = express.Router();
const { seed } = require('../db');
router.post('/reseed', async (req, res) => {
  const key = req.header('x-admin-key');
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  try { await seed(); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: 'Reseed failed', detail: e.message }); }
});
module.exports = router;