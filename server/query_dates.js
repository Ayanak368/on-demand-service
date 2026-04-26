const mongoose = require('mongoose');
require('dotenv').config({path: './.env'});
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const ServiceRequest = require('./models/ServiceRequest');
    const reqs = await ServiceRequest.find({ date: { $exists: true, $ne: null } }).limit(5);
    console.log(reqs.map(r => ({id: r._id, date: r.date, time: r.time, status: r.status})));
    process.exit(0);
});
