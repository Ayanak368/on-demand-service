const mongoose = require('mongoose');
const User = require('./models/User');
const ServiceRequest = require('./models/ServiceRequest');
require('dotenv').config();

async function checkRequests() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const pendingRequests = await ServiceRequest.find({ status: 'pending' }).populate('customer', 'name');
        console.log(`Total pending requests: ${pendingRequests.length}`);

        pendingRequests.forEach(req => {
            console.log('--- Request ---');
            console.log(`ID: ${req._id}`);
            console.log(`Service: ${req.serviceType}`);
            console.log(`Location: ${req.location}`);
            console.log(`Price: ${req.price}`);
            console.log(`Customer: ${req.customer ? req.customer.name : 'null'}`);
            console.log(`Details: ${req.details}`);

            // Validate against schema rules manually
            const errors = [];
            if (!req.serviceType) errors.push('serviceType missing');
            if (!req.details) errors.push('details missing');
            if (!req.location) errors.push('location missing');
            if (req.price == null) errors.push('price missing');
            if (!req.customer) errors.push('customer missing');

            if (errors.length > 0) {
                console.log('VALIDATION ERRORS:', errors.join(', '));
            }
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkRequests();
