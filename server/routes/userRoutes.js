const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { registerUser, loginUser, getMe, updateProfile, getWorkerStats, getActiveWorkers, getCustomerWorkers, getMyWorkerStats, getMyPayment, forgotPassword, resetPassword, renewSubscription } = require('../controllers/authController');

const upload = require('../middleware/upload');

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register', upload.single('photo'), registerUser);

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   POST api/users/forgotpassword
// @desc    Forgot password
// @access  Public
router.post('/forgotpassword', forgotPassword);

// @route   PUT api/users/resetpassword/:token
// @desc    Reset password
// @access  Public
router.put('/resetpassword/:token', resetPassword);

// @route   GET api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getMe);

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [auth, upload.single('photo')], updateProfile);

// @route   GET api/users/worker/:id/stats
// @desc    Get worker stats (completed jobs, avg rating, reviews)
// @access  Private
router.get('/worker/:id/stats', auth, getWorkerStats);

// @route   GET api/users/my-stats
// @desc    Get current worker's stats (completed jobs, avg rating, reviews)
// @access  Private
router.get('/my-stats', auth, getMyWorkerStats);

// @route   GET api/users/workers/active
// @desc    Get all active workers for complaint form
// @access  Private
router.get('/workers/active', auth, getActiveWorkers);

// @route   GET api/users/workers/my
// @desc    Get workers that customer has worked with recently
// @access  Private
router.get('/workers/my', auth, getCustomerWorkers);

// @route   GET api/users/my-payment
// @desc    Get current worker's payment details
// @access  Private
router.get('/my-payment', auth, getMyPayment);

// @route   POST api/users/renew-subscription
// @desc    Renew worker subscription
// @access  Private
router.post('/renew-subscription', auth, renewSubscription);

module.exports = router;
