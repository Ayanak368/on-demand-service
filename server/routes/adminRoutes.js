const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getWorkers, updateWorkerStatus, deleteUser, updateUser } = require('../controllers/adminController');

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

// @route   DELETE api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/users/:id', auth, adminAuth, deleteUser);

// @route   PUT api/admin/users/:id
// @desc    Update user details
// @access  Private (Admin)
router.put('/users/:id', auth, adminAuth, updateUser);

module.exports = router;
