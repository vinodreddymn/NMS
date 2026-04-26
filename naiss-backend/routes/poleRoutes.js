const express = require('express');
const router = express.Router();
const poleController = require('../controllers/poleController');

// CRUD endpoints
router.post('/poles', poleController.create);
router.get('/poles', poleController.getAll);
router.get('/poles/:id', poleController.getById);
router.get('/poles/by-regulator/:regulatorId', poleController.getByRegulatorId);
router.get('/poles/by-phase/:phase', poleController.getByPhase);
router.put('/poles/:id', poleController.update);
router.delete('/poles/:id', poleController.delete);

module.exports = router;
