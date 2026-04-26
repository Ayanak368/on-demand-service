const Razorpay = require('razorpay');
const crypto = require('crypto');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
exports.createOrder = async (req, res) => {
    try {
        const { bookingId } = req.body;
        console.log('Creating order for bookingId:', bookingId);
        const booking = await ServiceRequest.findById(bookingId);

        if (!booking) {
            console.log('Booking not found for ID:', bookingId);
            return res.status(404).json({ msg: 'Booking not found' });
        }

        console.log('Booking details:', { price: booking.price, status: booking.status });

        if (!booking.price) {
            console.log('Booking price missing');
            return res.status(400).json({ msg: 'Booking price is missing' });
        }

        const options = {
            amount: Math.round(booking.price * 100), // amount in smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_${bookingId}`,
        };

        const order = await razorpay.orders.create(options);

        // Save orderId to booking
        booking.orderId = order.id;
        booking.amount = booking.price;
        await booking.save();

        res.json(order);
    } catch (err) {
        console.error('Razorpay Order Error:', err);
        res.status(500).send('Server Error');
    }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            const booking = await ServiceRequest.findById(bookingId);
            if (!booking) return res.status(404).json({ msg: 'Booking not found' });

            booking.paymentStatus = 'paid';
            booking.paymentId = razorpay_payment_id;

            // Calculate Split
            booking.adminCommission = booking.amount * 0.10;
            booking.workerPayment = booking.amount * 0.90;

            await booking.save();

            res.json({ msg: "Payment verified successfully", booking });
        } else {
            res.status(400).json({ msg: "Invalid signature" });
        }
    } catch (err) {
        console.error('Verify Payment Error:', err);
        res.status(500).send('Server Error');
    }
};

// Payout Logic (Triggered on Job Completion)
exports.triggerPayout = async (bookingId) => {
    try {
        const booking = await ServiceRequest.findById(bookingId).populate('worker');
        if (!booking || booking.paymentStatus !== 'paid' || booking.payoutStatus === 'paid') return;

        const worker = booking.worker;

        // Razorpay Payout Integration (Placeholder for Payouts API)
        // In a real scenario, you'd use razorpay.payouts.create(...)
        console.log(`Processing payout of ${booking.workerPayment} to ${worker.name} (${worker.bankAccountNumber})`);

        // Mark as paid for now (Simulated)
        booking.payoutStatus = 'paid';
        await booking.save();

        return true;
    } catch (err) {
        console.error('Payout Error:', err);
        return false;
    }
};

// Refund Logic
exports.processRefund = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await ServiceRequest.findById(bookingId);

        if (!booking || booking.paymentStatus !== 'paid') {
            return res.status(400).json({ msg: 'Ineligible for refund' });
        }

        // Razorpay Refund API
        const refund = await razorpay.payments.refund(booking.paymentId, {
            amount: booking.amount * 100, // Full refund
            notes: { bookingId: booking._id.toString() }
        });

        booking.paymentStatus = 'refunded';
        await booking.save();

        res.json({ msg: 'Refund processed successfully', refund });
    } catch (err) {
        console.error('Refund Error:', err);
        res.status(500).send('Server Error');
    }
};
