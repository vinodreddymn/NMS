const express = require('express');
const router = express.Router();
const powerStatusLogController = require('../controllers/powerStatusLogController');

// CRUD endpoints
router.post('/power-status-logs', powerStatusLogController.create);
router.get('/power-status-logs', powerStatusLogController.getAll);
router.get('/power-status-logs/by-substation/:substationId', powerStatusLogController.getBySubstationId);
router.get('/power-status-logs/by-regulator/:regulatorId', powerStatusLogController.getByRegulatorId);
router.get('/power-status-logs/by-pole/:poleId', powerStatusLogController.getByPoleId);
router.get('/power-status-logs/latest/:substationId', powerStatusLogController.getLatestForSubstation);
router.get('/power-status-logs/date-range', powerStatusLogController.getByDateRange);
router.get('/power-status-logs/outages', powerStatusLogController.getPowerOutages);
router.get('/power-status-logs/metrics/:substationId', powerStatusLogController.getAverageMetrics);
router.get('/power-status-logs/:id', powerStatusLogController.getById);
router.delete('/power-status-logs/:id', powerStatusLogController.delete);

module.exports = router;
