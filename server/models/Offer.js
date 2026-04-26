const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Discount', 'Free Consultation', 'Tip'],
        default: 'Discount'
    },
    description: {
        type: String,
        required: true
    },
    serviceCategory: {
        type: String,
        required: true
    },
    buttonText: {
        type: String,
        required: true,
        default: 'Claim Offer'
    },
    buttonLink: {
        type: String,
        required: true,
        default: '/dashboard'
    },
    colorTheme: {
        type: String,
        required: true,
        enum: ['purple', 'green', 'orange', 'blue', 'red'],
        default: 'purple'
    },
    iconType: {
        type: String,
        required: true,
        default: 'Zap' // String identifier for lucide-icons on frontend
    },
    validUntil: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Offer', offerSchema);
