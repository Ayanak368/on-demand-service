require('dotenv').config();
const mongoose = require('mongoose');
const ServiceRequest = require('./models/ServiceRequest');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ondemand').then(async () => {
    try {
        const totalUsers = await User.countDocuments();
        const totalWorkers = await User.countDocuments({ role: 'worker' });
        const totalBookings = await ServiceRequest.countDocuments();

        const servicePrices = {
            'Electrician': 500,
            'Plumber': 400,
            'Carpenter': 600,
            'Painter': 1200
        };

        const completedServiceRequests = await ServiceRequest.find({ status: 'completed' });
        const completedJobs = completedServiceRequests.length;

        let totalEarnings = 0;
        completedServiceRequests.forEach(job => {
            totalEarnings += servicePrices[job.serviceType] || 500;
        });

        console.log(JSON.stringify({ totalUsers, totalWorkers, totalBookings, completedJobs, totalEarnings }, null, 2));
    } catch (e) { console.error(e) }
    process.exit(0);
});
