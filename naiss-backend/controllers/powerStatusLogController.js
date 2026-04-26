const powerStatusLogService = require('../services/powerStatusLogService');

class PowerStatusLogController {
    async create(req, res) {
        try {
            const data = req.body;
            const result = await powerStatusLogService.create(data);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await powerStatusLogService.getAll(limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const result = await powerStatusLogService.getById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Power status log not found' });
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
            const result = await powerStatusLogService.getBySubstationId(req.params.substationId, limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getByRegulatorId(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await powerStatusLogService.getByRegulatorId(req.params.regulatorId, limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getByPoleId(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await powerStatusLogService.getByPoleId(req.params.poleId, limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getLatestForSubstation(req, res) {
        try {
            const result = await powerStatusLogService.getLatestForSubstation(req.params.substationId);
            if (!result) {
                return res.status(404).json({ success: false, error: 'No power status logs found for substation' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({ success: false, error: 'startDate and endDate are required' });
            }
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await powerStatusLogService.getByDateRange(startDate, endDate, limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getPowerOutages(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await powerStatusLogService.getPowerOutages(limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getAverageMetrics(req, res) {
        try {
            const days = req.query.days ? parseInt(req.query.days) : 7;
            const result = await powerStatusLogService.getAverageMetrics(req.params.substationId, days);
            res.json({ success: true, data: result, days });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await powerStatusLogService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Power status log not found' });
            }
            res.json({ success: true, data: result, message: 'Power status log deleted successfully' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = new PowerStatusLogController();
