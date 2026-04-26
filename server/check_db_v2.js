const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const ServiceRequest = require('./models/ServiceRequest');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/on-demand-service');
        console.log('Connected to MongoDB');

        const workers = await User.find({ role: 'worker' }, 'email location latitude longitude');
        console.log(`\n--- Active Workers (${workers.length}) ---`);
        workers.forEach(w => {
            console.log(`Email: ${w.email}`);
            console.log(`Loc: ${JSON.stringify(w.location)}`);
            console.log(`Lat/Lon fields: ${w.latitude}, ${w.longitude}`);
            console.log('---');
        });

        const pending = await ServiceRequest.find({ status: 'pending' });
        console.log(`\n--- Pending Requests (${pending.length}) ---`);
        pending.forEach(r => {
            console.log(`ID: ${r._id}, Service: ${r.serviceType}, Radius: ${r.currentRadius}`);
            console.log(`Loc: ${JSON.stringify(r.location)}`);
            console.log('---');
        });

        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err);
        process.exit(1);
    }
};

check();
