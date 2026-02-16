const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { registerUser, loginUser, getMe, updateProfile } = require('../controllers/authController');

const upload = require('../middleware/upload');

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register', upload.single('photo'), registerUser);

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getMe);

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [auth, upload.single('photo')], updateProfile);

module.exports = router;
