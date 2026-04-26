const express = require('express');
const router = express.Router();
const deviceTypeController = require('../controllers/deviceTypeController');

// CRUD endpoints
router.post('/device-types', deviceTypeController.create);
router.get('/device-types', deviceTypeController.getAll);
router.get('/device-types/:id', deviceTypeController.getById);
router.put('/device-types/:id', deviceTypeController.update);
router.delete('/device-types/:id', deviceTypeController.delete);

module.exports = router;
