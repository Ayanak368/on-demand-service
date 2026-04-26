const express = require('express');
const router = express.Router();
const { createFeedback, getFeedbacks, replyFeedback } = require('../controllers/platformFeedbackController');
const auth = require('../middleware/auth');

router.post('/', auth, createFeedback);
router.get('/', getFeedbacks); // Fetch for admin, customer dashboards & Home page
router.put('/:id/reply', auth, replyFeedback);

module.exports = router;
