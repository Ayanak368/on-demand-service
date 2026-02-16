const mongoose = require('mongoose');

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
    location: {
        type: String,
        default: 'Local'
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
    status: {
        type: String,
        enum: ['pending', 'active', 'blocked', 'rejected'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
