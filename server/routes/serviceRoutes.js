const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
    getServices,
    getAllServicesAdmin,
    addService,
    updateService,
    deleteService
} = require('../controllers/serviceController');

// Public route to get active services
router.get('/', getServices);

// Admin route to get all services (including inactive)
router.get('/admin', [auth, admin], getAllServicesAdmin);

// Admin routes to manage services
router.post('/', [auth, admin], addService);
router.put('/:id', [auth, admin], updateService);
router.delete('/:id', [auth, admin], deleteService);

module.exports = router;
