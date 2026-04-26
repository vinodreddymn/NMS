const alarmEventService = require('../services/alarmEventService');

class AlarmEventController {
    async create(req, res) {
        try {
            const data = req.body;
            const result = await alarmEventService.create(data);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await alarmEventService.getAll(limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const result = await alarmEventService.getById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Alarm event not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getActive(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await alarmEventService.getActive(limit, offset);
            const count = await alarmEventService.getActiveCount();
            res.json({ success: true, data: result, activeCount: count, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getByDeviceId(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await alarmEventService.getByDeviceId(req.params.deviceId, limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getBySeverity(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await alarmEventService.getBySeverity(req.params.severity, limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getByEventType(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 100;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const result = await alarmEventService.getByEventType(req.params.eventType, limit, offset);
            res.json({ success: true, data: result, limit, offset });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async update(req, res) {
        try {
            const result = await alarmEventService.update(req.params.id, req.body);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Alarm event not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async acknowledge(req, res) {
        try {
            const { acknowledged_by } = req.body;
            if (!acknowledged_by) {
                return res.status(400).json({ success: false, error: 'acknowledged_by is required' });
            }
            const result = await alarmEventService.acknowledge(req.params.id, acknowledged_by);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Alarm event not found' });
            }
            res.json({ success: true, data: result, message: 'Alarm acknowledged successfully' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await alarmEventService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Alarm event not found' });
            }
            res.json({ success: true, data: result, message: 'Alarm event deleted successfully' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = new AlarmEventController();
