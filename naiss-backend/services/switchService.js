const pool = require('../config/db');

class SwitchService {
    // Create switch
    async create(data) {
        const { name, ip_address, mac_address, switch_type, location, pole_id, parent_switch_id, total_ports, used_ports, status, snmp_enabled, firmware_version, brand, model, remarks } = data;
        
        const query = `
            INSERT INTO switches (name, ip_address, mac_address, switch_type, location, pole_id, parent_switch_id, total_ports, used_ports, status, snmp_enabled, firmware_version, brand, model, remarks)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `;
        
        const result = await pool.query(query, [name, ip_address, mac_address, switch_type, location, pole_id, parent_switch_id, total_ports, used_ports, status, snmp_enabled, firmware_version, brand, model, remarks]);
        return result.rows[0];
    }

    // Get all switches
    async getAll(limit = 100, offset = 0) {
        const query = `SELECT * FROM switches ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        const result = await pool.query(query, [limit, offset]);
        return result.rows;
    }

    // Get switch by ID
    async getById(id) {
        const query = `SELECT * FROM switches WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get switches by pole ID
    async getByPoleId(pole_id, limit = 100, offset = 0) {
        const query = `SELECT * FROM switches WHERE pole_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        const result = await pool.query(query, [pole_id, limit, offset]);
        return result.rows;
    }

    // Get child switches
    async getChildSwitches(parent_switch_id, limit = 100, offset = 0) {
        const query = `SELECT * FROM switches WHERE parent_switch_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        const result = await pool.query(query, [parent_switch_id, limit, offset]);
        return result.rows;
    }

    // Update switch
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
        const query = `UPDATE switches SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete switch
    async delete(id) {
        const query = `DELETE FROM switches WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get count of switches
    async getCount() {
        const query = `SELECT COUNT(*) as count FROM switches`;
        const result = await pool.query(query);
        return result.rows[0].count;
    }
}

module.exports = new SwitchService();
