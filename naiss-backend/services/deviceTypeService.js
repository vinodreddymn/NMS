const pool = require('../config/db');

class DeviceTypeService {
    // Create device type
    async create(data) {
        const { name, category, description, supports_ping, supports_snmp, requires_power, manufacturer_default } = data;
        
        const query = `
            INSERT INTO device_types (name, category, description, supports_ping, supports_snmp, requires_power, manufacturer_default)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const result = await pool.query(query, [name, category, description, supports_ping, supports_snmp, requires_power, manufacturer_default]);
        return result.rows[0];
    }

    // Get all device types
    async getAll(limit = 100, offset = 0) {
        const query = `SELECT * FROM device_types ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        const result = await pool.query(query, [limit, offset]);
        return result.rows;
    }

    // Get device type by ID
    async getById(id) {
        const query = `SELECT * FROM device_types WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Update device type
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
        const query = `UPDATE device_types SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete device type
    async delete(id) {
        const query = `DELETE FROM device_types WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get count of device types
    async getCount() {
        const query = `SELECT COUNT(*) as count FROM device_types`;
        const result = await pool.query(query);
        return result.rows[0].count;
    }
}

module.exports = new DeviceTypeService();
