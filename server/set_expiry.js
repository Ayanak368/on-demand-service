require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('MongoDB Connected...');
    
    // Find all workers that don't have subscriptionExpiry set or it's null
    const workers = await User.find({ role: 'worker', $or: [{ subscriptionExpiry: { $exists: false } }, { subscriptionExpiry: null }] });
    console.log(`Found ${workers.length} workers without subscriptionExpiry`);
    
    for (let worker of workers) {
        const expiryDate = new Date(worker.createdAt);
        expiryDate.setDate(expiryDate.getDate() + 30); // Add 30 days
        
        worker.subscriptionExpiry = expiryDate;
        await worker.save();
        console.log(`Updated ${worker.name} - Expiry: ${expiryDate}`);
    }
    
    console.log('Done!');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
