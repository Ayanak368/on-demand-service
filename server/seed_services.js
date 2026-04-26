const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: String, required: true },
    iconName: { type: String, default: 'Wrench' },
    color: { type: String, default: 'text-blue-500' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Check if model exists to prevent overwrite errors in some environments
const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

mongoose.connect('mongodb://127.0.0.1:27017/on-Demand')
    .then(async () => {
        console.log('Connected to MongoDB');

        const servicesToAdd = [
            { name: 'Plumber', description: 'Expert plumbing services: fix leaks, unclog drains, install pipes.', price: '350', iconName: 'Droplet', color: 'text-blue-500' },
            { name: 'Carpenter', description: 'Custom furniture, woodwork repairs, and door installations.', price: '600', iconName: 'Wrench', color: 'text-orange-600' },
            { name: 'Painter', description: 'Interior and exterior painting services for homes and offices.', price: '1200', iconName: 'Paintbrush', color: 'text-purple-500' },
            { name: 'AC Repair', description: 'AC servicing, gas filling, and troubleshooting to keep you cool.', price: '500', iconName: 'Loader2', color: 'text-cyan-500' },
            { name: 'Home Cleaning', description: 'Deep home cleaning, sanitation, and pest control services.', price: '800', iconName: 'CheckCircle', color: 'text-emerald-500' },
            { name: 'Pest Control', description: 'Professional pest control for a safe and clean environment.', price: '750', iconName: 'Zap', color: 'text-rose-500' }
        ];

        for (const service of servicesToAdd) {
            // Find existing service by case-insensitive name
            const existingInfo = await Service.findOne({ name: { $regex: new RegExp(`^${service.name}$`, 'i') } });
            if (!existingInfo) {
                await Service.create(service);
                console.log(`[+] Added ${service.name}`);
            } else {
                console.log(`[=] ${service.name} already exists.`);
            }
        }

        console.log('Seeding process completed successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error connecting to database:', err);
        process.exit(1);
    });
