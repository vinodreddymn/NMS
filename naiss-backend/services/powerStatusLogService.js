const pool = require('../config/db');

class PowerStatusLogService {
    // Create power status log
    async create(data) {
        const { substation_id, regulator_id, pole_id, power_available, voltage, current, frequency, source, recorded_at } = data;
        
        const query = `
            INSERT INTO power_status_logs (substation_id, regulator_id, pole_id, power_available, voltage, current, frequency, source, recorded_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        
        const result = await pool.query(query, [substation_id, regulator_id, pole_id, power_available, voltage, current, frequency, source, recorded_at || new Date()]);
        return result.rows[0];
    }

    // Get all power status logs
    async getAll(limit = 100, offset = 0) {
        const query = `SELECT * FROM power_status_logs ORDER BY recorded_at DESC LIMIT $1 OFFSET $2`;
        const result = await pool.query(query, [limit, offset]);
        return result.rows;
    }

    // Get power status log by ID
    async getById(id) {
        const query = `SELECT * FROM power_status_logs WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get logs by substation ID
    async getBySubstationId(substation_id, limit = 100, offset = 0) {
        const query = `SELECT * FROM power_status_logs WHERE substation_id = $1 ORDER BY recorded_at DESC LIMIT $2 OFFSET $3`;
        const result = await pool.query(query, [substation_id, limit, offset]);
        return result.rows;
    }

    // Get logs by regulator ID
    async getByRegulatorId(regulator_id, limit = 100, offset = 0) {
        const query = `SELECT * FROM power_status_logs WHERE regulator_id = $1 ORDER BY recorded_at DESC LIMIT $2 OFFSET $3`;
        const result = await pool.query(query, [regulator_id, limit, offset]);
        return result.rows;
    }

    // Get logs by pole ID
    async getByPoleId(pole_id, limit = 100, offset = 0) {
        const query = `SELECT * FROM power_status_logs WHERE pole_id = $1 ORDER BY recorded_at DESC LIMIT $2 OFFSET $3`;
        const result = await pool.query(query, [pole_id, limit, offset]);
        return result.rows;
    }

    // Get latest power status
    async getLatestForSubstation(substation_id) {
        const query = `SELECT * FROM power_status_logs WHERE substation_id = $1 ORDER BY recorded_at DESC LIMIT 1`;
        const result = await pool.query(query, [substation_id]);
        return result.rows[0];
    }

    // Get logs by date range
    async getByDateRange(startDate, endDate, limit = 100, offset = 0) {
        const query = `SELECT * FROM power_status_logs WHERE recorded_at BETWEEN $1 AND $2 ORDER BY recorded_at DESC LIMIT $3 OFFSET $4`;
        const result = await pool.query(query, [startDate, endDate, limit, offset]);
        return result.rows;
    }

    // Delete power status log
    async delete(id) {
        const query = `DELETE FROM power_status_logs WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get power outages
    async getPowerOutages(limit = 100, offset = 0) {
        const query = `SELECT * FROM power_status_logs WHERE power_available = false ORDER BY recorded_at DESC LIMIT $1 OFFSET $2`;
        const result = await pool.query(query, [limit, offset]);
        return result.rows;
    }

    // Get average metrics (last N days)
    async getAverageMetrics(substation_id, days = 7) {
        const query = `
            SELECT 
                AVG(voltage) as avg_voltage,
                AVG(current) as avg_current,
                AVG(frequency) as avg_frequency,
                COUNT(CASE WHEN power_available = false THEN 1 END) as outage_count
            FROM power_status_logs 
            WHERE substation_id = $1 AND recorded_at >= NOW() - INTERVAL '${days} days'
        `;
        const result = await pool.query(query, [substation_id]);
        return result.rows[0];
    }
}

module.exports = new PowerStatusLogService();
