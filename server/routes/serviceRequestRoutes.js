const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createServiceRequest, getServiceRequests, updateServiceRequestStatus } = require('../controllers/serviceRequestController');

// @route   POST api/service-requests
// @desc    Create a request
// @access  Private (Customer)
router.post('/', auth, createServiceRequest);

// @route   GET api/service-requests
// @desc    Get all requests (filtered by role)
// @access  Private
router.get('/', auth, getServiceRequests);

// @route   PUT api/service-requests/:id
// @desc    Update status
// @access  Private (Worker)
router.put('/:id', auth, updateServiceRequestStatus);

module.exports = router;
