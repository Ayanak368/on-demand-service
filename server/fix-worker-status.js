const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const fixWorkerStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Update all workers to 'pending' if their role is 'worker' 
        // OR find specifically "Manav"
        const result = await User.updateMany(
            { role: 'worker', status: 'active' },
            { $set: { status: 'pending' } }
        );

        console.log(`Updated ${result.modifiedCount} workers to pending status.`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Fix failed:', err.message);
        process.exit(1);
    }
};

fixWorkerStatus();
