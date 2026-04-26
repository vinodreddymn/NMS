const pool = require('../config/db');

class VoltageRegulatorService {
    // Create voltage regulator
    async create(data) {
        const { substation_id, name, input_voltage, output_voltage, capacity_kva, status } = data;
        
        const query = `
            INSERT INTO voltage_regulators (substation_id, name, input_voltage, output_voltage, capacity_kva, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const result = await pool.query(query, [substation_id, name, input_voltage, output_voltage, capacity_kva, status]);
        return result.rows[0];
    }

    // Get all voltage regulators
    async getAll(limit = 100, offset = 0) {
        const query = `SELECT * FROM voltage_regulators ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        const result = await pool.query(query, [limit, offset]);
        return result.rows;
    }

    // Get voltage regulator by ID
    async getById(id) {
        const query = `SELECT * FROM voltage_regulators WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get regulators by substation ID
    async getBySubstationId(substation_id, limit = 100, offset = 0) {
        const query = `SELECT * FROM voltage_regulators WHERE substation_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        const result = await pool.query(query, [substation_id, limit, offset]);
        return result.rows;
    }

    // Update voltage regulator
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
        const query = `UPDATE voltage_regulators SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete voltage regulator
    async delete(id) {
        const query = `DELETE FROM voltage_regulators WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Get count of voltage regulators
    async getCount() {
        const query = `SELECT COUNT(*) as count FROM voltage_regulators`;
        const result = await pool.query(query);
        return result.rows[0].count;
    }
}

module.exports = new VoltageRegulatorService();
