const mongoose = require('mongoose');
const Review = require('./models/Review');
const User = require('./models/User');
require('dotenv').config();

async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if there are any reviews
        const reviews = await Review.find({});
        console.log(`Total reviews in database: ${reviews.length}`);

        if (reviews.length > 0) {
            console.log('Sample reviews:');
            reviews.slice(0, 3).forEach(review => {
                console.log(`- Worker: ${review.worker}, Rating: ${review.rating}, Comment: ${review.comment}`);
            });
        }

        // Check if there are any workers
        const workers = await User.find({ role: 'worker' });
        console.log(`Total workers in database: ${workers.length}`);

        if (workers.length > 0) {
            console.log('Workers:');
            workers.forEach(worker => {
                console.log(`- ${worker.name} (${worker.email}) - Status: ${worker.status}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDatabase();