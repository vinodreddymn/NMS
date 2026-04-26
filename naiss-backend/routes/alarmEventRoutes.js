const express = require('express');
const router = express.Router();
const alarmEventController = require('../controllers/alarmEventController');

// CRUD endpoints
router.post('/alarm-events', alarmEventController.create);
router.get('/alarm-events', alarmEventController.getAll);
router.get('/alarm-events/active', alarmEventController.getActive);
router.get('/alarm-events/:id', alarmEventController.getById);
router.get('/alarm-events/by-device/:deviceId', alarmEventController.getByDeviceId);
router.get('/alarm-events/by-severity/:severity', alarmEventController.getBySeverity);
router.get('/alarm-events/by-type/:eventType', alarmEventController.getByEventType);
router.put('/alarm-events/:id', alarmEventController.update);
router.post('/alarm-events/:id/acknowledge', alarmEventController.acknowledge);
router.delete('/alarm-events/:id', alarmEventController.delete);

module.exports = router;
