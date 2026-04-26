const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/on-demand-service');
        console.log('Connected to MongoDB');

        const users = await User.find({
            latitude: { $ne: null },
            longitude: { $ne: null }
        });

        console.log(`Found ${users.length} users with coordinates to migrate.`);

        for (const user of users) {
             user.location = {
                 type: 'Point',
                 coordinates: [user.longitude, user.latitude]
             };
             await user.save();
             console.log(`Migrated user: ${user.email}`);
        }

        // Also handle users with [0,0] coordinates who might actually be "unset"
        const nullIslandUsers = await User.find({
            'location.coordinates': [0, 0]
        });
        console.log(`Found ${nullIslandUsers.length} users at Null Island to check.`);
        for (const user of nullIslandUsers) {
            if (user.latitude == null || user.longitude == null) {
                user.location = undefined; // Remove it so it doesn't match nearby
                await user.save();
                console.log(`Cleared default location for: ${user.email}`);
            }
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
