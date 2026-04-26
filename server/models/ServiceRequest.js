const mongoose = require('mongoose');

const ServiceRequestSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    serviceType: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    price: {
        type: Number
    },
    finalPrice: {
        type: Number
    },
    originalFinalPrice: {
        type: Number
    },
    appliedOffer: {
        type: String
    },
    priceSubmitted: {
        type: Boolean,
        default: false
    },
    priceConfirmed: {
        type: Boolean,
        default: false
    },
    overdueNotified: {
        type: Boolean,
        default: false
    },
    paymentMethod: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    finalPaymentMethod: {
        type: String,
        enum: ['online', 'offline']
    },
    isFinalPaid: {
        type: Boolean,
        default: false
    },
    date: {
        type: String,
        required: false
    },
    time: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
