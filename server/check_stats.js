const mongoose = require('mongoose');
require('dotenv').config();
const ServiceRequest = require('./models/ServiceRequest');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const requests = await ServiceRequest.find({ status: { $in: ['completed', 'Completed'] } }).populate('worker');
    const workers = await User.find({ role: 'worker' });

    const workerEarningsMap = {};
    const workerJobsMap = {};

    requests.forEach(req => {
        if (req.worker) {
            const workerId = req.worker._id ? req.worker._id.toString() : req.worker.toString();
            const earning = Number(req.finalPrice) || Number(req.price) || 0;
            workerEarningsMap[workerId] = (workerEarningsMap[workerId] || 0) + earning;
            workerJobsMap[workerId] = (workerJobsMap[workerId] || 0) + 1;
        }
    });

    for (let w of workers) {
        const id = w._id.toString();
        console.log(`Worker: ${w.name}`);
        console.log(`  Earnings: ${workerEarningsMap[id] || 0}`);
        console.log(`  Jobs: ${workerJobsMap[id] || 0}`);
    }

    process.exit(0);
});
