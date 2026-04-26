const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create Service Request (Customer only)
exports.createServiceRequest = async (req, res) => {
    try {
        const { serviceType, details, location, worker, date, time, price, appliedOffer } = req.body;

        const getTargetProfession = (name) => {
            if (name.includes('Cleaning')) return 'Cleaner';
            if (name.includes('AC')) return 'AC Technician';
            return name;
        };
        const targetProf = getTargetProfession(serviceType);

        // Check if there are any active workers for this service type
        const activeWorkersCount = await User.countDocuments({
            role: 'worker',
            status: 'active',
            $or: [
                { profession: { $regex: new RegExp(`^${serviceType}$`, 'i') } },
                { profession: { $regex: new RegExp(`^${targetProf}$`, 'i') } }
            ]
        });

        if (activeWorkersCount === 0) {
            return res.status(400).json({ msg: `Sorry, there are currently no active professionals available for ${serviceType}. Please try another service or check back later.` });
        }

        // compute numeric price if provided as string or empty
        let numericPrice = null;
        if (price != null) {
            numericPrice = parseFloat(price);
            if (isNaN(numericPrice) || numericPrice <= 0) numericPrice = null;
        }

        // if no valid price supplied, try lookup service catalog
        if (numericPrice == null) {
            const Service = require('../models/Service');
            const svc = await Service.findOne({ name: serviceType });
            if (svc && svc.price) {
                const parsed = parseInt((svc.price || '').replace(/\D/g, ''), 10);
                if (!isNaN(parsed) && parsed > 0) {
                    numericPrice = parsed;
                }
            }
        }

        // fallback to 500 if still not computed
        if (numericPrice == null) numericPrice = 500;

        // Calculate initial discount if offer is applied at creation time
        let originalFinalPrice = null;
        let calculatedPrice = numericPrice;
        
        if (appliedOffer) {
            const match = appliedOffer.match(/(\d+)%/);
            if (match && match[1]) {
                const discountPercentage = parseInt(match[1], 10);
                const discountAmount = (numericPrice * discountPercentage) / 100;
                calculatedPrice = numericPrice - discountAmount;
                originalFinalPrice = numericPrice;
            } else if (appliedOffer.toLowerCase().includes('free')) {
                calculatedPrice = 0;
                originalFinalPrice = numericPrice;
            }
        }

        const requestData = {
            customer: req.user.id,
            serviceType,
            details,
            location,
            date,
            time,
            price: calculatedPrice, // Store the calculated discounted price directly
            originalFinalPrice,

            appliedOffer
        };

        if (worker) {
            requestData.worker = worker;
        }

        const newRequest = new ServiceRequest(requestData);

        const request = await newRequest.save();

        res.json(request);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get Service Requests
exports.getServiceRequests = async (req, res) => {
    try {
        let requests;
        // If worker, get unassigned pending requests matching profession OR requests assigned to them
        if (req.user.role === 'worker') {
            const worker = await User.findById(req.user.id);
            requests = await ServiceRequest.find({
                $or: [
                    { status: 'pending', serviceType: { $regex: new RegExp(`^${worker.profession}$`, 'i') }, worker: { $exists: false } },
                    { worker: req.user.id }
                ]
            }).populate('customer', 'name email phone address');
        }
        // If customer, get only their requests
        else if (req.user.role === 'customer') {
            requests = await ServiceRequest.find({ customer: req.user.id }).populate('worker', 'name email phone address');
        }
        else {
            requests = await ServiceRequest.find().populate('customer', 'name email phone address').populate('worker', 'name email phone address');
        }
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update Status (Worker Accept/Complete)
exports.updateServiceRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!req.user || req.user.role !== 'worker') {
            return res.status(401).json({ msg: 'Only workers may update job status' });
        }

        // validate id format
        const { Types } = require('mongoose');
        if (!Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ msg: 'Invalid job ID' });
        }

        let request;
        try {
            request = await ServiceRequest.findById(req.params.id);
        } catch (err) {
            console.error('error finding request', err);
            return res.status(500).json({ msg: 'Error retrieving job' });
        }

        if (!request) return res.status(404).json({ msg: 'Request not found' });

        // Worker accepting request
        if (status === 'accepted') {
            if (request.status !== 'pending') {
                return res.status(400).json({ msg: 'Request already taken or not pending' });
            }
            request.worker = req.user.id;
            request.status = 'accepted';
            // notify the customer that their request has been accepted
            try {
                const workerUser = await User.findById(req.user.id).select('name');
                const notif = new Notification({
                    userId: request.customer,
                    message: `Your booking request for ${request.serviceType} has been accepted by ${workerUser.name}.`,
                    type: 'info'
                });
                await notif.save();
            } catch (err) {
                console.error('error creating acceptance notification', err);
            }
        }
        // Worker completing request
        else if (status === 'completed') {
            if (!request.worker) {
                return res.status(400).json({ msg: 'No worker assigned yet' });
            }
            if (request.worker.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'Not authorized to complete this job' });
            }
            if (request.status !== 'accepted' && request.status !== 'confirmed') {
                return res.status(400).json({ msg: 'Job must be accepted before completion' });
            }
            request.status = 'completed';
        } else {
            return res.status(400).json({ msg: 'Unsupported status update' });
        }

        const saved = await request.save();
        res.json(saved);
    } catch (err) {
        console.error('updateServiceRequestStatus error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Confirm Service Request (Customer)
exports.confirmServiceRequest = async (req, res) => {
    try {
        let request = await ServiceRequest.findById(req.params.id).populate('customer', 'name');

        if (!request) return res.status(404).json({ msg: 'Request not found' });

        if (req.user.role !== 'customer' || request.customer._id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to confirm this booking' });
        }

        if (request.status !== 'accepted') {
            return res.status(400).json({ msg: 'Booking must be in accepted status to confirm' });
        }

        request.status = 'confirmed';
        await request.save();

        // Create notification for worker
        if (request.worker) {
            const newNotif = new Notification({
                userId: request.worker,
                message: `Customer ${request.customer.name} has paid the ₹100 Visit Charge for ${request.serviceType}. You can now proceed to submit the final quote.`,
                type: 'success'
            });
            await newNotif.save();
        }

        res.json(request);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.cancelServiceRequest = async (req, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.id)
            .populate('customer', 'name');

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        // Authorize
        if (request.customer._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        request.status = 'cancelled';
        await request.save();

        // Create notification for worker if assigned
        if (request.worker) {
            const newNotif = new Notification({
                userId: request.worker,
                message: `Customer ${request.customer.name} has cancelled their booking request for ${request.serviceType}.`,
                type: 'info'
            });
            await newNotif.save();
        }

        res.json(request);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// (payment functionality removed – handled offline by design)
// The previous payServiceRequest endpoint has been deprecated. Keeping this stub
// allows old clients to receive a friendly message if they still call it.
exports.payServiceRequest = async (req, res) => {
    res.status(410).json({ msg: 'Payment endpoint removed; payment is now offline and not tracked.' });
};

// Update Final Price (Worker)
exports.updateFinalPrice = async (req, res) => {
    try {
        const { finalPrice } = req.body;

        if (!req.user || req.user.role !== 'worker') {
            return res.status(401).json({ msg: 'Only workers can update price' });
        }

        if (!finalPrice || isNaN(finalPrice)) {
            return res.status(400).json({ msg: 'Invalid price' });
        }

        const request = await ServiceRequest.findById(req.params.id).populate('customer', 'name email');

        if (!request) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        if (request.worker.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to update this request' });
        }

        let calculatedPrice = parseFloat(finalPrice);
        request.originalFinalPrice = calculatedPrice;

        if (request.appliedOffer) {
            const match = request.appliedOffer.match(/(\d+)%/);
            if (match && match[1]) {
                const discount = parseInt(match[1], 10);
                calculatedPrice = calculatedPrice - (calculatedPrice * discount / 100);
            }
        }

        request.finalPrice = calculatedPrice;
        request.priceSubmitted = true;
        await request.save();

        // Get worker name for notification
        const worker = await User.findById(req.user.id).select('name');
        
        // Ensure customer ID is handled correctly whether populated or not
        const customerId = request.customer._id || request.customer;

        let notifMsg = `${worker.name || 'Professional'} has submitted a price of ₹${request.originalFinalPrice} for your ${request.serviceType} request.`;
        if (request.originalFinalPrice !== calculatedPrice) {
            notifMsg += ` Your offer "${request.appliedOffer}" was applied, bringing your final price to ₹${calculatedPrice}!`;
        } else {
            notifMsg += ` Please confirm to proceed.`;
        }

        // Create notification for customer
        const notif = new Notification({
            userId: customerId,
            message: notifMsg,
            type: 'info'
        });
        await notif.save();

        res.json(request);
    } catch (err) {
        console.error('updateFinalPrice error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Submit Worker Price (Alternative endpoint)
exports.submitWorkerPrice = async (req, res) => {
    try {
        const { price } = req.body;

        if (!req.user || req.user.role !== 'worker') {
            return res.status(401).json({ msg: 'Only workers can submit price' });
        }

        const request = await ServiceRequest.findById(req.params.bookingId).populate('customer', 'name email');

        if (!request) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        if (request.worker.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        let calculatedPrice = parseFloat(price);
        request.originalFinalPrice = calculatedPrice;

        if (request.appliedOffer) {
            const match = request.appliedOffer.match(/(\d+)%/);
            if (match && match[1]) {
                const discount = parseInt(match[1], 10);
                calculatedPrice = calculatedPrice - (calculatedPrice * discount / 100);
            }
        }

        request.finalPrice = calculatedPrice;
        request.priceSubmitted = true;
        await request.save();

        // Get worker name for notification
        const worker = await User.findById(req.user.id).select('name');
        
        // Ensure customer ID is handled correctly whether populated or not
        const customerId = request.customer._id || request.customer;

        let notifMsg = `${worker.name || 'Professional'} has submitted a price of ₹${request.originalFinalPrice} for your ${request.serviceType} request.`;
        if (request.originalFinalPrice !== calculatedPrice) {
            notifMsg += ` Your offer "${request.appliedOffer}" was applied, bringing your final price to ₹${calculatedPrice}!`;
        } else {
            notifMsg += ` Please confirm to proceed.`;
        }

        // Create notification for customer
        const notif = new Notification({
            userId: customerId,
            message: notifMsg,
            type: 'info'
        });
        await notif.save();

        res.json(request);
    } catch (err) {
        console.error('submitWorkerPrice error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Approve Price (Customer)
exports.approvePrice = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'customer') {
            return res.status(401).json({ msg: 'Only customers can approve price' });
        }

        const request = await ServiceRequest.findById(req.params.bookingId).populate('worker', 'name').populate('customer', '_id');

        if (!request) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        if (request.customer._id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        request.status = 'confirmed';
        request.priceConfirmed = true;
        await request.save();

        // Create notification for worker
        const workerNotif = new Notification({
            userId: request.worker._id,
            message: `Customer has confirmed the price of ₹${request.finalPrice} for your ${request.serviceType} job.`,
            type: 'success'
        });
        await workerNotif.save();

        res.json(request);
    } catch (err) {
        console.error('approvePrice error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Pay Final Price (Customer)
exports.payFinalPrice = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'customer') {
            return res.status(401).json({ msg: 'Only customers can pay' });
        }

        const { paymentMethod, isPaid } = req.body;
        const request = await ServiceRequest.findById(req.params.bookingId).populate('worker', 'name').populate('customer', '_id');

        if (!request) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        if (request.customer._id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        request.finalPaymentMethod = paymentMethod;
        request.isFinalPaid = isPaid;
        
        await request.save();

        // Create notification for worker
        const workerNotif = new Notification({
            userId: request.worker._id,
            message: `Customer has completed the payment for the ${request.serviceType} job (${paymentMethod}).`,
            type: 'success'
        });
        await workerNotif.save();

        res.json(request);
    } catch (err) {
        console.error('payFinalPrice error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Complete Job (Worker)
exports.completeJob = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'worker') {
            return res.status(401).json({ msg: 'Only workers can complete job' });
        }

        const request = await ServiceRequest.findById(req.params.bookingId).populate('customer', 'name');

        if (!request) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        if (request.worker.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        request.status = 'completed';
        await request.save();

        // Create notification for customer
        const notif = new Notification({
            userId: request.customer._id,
            message: `Your ${request.serviceType} job has been completed. Final amount due: ₹${request.finalPrice}`,
            type: 'success'
        });
        await notif.save();

        res.json(request);
    } catch (err) {
        console.error('completeJob error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};
