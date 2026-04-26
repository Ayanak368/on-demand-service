const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const ServiceRequest = require('./models/ServiceRequest');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/on-demand-service');
        console.log('Connected to MongoDB');

        const workers = await User.find({ role: 'worker' });
        console.log(`\n--- Workers (${workers.length}) ---`);
        workers.forEach(w => {
            console.log(`Worker: ${w.email}`);
            console.log(`Profession: ${w.profession}`);
            console.log(`Location: ${JSON.stringify(w.location)}`);
            console.log(`Coords: [${w.longitude}, ${w.latitude}]`);
            console.log('---');
        });

        const requests = await ServiceRequest.find({ status: 'pending' });
        console.log(`\n--- Pending Requests (${requests.length}) ---`);
        requests.forEach(r => {
            console.log(`Request ID: ${r._id}`);
            console.log(`Service: ${r.serviceType}`);
            console.log(`Radius: ${r.currentRadius}`);
            console.log(`Location: ${JSON.stringify(r.location)}`);
            console.log(`Coords: [${r.longitude}, ${r.latitude}]`);
            console.log('---');
        });

        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err);
        process.exit(1);
    }
};

check();
