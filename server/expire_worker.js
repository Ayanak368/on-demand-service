const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log('MongoDB Connected...');
    
    // Find the first active worker
    const worker = await User.findOne({ role: 'worker', status: 'active' });
    
    if (!worker) {
        console.log('No active worker found.');
        process.exit();
    }
    
    console.log(`Found worker: ${worker.name} (${worker.email})`);
    
    // Set expiry to 1 day in the past
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    worker.subscriptionExpiry = pastDate;
    await worker.save();
    
    console.log('Successfully expired their subscription!');
    console.log(`New Expiry Date: ${worker.subscriptionExpiry}`);
    
    process.exit();
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
