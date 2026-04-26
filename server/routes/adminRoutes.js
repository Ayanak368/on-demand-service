const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getWorkers, updateWorkerStatus, deleteUser, updateUser, getStats, getFeedback, getPayments, getCustomers, updateCustomerStatus } = require('../controllers/adminController');

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    next();
};

// @route   GET api/admin/workers
// @desc    Get all workers
// @access  Private (Admin)
router.get('/workers', auth, adminAuth, getWorkers);

// @route   PUT api/admin/workers/:id
// @desc    Update worker status
// @access  Private (Admin)
router.put('/workers/:id', auth, adminAuth, updateWorkerStatus);

// @route   GET api/admin/customers
// @desc    Get all customers
// @access  Private (Admin)
router.get('/customers', auth, adminAuth, getCustomers);

// @route   PUT api/admin/customers/:id
// @desc    Update customer status
// @access  Private (Admin)
router.put('/customers/:id', auth, adminAuth, updateCustomerStatus);

// @route   DELETE api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/users/:id', auth, adminAuth, deleteUser);

// @route   PUT api/admin/users/:id
// @desc    Update user details
// @access  Private (Admin)
router.put('/users/:id', auth, adminAuth, updateUser);

// @route   GET api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/stats', auth, adminAuth, getStats);

// @route   GET api/admin/feedback
// @desc    Get worker feedback
// @access  Private (Admin)
router.get('/feedback', auth, adminAuth, getFeedback);

// @route   GET api/admin/payments
// @desc    Get all payments
// @access  Private (Admin)
router.get('/payments', auth, adminAuth, getPayments);

module.exports = router;
