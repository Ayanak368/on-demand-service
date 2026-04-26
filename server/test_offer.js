const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const ServiceRequest = require('./models/ServiceRequest');
const Notification = require('./models/Notification');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    // get random customer
    const customer = await User.findOne({ role: 'customer' });
    const worker = await User.findOne({ role: 'worker', status: 'active' });
    
    // Create new service request with appliedOffer
    const newRequest = new ServiceRequest({
        customer: customer._id,
        serviceType: 'Deep Cleaning',
        details: 'Testing Offer',
        location: '123 Test St',
        price: 500,
        worker: worker._id,
        status: 'accepted', // bypass pending for fast test
        appliedOffer: '10% Off Deep Cleaning'
    });
    await newRequest.save();
    console.log(`Created request ${newRequest._id} with appliedOffer: 10% Off Deep Cleaning`);

    // Simulate worker updating final price
    let calculatedPrice = 1000;
    newRequest.originalFinalPrice = calculatedPrice;

    if (newRequest.appliedOffer) {
        const match = newRequest.appliedOffer.match(/(\d+)%/);
        if (match && match[1]) {
            const discount = parseInt(match[1], 10);
            calculatedPrice = calculatedPrice - (calculatedPrice * discount / 100);
        }
    }

    newRequest.finalPrice = calculatedPrice;
    newRequest.priceSubmitted = true;
    await newRequest.save();

    console.log(`Original Price: 1000`);
    console.log(`Calculated Final Price after 10% discount: ${calculatedPrice}`);

    const notifMsg = `${worker.name || 'Professional'} has submitted a price of ₹${newRequest.originalFinalPrice} for your ${newRequest.serviceType} request. Your offer "${newRequest.appliedOffer}" was applied, bringing your final price to ₹${calculatedPrice}! Please confirm to proceed.`;
    
    console.log('Notification message generated:');
    console.log(notifMsg);

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
