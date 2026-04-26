const express = require('express');
const router = express.Router();
const voltageRegulatorController = require('../controllers/voltageRegulatorController');

// CRUD endpoints
router.post('/voltage-regulators', voltageRegulatorController.create);
router.get('/voltage-regulators', voltageRegulatorController.getAll);
router.get('/voltage-regulators/:id', voltageRegulatorController.getById);
router.get('/voltage-regulators/by-substation/:substationId', voltageRegulatorController.getBySubstationId);
router.put('/voltage-regulators/:id', voltageRegulatorController.update);
router.delete('/voltage-regulators/:id', voltageRegulatorController.delete);

module.exports = router;
