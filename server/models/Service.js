const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: String, // E.g., '₹500'
        required: true
    },
    iconName: {
        type: String,
        default: 'Wrench' // Lucide-react icon component name
    },
    color: {
        type: String,
        default: 'text-blue-500' // Tailwind text color class
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
