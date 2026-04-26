const pool = require('../config/db');

class PoleService {
    // Create pole
    async create(data) {
        const { pole_number, location, regulator_id, phase, latitude, longitude, distance_from_previous, installation_date, status, remarks } = data;

        const query = `
            INSERT INTO poles (pole_number, location, regulator_id, phase, latitude, longitude, distance_from_previous, installation_date, status, remarks)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const result = await pool.query(query, [pole_number, location, regulator_id, phase, latitude, longitude, distance_from_previous, installation_date, status, remarks]);
        return result.rows[0];
    }

    // Get all poles
    async getAll(limit = 100, offset = 0) {
        const query = `SELECT * FROM poles ORDER BY pole_number ASC LIMIT $1 OFFSET $2`;
        const result = await pool.query(query, [limit, offset]);
        return result.rows;
    }

    // Get pole by ID
    async getById(id) {
        const query = `SELECT * FROM poles WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get poles by regulator ID
    async getByRegulatorId(regulator_id, limit = 100, offset = 0) {
        const query = `SELECT * FROM poles WHERE regulator_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        const result = await pool.query(query, [regulator_id, limit, offset]);
        return result.rows;
    }

    // Update pole
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
        const query = `UPDATE poles SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete pole
    async delete(id) {
        const query = `DELETE FROM poles WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get count of poles
    async getCount() {
        const query = `SELECT COUNT(*) as count FROM poles`;
        const result = await pool.query(query);
        return result.rows[0].count;
    }

    // Get poles by phase
    async getByPhase(phase, limit = 100, offset = 0) {
        const query = `SELECT * FROM poles WHERE phase = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        const result = await pool.query(query, [phase, limit, offset]);
        return result.rows;
    }
}

module.exports = new PoleService();
