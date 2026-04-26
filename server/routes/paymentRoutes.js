const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createOrder, verifyPayment, processRefund } = require('../controllers/paymentController');

// @route   POST api/payments/order
// @desc    Create a payment order
// @access  Private (Customer)
router.post('/order', auth, createOrder);

// @route   POST api/payments/verify
// @desc    Verify payment signature
// @access  Private (Customer)
router.post('/verify', auth, verifyPayment);

// @route   POST api/payments/refund
// @desc    Refund a payment
// @access  Private (Admin/System)
router.post('/refund', auth, processRefund);

// @route   GET api/payments/get-key
// @desc    Get Razorpay Public Key
// @access  Private (Authenticated)
router.get('/get-key', auth, (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;
