const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');

// Create Service Request (Customer only)
exports.createServiceRequest = async (req, res) => {
    try {
        const { serviceType, details, location } = req.body;

        const newRequest = new ServiceRequest({
            customer: req.user.id,
            serviceType,
            details,
            location
        });

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
        // If worker, get pending requests matching profession OR requests assigned to them
        if (req.user.role === 'worker') {
            const worker = await User.findById(req.user.id);
            requests = await ServiceRequest.find({
                $or: [
                    { status: 'pending', serviceType: { $regex: new RegExp(`^${worker.profession}$`, 'i') } },
                    { worker: req.user.id }
                ]
            }).populate('customer', 'name email');
        }
        // If customer, get only their requests
        else if (req.user.role === 'customer') {
            requests = await ServiceRequest.find({ customer: req.user.id }).populate('worker', 'name email');
        }
        else {
            requests = await ServiceRequest.find().populate('customer', 'name').populate('worker', 'name');
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
        console.log('Update Request Status:', req.params.id, status, req.user.id);
        let request = await ServiceRequest.findById(req.params.id);

        if (!request) return res.status(404).json({ msg: 'Request not found' });

        // Worker accepting request
        if (status === 'accepted' && req.user.role === 'worker') {
            if (request.status !== 'pending') {
                return res.status(400).json({ msg: 'Request already taken' });
            }
            request.worker = req.user.id;
            request.status = 'accepted';
        }
        // Worker completing request
        else if (status === 'completed' && req.user.role === 'worker') {
            if (request.worker.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'Not authorized' });
            }
            request.status = 'completed';
        }

        await request.save();
        res.json(request);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
