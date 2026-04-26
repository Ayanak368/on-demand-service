const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const testRegister = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const testEmail = `test_${Date.now()}@example.com`;
        const userData = {
            name: 'Test User',
            email: testEmail,
            password: 'Password123!',
            role: 'customer',
            phone: '1234567890',
            address: '123 Test St',
            location: {
                type: 'Point',
                coordinates: [78.9629, 20.5937]
            }
        };

        const user = new User(userData);
        await user.save();
        console.log('User saved successfully:', user.email);

        // Test worker registration
        const testWorkerEmail = `worker_${Date.now()}@example.com`;
        const workerData = {
            name: 'Test Worker',
            email: testWorkerEmail,
            password: 'Password123!',
            role: 'worker',
            profession: 'Electrician',
            experience: '5 years',
            phone: '0987654321',
            address: '456 Worker Way',
            location: {
                type: 'Point',
                coordinates: [78.9629, 20.5937]
            }
        };

        const worker = new User(workerData);
        await worker.save();
        console.log('Worker saved successfully:', worker.email);

        // Cleanup
        await User.deleteOne({ email: testEmail });
        await User.deleteOne({ email: testWorkerEmail });
        console.log('Test users cleaned up');

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err.message);
        process.exit(1);
    }
};

testRegister();
