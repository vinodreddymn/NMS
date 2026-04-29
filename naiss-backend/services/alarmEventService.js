const pool = require('../config/db');

class AlarmEventService {

  /* ============================================================
     HELPERS
  ============================================================ */

  _limitOffset(limit = 100, offset = 0) {
    const l = Number.isFinite(+limit) ? +limit : 100;
    const o = Number.isFinite(+offset) ? +offset : 0;
    return [l, o];
  }

  /* ============================================================
     CREATE (MANUAL / SYSTEM)
  ============================================================ */

  async create(data) {
    const {
      device_id,
      pole_id,
      switch_id,
      substation_id,
      regulator_id,
      event_type,
      severity = 'MAJOR',
      message,
      source = 'SYSTEM',
      remarks
    } = data;

    const query = `
      INSERT INTO alarm_events (
        device_id, pole_id, switch_id, substation_id, regulator_id,
        event_type, severity, status, message,
        event_start, is_active, acknowledged,
        source, remarks
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,'ACTIVE',$8,NOW(),true,false,$9,$10)
      RETURNING *
    `;

    const result = await pool.query(query, [
      device_id,
      pole_id,
      switch_id,
      substation_id,
      regulator_id,
      event_type,
      severity,
      message,
      source,
      remarks
    ]);

    return result.rows[0];
  }

  /* ============================================================
     🔥 UPSERT (NO DUPLICATE ACTIVE ALARMS)
  ============================================================ */

  async upsertAlarm({ device_id, event_type, severity, message }) {

    const existing = await pool.query(
      `
      SELECT * FROM alarm_events
      WHERE device_id = $1
      AND event_type = $2
      AND is_active = true
      `,
      [device_id, event_type]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0]; // prevent duplicates
    }

    return this.create({
      device_id,
      event_type,
      severity,
      message,
      source: 'SYSTEM'
    });
  }

  /* ============================================================
     🔥 CLEAR ALARM (AUTO / MANUAL)
  ============================================================ */

  async clearAlarm(id) {
    const query = `
      UPDATE alarm_events
      SET 
        status = 'CLEARED',
        is_active = false,
        event_end = NOW(),
        duration_seconds = EXTRACT(EPOCH FROM (NOW() - event_start))
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async clearByDevice(device_id, event_type) {
    const query = `
      UPDATE alarm_events
      SET 
        status = 'CLEARED',
        is_active = false,
        event_end = NOW(),
        duration_seconds = EXTRACT(EPOCH FROM (NOW() - event_start))
      WHERE device_id = $1
      AND event_type = $2
      AND is_active = true
      RETURNING *
    `;

    const result = await pool.query(query, [device_id, event_type]);
    return result.rows[0];
  }

  /* ============================================================
     READ – ACTIVE (DEFAULT VIEW)
  ============================================================ */

async getActive(limit = 100, offset = 0) {
    const [l, o] = this._limitOffset(limit, offset);

    const query = `
        SELECT 
        a.*,
        d.device_name,
        p.pole_number,
        s.name AS switch_name,
        sub.name AS substation_name,
        vr.name AS regulator_name
        FROM alarm_events a
        LEFT JOIN devices d ON a.device_id = d.id
        LEFT JOIN poles p ON a.pole_id = p.id
        LEFT JOIN switches s ON a.switch_id = s.id
        LEFT JOIN substations sub ON a.substation_id = sub.id
        LEFT JOIN voltage_regulators vr ON a.regulator_id = vr.id
        WHERE a.is_active = true
        ORDER BY a.event_start DESC
        LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [l, o]);
    return result.rows;
    }

  async getActiveCount() {
    const result = await pool.query(
      `SELECT COUNT(*) FROM alarm_events WHERE is_active = true`
    );
    return parseInt(result.rows[0].count);
  }

  /* ============================================================
     READ – HISTORY
  ============================================================ */

async getAll(limit = 100, offset = 0) {
    const [l, o] = this._limitOffset(limit, offset);

    const query = `
        SELECT 
        a.*,
        d.device_name,
        p.pole_number,
        s.name AS switch_name,
        sub.name AS substation_name,
        vr.name AS regulator_name
        FROM alarm_events a
        LEFT JOIN devices d ON a.device_id = d.id
        LEFT JOIN poles p ON a.pole_id = p.id
        LEFT JOIN switches s ON a.switch_id = s.id
        LEFT JOIN substations sub ON a.substation_id = sub.id
        LEFT JOIN voltage_regulators vr ON a.regulator_id = vr.id
        ORDER BY a.event_start DESC
        LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [l, o]);
    return result.rows;
    }

  async getById(id) {
    const result = await pool.query(
      `SELECT * FROM alarm_events WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async getByDeviceId(device_id, limit = 100, offset = 0) {
    const [l, o] = this._limitOffset(limit, offset);

    const result = await pool.query(
      `
      SELECT *
      FROM alarm_events
      WHERE device_id = $1
      ORDER BY event_start DESC
      LIMIT $2 OFFSET $3
      `,
      [device_id, l, o]
    );

    return result.rows;
  }

  async getBySeverity(severity, limit = 100, offset = 0) {
    const [l, o] = this._limitOffset(limit, offset);

    const result = await pool.query(
      `
      SELECT *
      FROM alarm_events
      WHERE severity = $1
      ORDER BY event_start DESC
      LIMIT $2 OFFSET $3
      `,
      [severity, l, o]
    );

    return result.rows;
  }

  async getByEventType(event_type, limit = 100, offset = 0) {
    const [l, o] = this._limitOffset(limit, offset);

    const result = await pool.query(
      `
      SELECT *
      FROM alarm_events
      WHERE event_type = $1
      ORDER BY event_start DESC
      LIMIT $2 OFFSET $3
      `,
      [event_type, l, o]
    );

    return result.rows;
  }

  /* ============================================================
     UPDATE
  ============================================================ */

  async update(id, data) {
    const fields = [];
    const values = [];
    let i = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${i}`);
        values.push(value);
        i++;
      }
    }

    if (!fields.length) return null;

    values.push(id);

    const query = `
      UPDATE alarm_events
      SET ${fields.join(', ')}
      WHERE id = $${i}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /* ============================================================
     ACKNOWLEDGE
  ============================================================ */

  async acknowledge(id, acknowledged_by) {
    const query = `
      UPDATE alarm_events
      SET 
        acknowledged = true,
        status = 'ACKNOWLEDGED',
        acknowledged_by = $2,
        acknowledged_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, acknowledged_by]);
    return result.rows[0];
  }

  /* ============================================================
     DELETE
  ============================================================ */

  async delete(id) {
    const result = await pool.query(
      `DELETE FROM alarm_events WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = new AlarmEventService();