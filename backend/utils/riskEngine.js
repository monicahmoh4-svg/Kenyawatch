function scoreContract(contract) {
  const flags = {};
  let score = 0;

  const bidType = (contract.bid_type || '').toLowerCase();
  const value = Number(contract.value_kes || 0);
  const scope = (contract.scope || '').trim();
  const title = (contract.title || '').trim();
  const supplier = (contract.supplier || '').trim();
  const county = (contract.county || '').trim();
  const dataType = contract.data_type || '';

  if (/direct|sole|single/i.test(bidType)) {
    flags.single_source = true;
    score += 35;
  }

  if (/restricted/i.test(bidType)) {
    flags.restricted_tender = true;
    score += 10;
  }

  if (/low_value/i.test(bidType)) {
    flags.low_value = true;
    score += 5;
  }

  if (/request_for_quotation|rfq/i.test(bidType)) {
    flags.rfq = true;
    score += 8;
  }

  if (value >= 1000000000) {
    flags.billion_value = true;
    score += 30;
  } else if (value >= 500000000) {
    flags.half_billion_value = true;
    score += 25;
  } else if (value >= 100000000) {
    flags.high_value = true;
    score += 20;
  } else if (value >= 50000000) {
    flags.medium_value = true;
    score += 10;
  }

  if (flags.single_source && value >= 50000000) {
    flags.single_source_high_value = true;
    score += 25;
  }

  if (flags.single_source && value >= 500000000) {
    flags.single_source_massive_value = true;
    score += 15;
  }

  if (scope.length > 0 && scope.length < 40) {
    flags.vague_scope = true;
    score += 20;
  } else if (scope.length > 0 && scope.length < 80) {
    flags.brief_scope = true;
    score += 8;
  }

  if (/supplier-\d+|unknown|n\/a|tbd|test supplier/i.test(supplier)) {
    flags.placeholder_supplier = true;
    score += 15;
  }

  if (!supplier || supplier.length === 0) {
    flags.no_supplier = true;
    score += 10;
  }

  if (scope.length > 0 && /etc|and others|among others|and more|miscellaneous|various/i.test(scope)) {
    flags.vague_etc = true;
    score += 12;
  }

  if (/emergency/i.test(bidType)) {
    flags.emergency_procurement = true;
    score += 20;
  }

  if (title.length > 0 && title.length < 30) {
    flags.short_title = true;
    score += 10;
  }

  const year = contract.year || new Date().getFullYear();
  const awardDate = contract.award_date;
  if (awardDate) {
    const date = new Date(awardDate);
    if (date.getDay() === 0 || date.getDay() === 6) {
      flags.weekend_award = true;
      score += 12;
    }
    const hour = date.getHours();
    if (hour < 6 || hour > 20) {
      flags.off_hours_award = true;
      score += 8;
    }
  }

  const similarContracts = contract.similar_contracts_count || 0;
  if (similarContracts > 3) {
    flags.repeat_contractor = true;
    score += 15;
  }

  if (flags.single_source && flags.high_value) {
    flags.single_source_high_value_combined = true;
    score += 10;
  }

  if (flags.single_source && flags.vague_scope) {
    flags.single_source_vague_scope = true;
    score += 15;
  }

  if (flags.high_value && flags.vague_scope) {
    flags.high_value_vague_scope = true;
    score += 12;
  }

  if (flags.single_source && flags.placeholder_supplier) {
    flags.single_source_placeholder = true;
    score += 15;
  }

  if (contract.auditor_flagged) {
    flags.auditor_flagged = true;
    score += 40;
  }

  if (flags.repeat_contractor && flags.single_source) {
    flags.repeat_single_source = true;
    score += 20;
  }

  if (flags.weekend_award && flags.single_source) {
    flags.weekend_single_source = true;
    score += 15;
  }

  if (flags.off_hours_award && flags.high_value) {
    flags.off_hours_high_value = true;
    score += 12;
  }

  if (flags.vague_etc && flags.high_value) {
    flags.vague_high_value = true;
    score += 15;
  }

  if (flags.emergency_procurement && flags.high_value) {
    flags.emergency_high_value = true;
    score += 10;
  }

  if (dataType === 'reference') {
    flags.illustrative = true;
    score = Math.min(score, 40);
  }

  if (flags.billion_value) {
    score += 5;
  }

  if (/terminated/i.test(contract.status || '')) {
    flags.terminated = true;
    score += 20;
  }

  if (/completed/i.test(contract.status || '')) {
    score = Math.max(score - 10, 0);
  }

  score = Math.min(100, score);

  let level = 'low';
  if (score >= 75) level = 'critical';
  else if (score >= 50) level = 'high';
  else if (score >= 25) level = 'medium';

  const recommendedAction = score >= 75 ? 'immediate_investigation'
    : score >= 50 ? 'priority_review'
    : score >= 25 ? 'standard_review'
    : 'no_action';

  return {
    risk_score: score,
    risk_level: level,
    risk_flags: flags,
    recommended_action: recommendedAction,
    risk_factors: Object.keys(flags).filter(k => flags[k]),
  };
}

function calculateTrendRisk(contract, historicalContracts) {
  let trendScore = 0;
  const recent = historicalContracts.filter(c =>
    c.supplier === contract.supplier &&
    c.county === contract.county
  ).slice(0, 10);

  if (recent.length > 3) {
    trendScore += 15;
  }

  const totalValue = recent.reduce((sum, c) => sum + (c.value_kes || 0), 0);
  if (totalValue > 500000000) {
    trendScore += 20;
  }

  const singleSourceCount = recent.filter(c =>
    /direct|sole|single/i.test(c.bid_type || '')
  ).length;
  if (singleSourceCount > 2) {
    trendScore += 25;
  }

  return Math.min(100, trendScore);
}

function identifyAnomalies(contracts) {
  const anomalies = [];

  const byCounty = {};
  for (const c of contracts) {
    if (!byCounty[c.county]) byCounty[c.county] = [];
    byCounty[c.county].push(c);
  }

  for (const [county, countyContracts] of Object.entries(byCounty)) {
    const singleSource = countyContracts.filter(c =>
      /direct|sole|single/i.test(c.bid_type || '')
    );
    if (singleSource.length > countyContracts.length * 0.5 && countyContracts.length > 5) {
      anomalies.push({
        type: 'high_single_source_ratio',
        county,
        severity: 'high',
        message: `${county} has ${(singleSource.length / countyContracts.length * 100).toFixed(0)}% single-source procurement`,
      });
    }
  }

  const bySupplier = {};
  for (const c of contracts) {
    if (!c.supplier) continue;
    if (!bySupplier[c.supplier]) bySupplier[c.supplier] = [];
    bySupplier[c.supplier].push(c);
  }

  for (const [supplier, supplierContracts] of Object.entries(bySupplier)) {
    if (supplierContracts.length > 20) {
      const totalValue = supplierContracts.reduce((sum, c) => sum + (c.value_kes || 0), 0);
      if (totalValue > 1000000000) {
        anomalies.push({
          type: 'dominant_supplier',
          supplier,
          severity: 'high',
          message: `${supplier} has ${supplierContracts.length} contracts worth KES ${(totalValue / 1e9).toFixed(1)} billion`,
        });
      }
    }
  }

  return anomalies;
}

module.exports = { scoreContract, calculateTrendRisk, identifyAnomalies };
