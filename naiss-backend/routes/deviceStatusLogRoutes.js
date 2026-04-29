const express = require('express');
const router = express.Router();
const deviceStatusLogController = require('../controllers/deviceStatusLogController');

// CRUD endpoints
router.post('/device-status-logs', deviceStatusLogController.create);
router.get('/device-status-logs', deviceStatusLogController.getAll);

// Status change endpoints (must be before /:id routes to prevent route conflicts)
router.get('/device-status-logs/status-changes/all', deviceStatusLogController.getAllStatusChanges);
router.get('/device-status-logs/by-device/:deviceId', deviceStatusLogController.getByDeviceId);
router.get('/device-status-logs/status-changes/:deviceId', deviceStatusLogController.getStatusChangesByDeviceId);

// Other endpoints
router.get('/device-status-logs/latest/:deviceId', deviceStatusLogController.getLatestForDevice);
router.get('/device-status-logs/date-range', deviceStatusLogController.getByDateRange);
router.get('/device-status-logs/metrics/:deviceId', deviceStatusLogController.getAverageMetrics);
router.get('/device-status-logs/:id', deviceStatusLogController.getById);
router.delete('/device-status-logs/:id', deviceStatusLogController.delete);

module.exports = router;
