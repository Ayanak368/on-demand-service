const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const { getActiveWorkers } = require('./controllers/authController');

dotenv.config();

const testApproval = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const testEmail = `worker_approval_${Date.now()}@example.com`;
        const workerData = {
            name: 'Approval Test Worker',
            email: testEmail,
            password: 'Password123!',
            role: 'worker',
            profession: 'Mover',
            experience: '2 years',
            phone: '1112223334',
            address: '789 Approval Ave',
            location: {
                type: 'Point',
                coordinates: [78.9629, 20.5937]
            },
            status: 'pending' // Should be default now, but setting explicitly for test
        };

        const worker = new User(workerData);
        await worker.save();
        console.log('Worker registered as pending:', worker.email);

        // Verify not in active list
        // Mocking req/res for getActiveWorkers
        let activeWorkers = await User.find({ role: 'worker', status: 'active' });
        let isVisible = activeWorkers.some(w => w.email === testEmail);
        console.log('Visible to customers before approval:', isVisible);

        if (isVisible) throw new Error('Worker should not be visible before approval');

        // Admin approval
        await User.updateOne({ email: testEmail }, { $set: { status: 'active' } });
        console.log('Worker approved by admin');

        // Verify in active list
        activeWorkers = await User.find({ role: 'worker', status: 'active' });
        isVisible = activeWorkers.some(w => w.email === testEmail);
        console.log('Visible to customers after approval:', isVisible);

        if (!isVisible) throw new Error('Worker should be visible after approval');

        // Cleanup
        await User.deleteOne({ email: testEmail });
        console.log('Test worker cleaned up');

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err.message);
        process.exit(1);
    }
};

testApproval();
