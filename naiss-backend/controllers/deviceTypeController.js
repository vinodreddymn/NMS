const deviceTypeService = require('../services/deviceTypeService');

class DeviceTypeController {
    async create(req, res) {
        try {
            const data = req.body;
            const result = await deviceTypeService.create(data);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await deviceTypeService.getAll(limit, offset);
            const count = await deviceTypeService.getCount();
            res.json({ success: true, data: result, total: count, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const result = await deviceTypeService.getById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Device type not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async update(req, res) {
        try {
            const result = await deviceTypeService.update(req.params.id, req.body);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Device type not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await deviceTypeService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Device type not found' });
            }
            res.json({ success: true, data: result, message: 'Device type deleted successfully' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = new DeviceTypeController();
