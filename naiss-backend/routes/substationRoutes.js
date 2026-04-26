const express = require('express');
const router = express.Router();
const substationController = require('../controllers/substationController');

// CRUD endpoints
router.post('/substations', substationController.create);
router.get('/substations', substationController.getAll);
router.get('/substations/:id', substationController.getById);
router.put('/substations/:id', substationController.update);
router.delete('/substations/:id', substationController.delete);

module.exports = router;
