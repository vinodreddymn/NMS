const voltageRegulatorService = require('../services/voltageRegulatorService');

class VoltageRegulatorController {
    async create(req, res) {
        try {
            const data = req.body;
            const result = await voltageRegulatorService.create(data);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await voltageRegulatorService.getAll(limit, offset);
            const count = await voltageRegulatorService.getCount();
            res.json({ success: true, data: result, total: count, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const result = await voltageRegulatorService.getById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Voltage regulator not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getBySubstationId(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await voltageRegulatorService.getBySubstationId(req.params.substationId, limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async update(req, res) {
        try {
            const result = await voltageRegulatorService.update(req.params.id, req.body);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Voltage regulator not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await voltageRegulatorService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Voltage regulator not found' });
            }
            res.json({ success: true, data: result, message: 'Voltage regulator deleted successfully' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = new VoltageRegulatorController();
