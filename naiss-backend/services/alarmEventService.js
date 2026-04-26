const pool = require('../config/db');

class AlarmEventService {
    // Create alarm event
    async create(data) {
        const { device_id, pole_id, switch_id, substation_id, regulator_id, event_type, severity, status, message, event_start, event_end, acknowledged, acknowledged_by, acknowledged_at, source, remarks } = data;
        
        const query = `
            INSERT INTO alarm_events (device_id, pole_id, switch_id, substation_id, regulator_id, event_type, severity, status, message, event_start, event_end, acknowledged, acknowledged_by, acknowledged_at, source, remarks)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *
        `;
        
        const result = await pool.query(query, [device_id, pole_id, switch_id, substation_id, regulator_id, event_type, severity, status, message, event_start, event_end, acknowledged, acknowledged_by, acknowledged_at, source, remarks]);
        return result.rows[0];
    }

    // Get all alarm events
    async getAll(limit = 100, offset = 0) {
        const query = `SELECT * FROM alarm_events ORDER BY event_start DESC LIMIT $1 OFFSET $2`;
        const result = await pool.query(query, [limit, offset]);
        return result.rows;
    }

    // Get alarm event by ID
    async getById(id) {
        const query = `SELECT * FROM alarm_events WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get active alarms
    async getActive(limit = 100, offset = 0) {
        const query = `SELECT * FROM alarm_events WHERE status = 'ACTIVE' ORDER BY event_start DESC LIMIT $1 OFFSET $2`;
        const result = await pool.query(query, [limit, offset]);
        return result.rows;
    }

    // Get alarms by device ID
    async getByDeviceId(device_id, limit = 100, offset = 0) {
        const query = `SELECT * FROM alarm_events WHERE device_id = $1 ORDER BY event_start DESC LIMIT $2 OFFSET $3`;
        const result = await pool.query(query, [device_id, limit, offset]);
        return result.rows;
    }

    // Get alarms by severity
    async getBySeverity(severity, limit = 100, offset = 0) {
        const query = `SELECT * FROM alarm_events WHERE severity = $1 ORDER BY event_start DESC LIMIT $2 OFFSET $3`;
        const result = await pool.query(query, [severity, limit, offset]);
        return result.rows;
    }

    // Get alarms by event type
    async getByEventType(event_type, limit = 100, offset = 0) {
        const query = `SELECT * FROM alarm_events WHERE event_type = $1 ORDER BY event_start DESC LIMIT $2 OFFSET $3`;
        const result = await pool.query(query, [event_type, limit, offset]);
        return result.rows;
    }

    // Update alarm event
    async update(id, data) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });

        if (fields.length === 0) return null;

        values.push(id);
        const query = `UPDATE alarm_events SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete alarm event
    async delete(id) {
        const query = `DELETE FROM alarm_events WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get count of active alarms
    async getActiveCount() {
        const query = `SELECT COUNT(*) as count FROM alarm_events WHERE status = 'ACTIVE'`;
        const result = await pool.query(query);
        return result.rows[0].count;
    }

    // Acknowledge alarm
    async acknowledge(id, acknowledged_by) {
        const query = `
            UPDATE alarm_events 
            SET acknowledged = true, acknowledged_by = $2, acknowledged_at = CURRENT_TIMESTAMP 
            WHERE id = $1 
            RETURNING *
        `;
        const result = await pool.query(query, [id, acknowledged_by]);
        return result.rows[0];
    }
}

module.exports = new AlarmEventService();
