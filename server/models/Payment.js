const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    worker_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    payment_type: {
        type: String,
        default: 'registration_fee'
    },
    payment_status: {
        type: String,
        default: 'paid'
    },
    payment_date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payment', PaymentSchema);
