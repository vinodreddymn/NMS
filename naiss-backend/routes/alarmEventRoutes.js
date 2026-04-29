const express = require('express');
const router = express.Router();
const controller = require('../controllers/alarmEventController');

/* ============================================================
   BASE: /alarm-events
   ============================================================ */

/**
 * CREATE alarm (manual or system-triggered)
 */
router.post('/', controller.create);

/**
 * GET active alarms (DEFAULT VIEW)
 */
router.get('/active', controller.getActive);

/**
 * GET alarm history (all alarms)
 */
router.get('/history', controller.getAll);

/* ============================================================
   FILTER ROUTES
   ============================================================ */

/**
 * GET alarms by device
 */
router.get('/device/:deviceId', controller.getByDeviceId);

/**
 * GET alarms by severity (CRITICAL, MAJOR, MINOR)
 */
router.get('/severity/:severity', controller.getBySeverity);

/**
 * GET alarms by type (DEVICE_DOWN, POWER_FAILURE, etc.)
 */
router.get('/type/:eventType', controller.getByEventType);

/* ============================================================
   ACTION ROUTES (IMPORTANT)
   ============================================================ */

/**
 * ACKNOWLEDGE alarm
 */
router.post('/:id/acknowledge', controller.acknowledge);

/**
 * CLEAR alarm (manual override)
 */
router.post('/:id/clear', controller.clear);

/* ============================================================
   GENERIC ROUTES (KEEP LAST)
   ============================================================ */

/**
 * GET alarm by ID
 */
router.get('/:id', controller.getById);

/**
 * UPDATE alarm
 */
router.put('/:id', controller.update);

/**
 * DELETE alarm
 */
router.delete('/:id', controller.delete);

module.exports = router;