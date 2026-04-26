const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { createOffer, getOffers, updateOffer, deleteOffer } = require('../controllers/offerController');

// @route   POST /api/offers
// @desc    Add a new offer (Admin only)
// @access  Private (Admin only)
router.post('/', [auth, admin], createOffer);

// @route   GET /api/offers
// @desc    Get all offers (filters supported via query params)
// @access  Public/Private
router.get('/', getOffers);

// @route   PUT /api/offers/:id
// @desc    Update an offer (Admin only)
// @access  Private (Admin only)
router.put('/:id', [auth, admin], updateOffer);

// @route   DELETE /api/offers/:id
// @desc    Delete an offer (Admin only)
// @access  Private (Admin only)
router.delete('/:id', [auth, admin], deleteOffer);

module.exports = router;
