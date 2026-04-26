const express = require('express');
const router = express.Router();
const switchController = require('../controllers/switchController');

// CRUD endpoints
router.post('/switches', switchController.create);
router.get('/switches', switchController.getAll);
router.get('/switches/:id', switchController.getById);
router.get('/switches/by-pole/:poleId', switchController.getByPoleId);
router.get('/switches/children/:parentId', switchController.getChildSwitches);
router.put('/switches/:id', switchController.update);
router.delete('/switches/:id', switchController.delete);

module.exports = router;
