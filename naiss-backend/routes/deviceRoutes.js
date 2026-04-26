const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// CRUD endpoints
router.post('/devices', deviceController.create);
router.get('/devices', deviceController.getAll);
router.get('/devices/search', deviceController.search);
router.get('/devices/:id', deviceController.getById);
router.get('/devices/by-pole/:poleId', deviceController.getByPoleId);
router.get('/devices/by-switch/:switchId', deviceController.getBySwitchId);
router.get('/devices/by-type/:deviceTypeId', deviceController.getByDeviceTypeId);
router.put('/devices/:id', deviceController.update);
router.delete('/devices/:id', deviceController.delete);

module.exports = router;
