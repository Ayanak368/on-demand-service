const mongoose = require('mongoose');
const User = require('./models/User'); // Required for model registration
const ServiceRequest = require('./models/ServiceRequest');
const Service = require('./models/Service');
require('dotenv').config();

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const requests = await ServiceRequest.find({ price: { $exists: false } });
        console.log(`Found ${requests.length} requests missing price.`);

        const serviceCatalog = await Service.find({});
        const priceMap = {};
        serviceCatalog.forEach(s => {
            const parsed = parseInt((s.price || '').replace(/\D/g, ''), 10);
            if (!isNaN(parsed)) priceMap[s.name.toLowerCase()] = parsed;
        });

        const fallbackPrices = {
            'electrician': 500,
            'plumber': 400,
            'carpenter': 600,
            'painter': 1200
        };

        for (const req of requests) {
            const type = (req.serviceType || '').toLowerCase();
            const price = priceMap[type] || fallbackPrices[type] || 500;

            req.price = price;
            await req.save();
            console.log(`Updated request ${req._id} (${req.serviceType}) with price: ${price}`);
        }

        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

migrate();
