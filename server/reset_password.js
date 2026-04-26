const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log('MongoDB Connected...');
    
    // Find Arun
    const worker = await User.findOne({ email: 'arun@gmail.com' });
    
    if (!worker) {
        console.log('Arun not found.');
        process.exit();
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    worker.password = await bcrypt.hash('password123', salt);
    
    await worker.save();
    
    console.log('Successfully reset password for Arun to: password123');
    
    process.exit();
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
