const pool = require('../config/db');

class DeviceService {
    // Create device
    async create(data) {
        const { device_type_id, pole_id, switch_id, device_name, ip_address, mac_address, brand, model, serial_number, installation_date, warranty_expiry, vlan_id, port_number, status, location, remarks } = data;
        
        const query = `
            INSERT INTO devices (device_type_id, pole_id, switch_id, device_name, ip_address, mac_address, brand, model, serial_number, installation_date, warranty_expiry, vlan_id, port_number, status, location, remarks)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *
        `;
        
        const result = await pool.query(query, [device_type_id, pole_id, switch_id, device_name, ip_address, mac_address, brand, model, serial_number, installation_date, warranty_expiry, vlan_id, port_number, status, location, remarks]);
        return result.rows[0];
    }

    // Get all devices
    async getAll(limit = 100, offset = 0) {
        const query = `SELECT * FROM devices ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        const result = await pool.query(query, [limit, offset]);
        return result.rows;
    }

    // Get device by ID
    async getById(id) {
        const query = `SELECT * FROM devices WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get devices by pole ID
    async getByPoleId(pole_id, limit = 100, offset = 0) {
        const query = `SELECT * FROM devices WHERE pole_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        const result = await pool.query(query, [pole_id, limit, offset]);
        return result.rows;
    }

    // Get devices by switch ID
    async getBySwitchId(switch_id, limit = 100, offset = 0) {
        const query = `SELECT * FROM devices WHERE switch_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        const result = await pool.query(query, [switch_id, limit, offset]);
        return result.rows;
    }

    // Get devices by device type ID
    async getByDeviceTypeId(device_type_id, limit = 100, offset = 0) {
        const query = `SELECT * FROM devices WHERE device_type_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        const result = await pool.query(query, [device_type_id, limit, offset]);
        return result.rows;
    }

    // Update device
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
        const query = `UPDATE devices SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete device
    async delete(id) {
        const query = `DELETE FROM devices WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get count of devices
    async getCount() {
        const query = `SELECT COUNT(*) as count FROM devices`;
        const result = await pool.query(query);
        return result.rows[0].count;
    }

    // Search devices
    async search(searchTerm, limit = 100, offset = 0) {
        const query = `SELECT * FROM devices WHERE device_name ILIKE $1 OR ip_address::text ILIKE $1 OR mac_address ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        const result = await pool.query(query, [`%${searchTerm}%`, limit, offset]);
        return result.rows;
    }
}

module.exports = new DeviceService();
