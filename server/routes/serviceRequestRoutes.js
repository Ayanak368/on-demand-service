const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createServiceRequest, getServiceRequests, updateServiceRequestStatus, updateFinalPrice, confirmServiceRequest, cancelServiceRequest, submitWorkerPrice, approvePrice, completeJob, payFinalPrice } = require('../controllers/serviceRequestController');

// @route   POST api/service-requests
// @desc    Create a request
// @access  Private (Customer)
router.post('/', auth, createServiceRequest);

// @route   GET api/service-requests
// @desc    Get all requests (filtered by role)
// @access  Private
router.get('/', auth, getServiceRequests);

// @route   PUT api/service-requests/:id
// @desc    Update status (Worker Accept/Complete)
// @access  Private (Worker)
router.put('/:id', auth, updateServiceRequestStatus);

// @route   PUT api/service-requests/:id/price
// @desc    Worker sets the final price
// @access  Private (Worker)
router.put('/:id/price', auth, updateFinalPrice);

// @route   PUT api/service-requests/:id/confirm
// @desc    Customer confirms the accepted booking
// @access  Private (Customer)
router.put('/:id/confirm', auth, confirmServiceRequest);

// @route   PUT api/service-requests/:id/cancel
// @desc    Customer cancels the booking
// @access  Private (Customer)
router.put('/:id/cancel', auth, cancelServiceRequest);

// @route   PUT api/service-requests/worker/update-price/:bookingId
// @desc    Worker submits price after inspecting the site
// @access  Private (Worker)
router.put('/worker/update-price/:bookingId', auth, submitWorkerPrice);
// @route   PUT api/service-requests/customer/approve-price/:bookingId
// @desc    Customer approves the submitted price
// @access  Private (Customer)
router.put('/customer/approve-price/:bookingId', auth, approvePrice);

// @route   PUT api/service-requests/customer/pay/:bookingId
// @desc    Customer pays final amount online/offline
// @access  Private (Customer)
router.put('/customer/pay/:bookingId', auth, payFinalPrice);

// @route   PUT api/service-requests/worker/complete-job/:bookingId
// @desc    Worker marks job as completed and generates commission record
// @access  Private (Worker)
router.put('/worker/complete-job/:bookingId', auth, completeJob);

module.exports = router;
