const switchService = require('../services/switchService');

class SwitchController {
    async create(req, res) {
        try {
            const data = req.body;
            const result = await switchService.create(data);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await switchService.getAll(limit, offset);
            const count = await switchService.getCount();
            res.json({ success: true, data: result, total: count, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const result = await switchService.getById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Switch not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getByPoleId(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await switchService.getByPoleId(req.params.poleId, limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getChildSwitches(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await switchService.getChildSwitches(req.params.parentId, limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async update(req, res) {
        try {
            const result = await switchService.update(req.params.id, req.body);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Switch not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await switchService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Switch not found' });
            }
            res.json({ success: true, data: result, message: 'Switch deleted successfully' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = new SwitchController();
