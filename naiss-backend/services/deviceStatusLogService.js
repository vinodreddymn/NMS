const pool = require('../config/db');
const alarmService = require('./alarmEventService');

class DeviceStatusLogService {
  /* =========================
     HELPERS
  ========================= */

  _limitOffset(limit = 100, offset = 0) {
    const l = Number.isFinite(+limit) ? +limit : 100;
    const o = Number.isFinite(+offset) ? +offset : 0;
    return [l, o];
  }

  /* =========================
     CREATE
  ========================= */

async create(data) {
  const {
    device_id,
    ping_status,
    snmp_status,
    response_time_ms,
    packet_loss,
    cpu_usage,
    memory_usage,
    temperature,
    checked_at,
  } = data;

  // 1️⃣ Get previous status BEFORE inserting
  const prevResult = await pool.query(
    `
    SELECT ping_status
    FROM device_status_logs
    WHERE device_id = $1
    ORDER BY checked_at DESC
    LIMIT 1
    `,
    [device_id]
  );

  const previous_status =
    prevResult.rows.length > 0 ? prevResult.rows[0].ping_status : null;

  // 2️⃣ Insert new log
  const insertQuery = `
    INSERT INTO device_status_logs (
      device_id, ping_status, snmp_status,
      response_time_ms, packet_loss,
      cpu_usage, memory_usage, temperature, checked_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `;

  const result = await pool.query(insertQuery, [
    device_id,
    ping_status,
    snmp_status,
    response_time_ms,
    packet_loss,
    cpu_usage,
    memory_usage,
    temperature,
    checked_at || new Date(),
  ]);

  const newLog = result.rows[0];

  // 3️⃣ Detect status change
  if (previous_status !== null && previous_status !== ping_status) {

    // 🔴 DOWN event
    if (previous_status === true && ping_status === false) {
      await alarmService.upsertAlarm({
        device_id,
        event_type: 'DEVICE_DOWN',
        severity: 'CRITICAL',
        message: 'Device is DOWN'
      });
    }

    // 🟢 UP event
    if (previous_status === false && ping_status === true) {
      await alarmService.clearByDevice(device_id, 'DEVICE_DOWN');
    }
  }

  return newLog;
}

  /* =========================
     RAW LOGS (FOR DEBUG ONLY)
  ========================= */

  async getAll(limit = 100, offset = 0) {
    const [l, o] = this._limitOffset(limit, offset);

    const query = `
      SELECT *
      FROM device_status_logs
      ORDER BY checked_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [l, o]);
    return result.rows;
  }

  async getCount() {
    const result = await pool.query(`SELECT COUNT(*) FROM device_status_logs`);
    return parseInt(result.rows[0].count);
  }

  /* =========================
     DEVICE-SPECIFIC LOGS
  ========================= */

  async getByDeviceId(device_id, limit = 100, offset = 0) {
    const [l, o] = this._limitOffset(limit, offset);

    const query = `
      SELECT *
      FROM device_status_logs
      WHERE device_id = $1
      ORDER BY checked_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [device_id, l, o]);
    return result.rows;
  }

  async getById(id) {
    const result = await pool.query(
      `SELECT * FROM device_status_logs WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query(
      `DELETE FROM device_status_logs WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  /* =========================
     🔥 STATUS CHANGE EVENTS (CORE FEATURE)
  ========================= */

  /**
   * ALL DEVICES – ONLY REAL EVENTS
   * (UP→DOWN or DOWN→UP)
   */
  async getAllStatusChanges(limit = 100, offset = 0) {
    const [l, o] = this._limitOffset(limit, offset);

    const query = `
      SELECT *
      FROM (
        SELECT
          id,
          device_id,
          ping_status AS current_status,
          LAG(ping_status) OVER (
            PARTITION BY device_id
            ORDER BY checked_at
          ) AS previous_status,
          snmp_status,
          response_time_ms,
          packet_loss,
          cpu_usage,
          memory_usage,
          temperature,
          checked_at
        FROM device_status_logs
      ) sub
      WHERE previous_status IS NOT NULL
      AND current_status IS DISTINCT FROM previous_status
      ORDER BY checked_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [l, o]);
    return result.rows;
  }

  /**
   * COUNT – EVENTS ONLY
   */
  async getAllStatusChangesCount() {
    const query = `
      SELECT COUNT(*) FROM (
        SELECT
          ping_status,
          LAG(ping_status) OVER (
            PARTITION BY device_id
            ORDER BY checked_at
          ) AS previous_status
        FROM device_status_logs
      ) sub
      WHERE previous_status IS NOT NULL
      AND ping_status IS DISTINCT FROM previous_status
    `;

    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  /**
   * SINGLE DEVICE – EVENTS ONLY
   */
  async getStatusChangesByDeviceId(device_id, limit = 100, offset = 0) {
    const [l, o] = this._limitOffset(limit, offset);

    const query = `
      SELECT *
      FROM (
        SELECT
          id,
          device_id,
          ping_status AS current_status,
          LAG(ping_status) OVER (ORDER BY checked_at) AS previous_status,
          snmp_status,
          response_time_ms,
          packet_loss,
          cpu_usage,
          memory_usage,
          temperature,
          checked_at
        FROM device_status_logs
        WHERE device_id = $1
      ) sub
      WHERE previous_status IS NOT NULL
      AND current_status IS DISTINCT FROM previous_status
      ORDER BY checked_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [device_id, l, o]);
    return result.rows;
  }

  async getStatusChangeCountByDeviceId(device_id) {
    const query = `
      SELECT COUNT(*) FROM (
        SELECT
          ping_status,
          LAG(ping_status) OVER (ORDER BY checked_at) AS previous_status
        FROM device_status_logs
        WHERE device_id = $1
      ) sub
      WHERE previous_status IS NOT NULL
      AND ping_status IS DISTINCT FROM previous_status
    `;

    const result = await pool.query(query, [device_id]);
    return parseInt(result.rows[0].count);
  }

  /* =========================
     LATEST STATE (VERY IMPORTANT FOR DASHBOARD)
  ========================= */

  async getLatestForDevice(device_id) {
    const result = await pool.query(
      `
      SELECT *
      FROM device_status_logs
      WHERE device_id = $1
      ORDER BY checked_at DESC
      LIMIT 1
      `,
      [device_id]
    );

    return result.rows[0];
  }

  /**
   * Latest state for ALL devices (dashboard view)
   */
  async getLatestForAllDevices() {
    const query = `
      SELECT DISTINCT ON (device_id) *
      FROM device_status_logs
      ORDER BY device_id, checked_at DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  /* =========================
     ANALYTICS
  ========================= */

  async getByDateRange(startDate, endDate, limit = 100, offset = 0) {
    const [l, o] = this._limitOffset(limit, offset);

    const query = `
      SELECT *
      FROM device_status_logs
      WHERE checked_at BETWEEN $1 AND $2
      ORDER BY checked_at DESC
      LIMIT $3 OFFSET $4
    `;

    const result = await pool.query(query, [startDate, endDate, l, o]);
    return result.rows;
  }

  async getAverageMetrics(device_id, days = 7) {
    const query = `
      SELECT
        AVG(response_time_ms) AS avg_response_time,
        AVG(packet_loss) AS avg_packet_loss,
        AVG(cpu_usage) AS avg_cpu_usage,
        AVG(memory_usage) AS avg_memory_usage,
        AVG(temperature) AS avg_temperature
      FROM device_status_logs
      WHERE device_id = $1
      AND checked_at >= NOW() - INTERVAL '${days} days'
    `;

    const result = await pool.query(query, [device_id]);
    return result.rows[0];
  }
}

module.exports = new DeviceStatusLogService();