const pool = require('../config/db');

class SubstationService {
    // Create substation
    async create(data) {
        const { name, location, ht_panel_status, lt_panel_status, ups_status, dg_status, transformer_status } = data;
        
        const query = `
            INSERT INTO substations (name, location, ht_panel_status, lt_panel_status, ups_status, dg_status, transformer_status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const result = await pool.query(query, [name, location, ht_panel_status, lt_panel_status, ups_status, dg_status, transformer_status]);
        return result.rows[0];
    }

    // Get all substations
    async getAll(limit = 100, offset = 0) {
        const query = `SELECT * FROM substations ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        const result = await pool.query(query, [limit, offset]);
        return result.rows;
    }

    // Get substation by ID
    async getById(id) {
        const query = `SELECT * FROM substations WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Update substation
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
        const query = `UPDATE substations SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete substation
    async delete(id) {
        const query = `DELETE FROM substations WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get count of substations
    async getCount() {
        const query = `SELECT COUNT(*) as count FROM substations`;
        const result = await pool.query(query);
        return result.rows[0].count;
    }
}

module.exports = new SubstationService();
