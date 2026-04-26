const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
        
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log('✓ MongoDB Connected Successfully!');
    } catch (err) {
        console.error('✗ MongoDB Connection Failed:');
        console.error('Error:', err.message);
        console.error('MONGO_URI:', process.env.MONGO_URI ? 'Present' : 'Missing');
        
        // Retry after 5 seconds
        console.log('Retrying connection in 5 seconds...');
        setTimeout(() => {
            connectDB();
        }, 5000);
    }
};

module.exports = connectDB;
