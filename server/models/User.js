const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['customer', 'worker', 'admin'],
        default: 'customer'
    },
    profession: {
        type: String,
        required: function () { return this.role === 'worker'; }
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: function () { return this.role === 'worker'; }
    },
    photo: {
        type: String
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number]
        }
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'blocked', 'rejected'],
        default: 'pending'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    subscriptionExpiry: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.index({ location: '2dsphere' });

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
