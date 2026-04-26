const pool = require('../config/db');

class DeviceStatusLogService {
    // Create device status log
    async create(data) {
        const { device_id, ping_status, snmp_status, response_time_ms, packet_loss, cpu_usage, memory_usage, temperature, checked_at } = data;
        
        const query = `
            INSERT INTO device_status_logs (device_id, ping_status, snmp_status, response_time_ms, packet_loss, cpu_usage, memory_usage, temperature, checked_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        
        const result = await pool.query(query, [device_id, ping_status, snmp_status, response_time_ms, packet_loss, cpu_usage, memory_usage, temperature, checked_at || new Date()]);
        return result.rows[0];
    }

    // Get all device status logs
    async getAll(limit = 100, offset = 0) {
        const query = `SELECT * FROM device_status_logs ORDER BY checked_at DESC LIMIT $1 OFFSET $2`;
        const result = await pool.query(query, [limit, offset]);
        return result.rows;
    }

    // Get device status log by ID
    async getById(id) {
        const query = `SELECT * FROM device_status_logs WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get logs by device ID
    async getByDeviceId(device_id, limit = 100, offset = 0) {
        const query = `SELECT * FROM device_status_logs WHERE device_id = $1 ORDER BY checked_at DESC LIMIT $2 OFFSET $3`;
        const result = await pool.query(query, [device_id, limit, offset]);
        return result.rows;
    }

    // Get latest status for device
    async getLatestForDevice(device_id) {
        const query = `SELECT * FROM device_status_logs WHERE device_id = $1 ORDER BY checked_at DESC LIMIT 1`;
        const result = await pool.query(query, [device_id]);
        return result.rows[0];
    }

    // Get logs by date range
    async getByDateRange(startDate, endDate, limit = 100, offset = 0) {
        const query = `SELECT * FROM device_status_logs WHERE checked_at BETWEEN $1 AND $2 ORDER BY checked_at DESC LIMIT $3 OFFSET $4`;
        const result = await pool.query(query, [startDate, endDate, limit, offset]);
        return result.rows;
    }

    // Delete device status log
    async delete(id) {
        const query = `DELETE FROM device_status_logs WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get average metrics for device (last N days)
    async getAverageMetrics(device_id, days = 7) {
        const query = `
            SELECT 
                AVG(response_time_ms) as avg_response_time,
                AVG(packet_loss) as avg_packet_loss,
                AVG(cpu_usage) as avg_cpu_usage,
                AVG(memory_usage) as avg_memory_usage,
                AVG(temperature) as avg_temperature
            FROM device_status_logs 
            WHERE device_id = $1 AND checked_at >= NOW() - INTERVAL '${days} days'
        `;
        const result = await pool.query(query, [device_id]);
        return result.rows[0];
    }

    // Get count
    async getCount() {
        const query = `SELECT COUNT(*) as count FROM device_status_logs`;
        const result = await pool.query(query);
        return result.rows[0].count;
    }
}

module.exports = new DeviceStatusLogService();
