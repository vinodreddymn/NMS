const substationService = require('../services/substationService');

class SubstationController {
    async create(req, res) {
        try {
            const data = req.body;
            const result = await substationService.create(data);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await substationService.getAll(limit, offset);
            const count = await substationService.getCount();
            res.json({ success: true, data: result, total: count, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const result = await substationService.getById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Substation not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async update(req, res) {
        try {
            const result = await substationService.update(req.params.id, req.body);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Substation not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await substationService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Substation not found' });
            }
            res.json({ success: true, data: result, message: 'Substation deleted successfully' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = new SubstationController();
