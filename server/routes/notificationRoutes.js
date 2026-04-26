const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getNotifications, markAsRead } = require('../controllers/notificationController');

// @route   GET api/notifications
// @desc    Get all notifications for user
// @access  Private
router.get('/', auth, getNotifications);

// @route   PUT api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, markAsRead);

module.exports = router;
