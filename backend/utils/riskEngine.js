function scoreContract(contract) {
  const flags = {}; let score = 0;
  if (/direct|sole|single/i.test(contract.bid_type || '')) { flags.single_source = true; score += 35; }
  const v = Number(contract.value_kes || 0);
  if (v >= 50000000 && flags.single_source) { flags.value_anomaly = true; score += 25; }
  else if (v >= 100000000) { flags.high_value = true; score += 15; }
  if ((contract.scope || '').trim().length < 40) { flags.vague_scope = true; score += 15; }
  if (/supplier-\d+|unknown|n\/a|tbd/i.test(contract.supplier || '')) { flags.placeholder_supplier = true; score += 10; }
  if (contract.data_type === 'reference') { flags.illustrative = true; score = Math.min(score, 40); }
  if (contract.auditor_flagged) { flags.auditor_flagged = true; score += 30; }
  score = Math.min(100, score);
  let level = 'low';
  if (score >= 75) level = 'critical';
  else if (score >= 50) level = 'high';
  else if (score >= 25) level = 'medium';
  return { risk_score: score, risk_level: level, risk_flags: flags };
}
module.exports = { scoreContract };
