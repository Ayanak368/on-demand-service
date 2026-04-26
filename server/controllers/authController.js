const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Register User
exports.registerUser = async (req, res) => {
    console.log('Register endpoint hit');
    console.log('Request body:', req.body);
    const { name, email, password, role, profession, location, phone, address, experience, latitude, longitude } = req.body;
    const photo = req.file ? req.file.path : '';

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const userData = {
            name,
            email,
            password,
            role,
            profession,
            phone,
            address,
            experience,
            photo,
            latitude,
            longitude,
            status: role === 'worker' ? 'pending' : 'active'
        };

        if (longitude && latitude) {
            userData.location = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            };
        } else {
            userData.location = {
                type: 'Point',
                coordinates: [0, 0]
            };
        }

        user = new User(userData);

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        if (role === 'worker') {
            const payment = new Payment({
                worker_id: user._id,
                amount: 99, // Fixed registration fee
                payment_type: 'registration_fee',
                payment_status: 'paid'
            });
            await payment.save();
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', details: err.message });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, phone: user.phone, address: user.address, location: user.location, createdAt: user.createdAt, profession: user.profession, experience: user.experience, photo: user.photo, subscriptionExpiry: user.subscriptionExpiry } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', details: err.message });
    }
};

// Get Current User Profile
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', details: err.message });
    }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
    console.log('Update Profile:', req.user.id, req.body);
    try {
        const { name, email, phone, address, experience, profession, latitude, longitude } = req.body;
        let user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        
        // Only update location coordinates if latitude and longitude are provided
        if (latitude !== undefined && longitude !== undefined) {
            user.latitude = latitude;
            user.longitude = longitude;
            user.location = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            };
        }

        if (user.role === 'worker') {
            user.experience = experience || user.experience;
            user.profession = profession || user.profession;
        }

        if (req.file) {
            user.photo = req.file.path;
        }

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', details: err.message });
    }
};

// Get Worker Stats and Reviews
exports.getWorkerStats = async (req, res) => {
    try {
        const workerId = req.params.id;

        // Ensure user is actually a worker
        const worker = await User.findById(workerId);
        if (!worker || worker.role !== 'worker') {
            return res.status(404).json({ msg: 'Worker not found' });
        }

        // 1. Get total completed jobs
        const completedJobs = await ServiceRequest.countDocuments({
            worker: workerId,
            status: 'completed'
        });

        // 2. Get reviews for the worker
        const reviews = await Review.find({ worker: workerId }).populate('customer', 'name photo').sort({ createdAt: -1 });

        // Calculate average rating
        let averageRating = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            averageRating = (sum / reviews.length).toFixed(1);
        }

        res.json({
            completedJobs,
            averageRating,
            totalReviews: reviews.length,
            reviews // includes top feedback
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', details: err.message });
    }
};

    // Get Current Worker's Stats (for their own dashboard)
exports.getMyWorkerStats = async (req, res) => {
    try {
        const workerId = req.user.id;
        console.log('getMyWorkerStats called by worker:', req.user?.email || 'unknown user');
        console.log(`Fetching stats for worker ID: ${workerId}`);

        // 1. Get total completed jobs
        const completedJobsCount = await ServiceRequest.countDocuments({
            worker: workerId,
            status: 'completed'
        });
        console.log(`Found ${completedJobsCount} completed jobs`);

        // Calculate Total Earnings
        const completedJobsList = await ServiceRequest.find({
            worker: workerId,
            status: 'completed'
        });
        
        let totalEarnings = 0;
        completedJobsList.forEach(job => {
            const earnings = job.finalPrice || job.price || 0;
            totalEarnings += Number(earnings);
        });

        // 2. Get reviews for the worker
        const reviews = await Review.find({ worker: workerId }).populate('customer', 'name photo').sort({ createdAt: -1 });
        console.log(`Found ${reviews.length} reviews`);

        // Calculate average rating
        let averageRating = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            averageRating = (sum / reviews.length).toFixed(1);
        }
        console.log(`Calculated average rating: ${averageRating}`);

        const response = {
            completedJobs: completedJobsCount,
            totalEarnings,
            averageRating: parseFloat(averageRating),
            totalReviews: reviews.length,
            reviews // recent reviews
        };

        console.log('Returning worker stats:', response);
        res.json(response);

    } catch (err) {
        console.error('Error in getMyWorkerStats:', err.message);
        res.status(500).json({ msg: 'Server error', details: err.message });
    }
};

// Get all active workers for complaint form and booking assignment
exports.getActiveWorkers = async (req, res) => {
    try {
        const Review = require('../models/Review'); // Ensure Review model is loaded
        
        const workers = await User.find({
            role: 'worker',
            status: 'active'
        }).select('name email profession location phone _id experience photo');
        
        const workersWithStats = await Promise.all(workers.map(async (worker) => {
            const reviews = await Review.find({ worker: worker._id });
            let averageRating = 0;
            if (reviews.length > 0) {
                const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
                averageRating = (sum / reviews.length).toFixed(1);
            }
            
            return {
                ...worker.toObject(),
                rating: reviews.length > 0 ? parseFloat(averageRating) : 0,
                totalReviews: reviews.length
            };
        }));

        res.json(workersWithStats);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', details: err.message });
    }
};

// Get workers that customer has worked with recently for complaint form
exports.getCustomerWorkers = async (req, res) => {
    try {
        const ServiceRequest = require('../models/ServiceRequest');

        // Get all completed or confirmed service requests for this customer in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const serviceRequests = await ServiceRequest.find({
            customer: req.user.id,
            status: { $in: ['completed', 'confirmed'] },
            createdAt: { $gte: thirtyDaysAgo }
        }).populate('worker', 'name email profession location phone _id');

        // Extract unique workers from service requests
        const workerMap = new Map();
        serviceRequests.forEach(request => {
            if (request.worker && !workerMap.has(request.worker._id.toString())) {
                workerMap.set(request.worker._id.toString(), request.worker);
            }
        });

        const workers = Array.from(workerMap.values());
        res.json(workers);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', details: err.message });
    }
};

// Get current worker's payment status
exports.getMyPayment = async (req, res) => {
    try {
        const payment = await Payment.findOne({ worker_id: req.user.id }).sort({ payment_date: -1 });
        if (!payment) {
            return res.status(404).json({ msg: 'No payment found' });
        }
        res.json(payment);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', details: err.message });
    }
};

// @desc    Forgot password
// @route   POST /api/users/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ msg: 'There is no user with that email' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const message = `
            <div style="font-family: inherit; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
                <h2 style="color: #4f46e5; text-align: center; margin-bottom: 24px;">Password Reset Request</h2>
                <p style="color: #334155; font-size: 16px; line-height: 1.5;">Hello,</p>
                <p style="color: #334155; font-size: 16px; line-height: 1.5;">You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
                <p style="color: #334155; font-size: 16px; line-height: 1.5;">Please click the button below to set a new password. This link is valid for 10 minutes.</p>
                
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Set New Password</a>
                </div>
                
                <p style="color: #64748b; font-size: 14px; line-height: 1.5;">If you did not request a password reset, you can safely ignore this automated email.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="color: #94a3b8; font-size: 12px;">Button not working? Paste this link into your browser:<br /><a href="${resetUrl}" style="color: #4f46e5;">${resetUrl}</a></p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Your Password Reset Link - On-Demand Support',
                html: message
            });

            res.status(200).json({ success: true, msg: 'Email successfully sent' });
        } catch (err) {
            console.error('Email sending failed:', err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ msg: 'Email could not be sent. Please check SMTP configuration.' });
        }
    } catch (err) {
        console.error('Password reset handler error:', err.message);
        res.status(500).json({ msg: 'Server error during password reset' });
    }
};

// @desc    Reset password
// @route   PUT /api/users/resetpassword/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid token or token has expired' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, msg: 'Password updated successfully' });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error updating password' });
    }
};

// @desc    Renew worker subscription
// @route   POST /api/users/renew-subscription
// @access  Private
exports.renewSubscription = async (req, res) => {
    try {
        let user = await User.findById(req.user.id);
        if (!user || user.role !== 'worker') {
            return res.status(404).json({ msg: 'Worker not found' });
        }

        // Create new payment record
        const payment = new Payment({
            worker_id: user._id,
            amount: 99,
            payment_type: 'subscription_renewal',
            payment_status: 'paid'
        });
        await payment.save();

        // Update subscription expiry
        const now = new Date();
        const currentExpiry = user.subscriptionExpiry ? new Date(user.subscriptionExpiry) : now;
        
        // If already expired, start from now. If not expired, add 30 days to existing expiry.
        const baseDate = currentExpiry > now ? currentExpiry : now;
        baseDate.setDate(baseDate.getDate() + 30);
        
        user.subscriptionExpiry = baseDate;
        await user.save();

        res.json({ 
            msg: 'Subscription renewed successfully', 
            subscriptionExpiry: user.subscriptionExpiry 
        });
    } catch (err) {
        console.error('Renew subscription error:', err.message);
        res.status(500).json({ msg: 'Server error while renewing subscription' });
    }
};
