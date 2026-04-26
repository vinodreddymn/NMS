const poleService = require('../services/poleService');

class PoleController {
    async create(req, res) {
        try {
            const data = req.body;
            const result = await poleService.create(data);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await poleService.getAll(limit, offset);
            const count = await poleService.getCount();
            res.json({ success: true, data: result, total: count, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const result = await poleService.getById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Pole not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getByRegulatorId(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await poleService.getByRegulatorId(req.params.regulatorId, limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getByPhase(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await poleService.getByPhase(req.params.phase, limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async update(req, res) {
        try {
            const result = await poleService.update(req.params.id, req.body);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Pole not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await poleService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Pole not found' });
            }
            res.json({ success: true, data: result, message: 'Pole deleted successfully' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = new PoleController();
