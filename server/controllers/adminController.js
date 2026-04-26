const User = require('../models/User');
const Review = require('../models/Review');
const Payment = require('../models/Payment');

// Get all workers (pending/active/blocked) with ratings
exports.getWorkers = async (req, res) => {
    try {
        console.log('getWorkers called by:', req.user?.email || 'unknown user');
        const workers = await User.find({ role: 'worker' }).select('-password');
        console.log(`Found ${workers.length} workers`);

        // Get ratings for each worker
        const workersWithRatings = await Promise.all(
            workers.map(async (worker) => {
                const reviews = await Review.find({ worker: worker._id });
                const averageRating = reviews.length > 0
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : 0;

                console.log(`Worker: ${worker.name}, Reviews: ${reviews.length}, Rating: ${averageRating}`);

                return {
                    ...worker.toObject(),
                    averageRating: parseFloat(averageRating),
                    totalReviews: reviews.length
                };
            })
        );

        console.log(`Returning ${workersWithRatings.length} workers with ratings`);
        res.json(workersWithRatings);
    } catch (err) {
        console.error('Error in getWorkers:', err.message);
        res.status(500).send('Server error');
    }
};

// Update worker status (approve/block/reject)
exports.updateWorkerStatus = async (req, res) => {
    try {
        const { status } = req.body;
        let worker = await User.findById(req.params.id);

        if (!worker) return res.status(404).json({ msg: 'Worker not found' });
        if (worker.role !== 'worker') return res.status(400).json({ msg: 'User is not a worker' });

        if (status === 'active' && !worker.subscriptionExpiry) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            worker.subscriptionExpiry = expiryDate;
        }

        worker.status = status;
        await worker.save();

        res.json(worker);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get all customers
exports.getCustomers = async (req, res) => {
    try {
        console.log('getCustomers called by:', req.user?.email || 'unknown user');
        const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
        console.log(`Found ${customers.length} customers`);
        res.json(customers);
    } catch (err) {
        console.error('Error in getCustomers:', err.message);
        res.status(500).send('Server error');
    }
};

// Update customer status (active/blocked)
exports.updateCustomerStatus = async (req, res) => {
    try {
        const { status } = req.body;
        let customer = await User.findById(req.params.id);

        if (!customer) return res.status(404).json({ msg: 'Customer not found' });
        if (customer.role !== 'customer') return res.status(400).json({ msg: 'User is not a customer' });

        // Ensure status is valid
        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        customer.status = status;
        await customer.save();

        res.json(customer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update User Details
exports.updateUser = async (req, res) => {
    try {
        const { name, email, location, profession, phone, address } = req.body;
        let user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.name = name || user.name;
        user.email = email || user.email;
        user.location = location || user.location;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        if (user.role === 'worker') {
            user.profession = profession || user.profession;
        }

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get Dashboard Stats
exports.getStats = async (req, res) => {
    try {
        const User = require('../models/User');
        const ServiceRequest = require('../models/ServiceRequest');
        // Total Users
        const totalUsers = await User.countDocuments();
        // Total Workers
        const totalWorkers = await User.countDocuments({ role: 'worker' });
        // Total Bookings
        const totalBookings = await ServiceRequest.countDocuments();
        // Completed Jobs
        const completedJobs = await ServiceRequest.countDocuments({ status: 'completed' });

        res.json({
            totalUsers,
            totalWorkers,
            totalBookings,
            completedJobs
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get Worker Feedback (Placeholder/Mock as no formal Review model exists)
exports.getFeedback = async (req, res) => {
    try {
        // In a real application, you would query a Review or Feedback model.
        // For demonstration, we'll return an empty array if none exist, or some mock data if required later.
        // A full implementation would require creating a Review.js model and adjusting ServiceRequest flows.
        res.json([]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get All Payments
exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('worker_id', 'name email profession')
            .sort({ payment_date: -1 });
        res.json(payments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
