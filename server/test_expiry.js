const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    // Find an active worker
    const worker = await User.findOne({ role: 'worker', status: 'active' });
    
    if (worker) {
        // Set expiry to 5 days from now
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);
        
        worker.subscriptionExpiry = futureDate;
        await worker.save();
        
        console.log(`Worker ${worker.name} updated. New expiry: ${futureDate.toISOString()}`);
    } else {
        console.log('No active worker found.');
    }
    
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
