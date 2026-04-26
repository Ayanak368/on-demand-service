const Review = require('../models/Review');
const ServiceRequest = require('../models/ServiceRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @route   POST api/reviews
// @desc    Add a review for a completed service
// @access  Private (Customer only)
exports.addReview = async (req, res) => {
    try {
        const { workerId, serviceRequestId, rating, feedback } = req.body;
        const customerId = req.user.id;

        // 1. Verify user is a customer
        if (req.user.role !== 'customer') {
            return res.status(403).json({ msg: 'Only customers can leave reviews' });
        }

        // 2. Verify the service request exists, belongs to this customer, and is completed
        const serviceReq = await ServiceRequest.findById(serviceRequestId);
        if (!serviceReq) {
            return res.status(404).json({ msg: 'Service request not found' });
        }

        if (serviceReq.customer.toString() !== customerId) {
            return res.status(401).json({ msg: 'Not authorized to review this service' });
        }

        if (serviceReq.status !== 'completed') {
            return res.status(400).json({ msg: 'Can only review completed services' });
        }

        if (serviceReq.worker.toString() !== workerId) {
            return res.status(400).json({ msg: 'Worker mismatch for this service request' });
        }

        // 3. Check if review already exists
        const existingReview = await Review.findOne({ serviceRequest: serviceRequestId });
        if (existingReview) {
            return res.status(400).json({ msg: 'You have already reviewed this service' });
        }

        // 4. Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
        }

        // 5. Create Review
        const newReview = new Review({
            customer: customerId,
            worker: workerId,
            serviceRequest: serviceRequestId,
            rating,
            feedback
        });

        const review = await newReview.save();

        // 6. Notify the Worker
        const customer = await User.findById(customerId).select('name');
        const notif = new Notification({
            userId: workerId,
            message: `${customer.name} left a ${rating}-star review for your service!`,
            type: 'success'
        });
        await notif.save();

        res.json(review);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
