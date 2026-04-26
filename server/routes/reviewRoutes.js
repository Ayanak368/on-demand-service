const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addReview } = require('../controllers/reviewController');

// @route   POST api/reviews
// @desc    Add a review
// @access  Private (Customer)
router.post('/', auth, addReview);

module.exports = router;
