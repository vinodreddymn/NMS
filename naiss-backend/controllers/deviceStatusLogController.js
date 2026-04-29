const deviceStatusLogService = require('../services/deviceStatusLogService');

class DeviceStatusLogController {
    async create(req, res) {
        try {
            const data = req.body;
            const result = await deviceStatusLogService.create(data);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await deviceStatusLogService.getAll(limit, offset);
            const count = await deviceStatusLogService.getCount();
            res.json({ success: true, data: result, total: count, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const result = await deviceStatusLogService.getById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Device status log not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getByDeviceId(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await deviceStatusLogService.getByDeviceId(req.params.deviceId, limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getStatusChangesByDeviceId(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await deviceStatusLogService.getStatusChangesByDeviceId(req.params.deviceId, limit, offset);
            const count = await deviceStatusLogService.getStatusChangeCountByDeviceId(req.params.deviceId);
            res.json({ success: true, data: result, total: count, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getAllStatusChanges(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await deviceStatusLogService.getAllStatusChanges(limit, offset);
            const count = await deviceStatusLogService.getAllStatusChangesCount();
            res.json({ success: true, data: result, total: count, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getLatestForDevice(req, res) {
        try {
            const result = await deviceStatusLogService.getLatestForDevice(req.params.deviceId);
            if (!result) {
                return res.status(404).json({ success: false, error: 'No status logs found for device' });
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
            const result = await deviceStatusLogService.getByDateRange(startDate, endDate, limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getAverageMetrics(req, res) {
        try {
            const days = req.query.days ? parseInt(req.query.days) : 7;
            const result = await deviceStatusLogService.getAverageMetrics(req.params.deviceId, days);
            res.json({ success: true, data: result, days });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await deviceStatusLogService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Device status log not found' });
            }
            res.json({ success: true, data: result, message: 'Device status log deleted successfully' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = new DeviceStatusLogController();
