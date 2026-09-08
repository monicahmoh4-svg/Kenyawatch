const { pool } = require('../db');
const { scoreContract, identifyAnomalies } = require('../utils/riskEngine');

class MonitorAgent {
  constructor() {
    this.isRunning = false;
    this.scanInterval = null;
    this.lastScanTime = null;
    this.scanCount = 0;
    this.stats = {
      contractsScanned: 0,
      alertsGenerated: 0,
      eaccForwards: 0,
      lastScanDuration: 0,
    };
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[Monitor] AI Monitor Agent started');

    await this.runFullScan();

    this.scanInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.runFullScan();
      }
    }, 5 * 60 * 1000);
  }

  stop() {
    this.isRunning = false;
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    console.log('[Monitor] AI Monitor Agent stopped');
  }

  async runFullScan() {
    const startTime = Date.now();
    try {
      console.log(`[Monitor] Starting scan #${++this.scanCount}...`);

      const newAlerts = await this.scanHighRiskContracts();
      const anomalies = await this.scanAnomalies();
      const staleContracts = await this.scanStaleContracts();
      const completionIssues = await this.scanCompletionIssues();

      const totalAlerts = newAlerts + anomalies + staleContracts + completionIssues;
      const duration = Date.now() - startTime;

      this.lastScanTime = new Date();
      this.stats.lastScanDuration = duration;
      this.stats.alertsGenerated += totalAlerts;

      await pool.query(
        `INSERT INTO scan_log (scan_type, contracts_scanned, alerts_generated, duration_ms, status)
         VALUES ($1, $2, $3, $4, $5)`,
        ['full_scan', this.stats.contractsScanned, totalAlerts, duration, 'completed']
      );

      console.log(`[Monitor] Scan #${this.scanCount} completed: ${totalAlerts} alerts in ${duration}ms`);
      return { alerts: totalAlerts, duration };
    } catch (error) {
      console.error('[Monitor] Scan error:', error.message);
      await pool.query(
        `INSERT INTO scan_log (scan_type, status, error) VALUES ($1, $2, $3)`,
        ['full_scan', 'failed', error.message]
      ).catch(() => {});
      return { alerts: 0, error: error.message };
    }
  }

  async scanHighRiskContracts() {
    const result = await pool.query(
      `SELECT * FROM contracts
       WHERE risk_score >= 75
       AND alert_status = 'none'
       AND data_type != 'reference'
       ORDER BY risk_score DESC
       LIMIT 100`
    );

    let alertsGenerated = 0;
    for (const contract of result.rows) {
      const alertType = this.determineAlertType(contract);
      const severity = contract.risk_score >= 90 ? 'critical' : 'high';

      await this.createAlert(
        contract.contract_id,
        alertType,
        severity,
        this.generateAlertMessage(contract),
        {
          risk_score: contract.risk_score,
          risk_flags: contract.risk_flags,
          value_kes: contract.value_kes,
          county: contract.county,
          sector: contract.sector,
          supplier: contract.supplier,
          bid_type: contract.bid_type,
        }
      );

      await pool.query(
        `UPDATE contracts SET alert_status = $1, updated_at = NOW() WHERE contract_id = $2`,
        [severity, contract.contract_id]
      );

      alertsGenerated++;
    }

    this.stats.contractsScanned += result.rows.length;
    return alertsGenerated;
  }

  async scanAnomalies() {
    const result = await pool.query(
      `SELECT * FROM contracts WHERE data_type != 'reference' ORDER BY created_at DESC LIMIT 5000`
    );

    const anomalies = identifyAnomalies(result.rows);
    let alertsGenerated = 0;

    for (const anomaly of anomalies) {
      const existing = await pool.query(
        `SELECT id FROM alerts WHERE alert_type = $1 AND details->>'type' = $2 AND acknowledged = false`,
        ['anomaly', anomaly.type]
      );

      if (existing.rows.length === 0) {
        await this.createAlert(
          null,
          'anomaly',
          anomaly.severity,
          anomaly.message,
          { ...anomaly, detected_at: new Date().toISOString() }
        );
        alertsGenerated++;
      }
    }

    return alertsGenerated;
  }

  async scanStaleContracts() {
    const result = await pool.query(
      `SELECT * FROM contracts
       WHERE status = 'active'
       AND award_date < NOW() - INTERVAL '2 years'
       AND data_type != 'reference'
       AND alert_status NOT IN ('stale', 'critical')
       AND last_scanned_at < NOW() - INTERVAL '1 day'
       LIMIT 100`
    );

    let alertsGenerated = 0;
    for (const contract of result.rows) {
      await this.createAlert(
        contract.contract_id,
        'stale_contract',
        'medium',
        `Contract ${contract.contract_id} has been active for over 2 years without completion: ${contract.title}`,
        {
          contract_id: contract.contract_id,
          award_date: contract.award_date,
          value_kes: contract.value_kes,
          county: contract.county,
          days_active: Math.floor((Date.now() - new Date(contract.award_date).getTime()) / (1000 * 60 * 60 * 24)),
        }
      );

      await pool.query(
        `UPDATE contracts SET last_scanned_at = NOW() WHERE contract_id = $1`,
        [contract.contract_id]
      );

      alertsGenerated++;
    }

    return alertsGenerated;
  }

  async scanCompletionIssues() {
    const result = await pool.query(
      `SELECT * FROM contracts
       WHERE status = 'completed'
       AND completion_date IS NULL
       AND award_date < NOW() - INTERVAL '1 year'
       AND data_type != 'reference'
       AND last_scanned_at < NOW() - INTERVAL '1 day'
       LIMIT 100`
    );

    let alertsGenerated = 0;
    for (const contract of result.rows) {
      await this.createAlert(
        contract.contract_id,
        'completion_issue',
        'medium',
        `Completed contract ${contract.contract_id} missing completion date: ${contract.title}`,
        {
          contract_id: contract.contract_id,
          award_date: contract.award_date,
          value_kes: contract.value_kes,
          county: contract.county,
          supplier: contract.supplier,
        }
      );

      await pool.query(
        `UPDATE contracts SET last_scanned_at = NOW() WHERE contract_id = $1`,
        [contract.contract_id]
      );

      alertsGenerated++;
    }

    return alertsGenerated;
  }

  async createAlert(contractId, alertType, severity, message, details = {}) {
    const existing = await pool.query(
      `SELECT id FROM alerts
       WHERE contract_id = $1 AND alert_type = $2 AND severity = $3 AND acknowledged = false`,
      [contractId, alertType, severity]
    );

    if (existing.rows.length > 0) return existing.rows[0].id;

    const result = await pool.query(
      `INSERT INTO alerts (contract_id, alert_type, severity, message, details)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [contractId, alertType, severity, message, JSON.stringify(details)]
    );

    if (severity === 'critical' || severity === 'high') {
      await this.forwardToEACC(result.rows[0].id, contractId, severity, message);
    }

    return result.rows[0].id;
  }

  async forwardToEACC(alertId, contractId, severity, message) {
    try {
      const contract = contractId
        ? await pool.query('SELECT * FROM contracts WHERE contract_id = $1', [contractId])
        : null;

      const forwardingData = {
        alert_id: alertId,
        contract_id: contractId,
        severity,
        message,
        contract_details: contract?.rows?.[0] || null,
        forwarded_at: new Date().toISOString(),
        platform: 'KenyaWatch AI Monitor',
        reference: `KW-${Date.now()}`,
      };

      await pool.query(
        `INSERT INTO eacc_forwarding (contract_id, alert_id, status, details)
         VALUES ($1, $2, $3, $4)`,
        [contractId, alertId, 'forwarded', JSON.stringify(forwardingData)]
      );

      if (contractId) {
        await pool.query(
          `UPDATE contracts SET eacc_forwarded = true, eacc_forwarded_at = NOW() WHERE contract_id = $1`,
          [contractId]
        );
      }

      this.stats.eaccForwards++;
      console.log(`[Monitor] EACC forwarding: ${contractId || 'anomaly'} (${severity})`);

      return true;
    } catch (error) {
      console.error('[Monitor] EACC forwarding failed:', error.message);
      return false;
    }
  }

  determineAlertType(contract) {
    const flags = contract.risk_flags || {};

    if (flags.single_source_massive_value || flags.billion_value) return 'critical_financial';
    if (flags.single_source_high_value_combined) return 'high_value_single_source';
    if (flags.auditor_flagged) return 'auditor_flagged';
    if (flags.single_source_vague_scope) return 'suspicious_procurement';
    if (flags.repeat_single_source) return 'repeat_contractor';
    if (flags.vague_high_value) return 'vague_high_value';
    return 'general_high_risk';
  }

  generateAlertMessage(contract) {
    const flags = contract.risk_flags || {};
    const flagList = Object.keys(flags).filter(k => flags[k]);

    const parts = [];
    if (flags.single_source) parts.push('single-source procurement');
    if (flags.billion_value) parts.push('value exceeding KES 1 billion');
    if (flags.high_value) parts.push('high value (KES 100M+)');
    if (flags.vague_scope) parts.push('vague contract scope');
    if (flags.placeholder_supplier) parts.push('placeholder supplier');
    if (flags.auditor_flagged) parts.push('flagged by Auditor-General');
    if (flags.repeat_contractor) parts.push('repeat contractor pattern');

    const riskDesc = parts.length > 0 ? parts.join(', ') : 'multiple red flags';

    return `HIGH RISK: ${contract.title} (${contract.county}) - KES ${(contract.value_kes || 0).toLocaleString()} - ${riskDesc} [Risk: ${contract.risk_score}/100]`;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastScanTime: this.lastScanTime,
      scanCount: this.scanCount,
      stats: this.stats,
    };
  }

  async getAlerts(options = {}) {
    const { limit = 50, offset = 0, severity, acknowledged, alert_type } = options;
    const where = [];
    const params = [];

    if (severity) { params.push(severity); where.push(`severity = $${params.length}`); }
    if (acknowledged !== undefined) { params.push(acknowledged); where.push(`acknowledged = $${params.length}`); }
    if (alert_type) { params.push(alert_type); where.push(`alert_type = $${params.length}`); }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    params.push(limit, offset);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM alerts ${whereClause}`,
      params.slice(0, -2)
    );

    const result = await pool.query(
      `SELECT a.*, c.title as contract_title, c.county as contract_county,
              c.value_kes as contract_value, c.supplier as contract_supplier
       FROM alerts a
       LEFT JOIN contracts c ON a.contract_id = c.contract_id
       ${whereClause}
       ORDER BY
         CASE a.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
         a.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      total: Number(countResult.rows[0].count),
      alerts: result.rows,
    };
  }

  async acknowledgeAlert(alertId) {
    await pool.query(
      `UPDATE alerts SET acknowledged = true, acknowledged_at = NOW() WHERE id = $1`,
      [alertId]
    );
  }

  async acknowledgeAllAlerts() {
    const result = await pool.query(
      `UPDATE alerts SET acknowledged = true, acknowledged_at = NOW() WHERE acknowledged = false RETURNING id`
    );
    return result.rowCount;
  }
}

const monitorAgent = new MonitorAgent();
module.exports = monitorAgent;
