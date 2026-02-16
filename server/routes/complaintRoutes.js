const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createComplaint, getComplaints, replyToComplaint, deleteComplaint } = require('../controllers/complaintController');

// @route   POST api/complaints
// @desc    Create a complaint
// @access  Private (Customer)
router.post('/', auth, createComplaint);

// @route   GET api/complaints
// @desc    Get complaints
// @access  Private
router.get('/', auth, getComplaints);

// @route   PUT api/complaints/:id/reply
// @desc    Reply to complaint
// @access  Private (Admin/Worker)
router.put('/:id/reply', auth, replyToComplaint);

// @route   DELETE api/complaints/:id
// @desc    Delete complaint
// @access  Private (Admin/Customer)
router.delete('/:id', auth, deleteComplaint);

module.exports = router;
