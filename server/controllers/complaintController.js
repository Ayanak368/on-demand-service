const Complaint = require('../models/Complaint');

// Create Complaint (Customer)
exports.createComplaint = async (req, res) => {
    try {
        const { worker, subject, description } = req.body;

        // Handle general complaints (not about specific worker)
        const workerValue = worker === 'general' ? 'general' : worker;

        const newComplaint = new Complaint({
            customer: req.user.id,
            worker: workerValue,
            subject,
            description
        });

        const complaint = await newComplaint.save();

        // Notify Admins
        const User = require('../models/User');
        const Notification = require('../models/Notification');
        const admins = await User.find({ role: 'admin' });

        const notifications = admins.map(admin => ({
            userId: admin._id,
            message: `New complaint filed: ${subject}`,
            type: 'warning'
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.json(complaint);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get Complaints (Admin sees all, Customer sees theirs, Worker sees theirs)
exports.getComplaints = async (req, res) => {
    try {
        let complaints;
        if (req.user.role === 'admin') {
            complaints = await Complaint.find()
                .populate('customer', 'name email')
                .populate('serviceRequest', 'serviceType');

            // Populate worker field separately
            complaints = await Promise.all(
                complaints.map(async (complaint) => {
                    if (complaint.worker && complaint.worker !== 'general') {
                        return Complaint.findById(complaint._id)
                            .populate('customer', 'name email')
                            .populate('serviceRequest', 'serviceType')
                            .populate('worker', 'name email');
                    }
                    return complaint;
                })
            );
        } else if (req.user.role === 'customer') {
            complaints = await Complaint.find({ customer: req.user.id })
                .populate('serviceRequest', 'serviceType');

            // Populate worker field separately
            complaints = await Promise.all(
                complaints.map(async (complaint) => {
                    if (complaint.worker && complaint.worker !== 'general') {
                        return Complaint.findById(complaint._id)
                            .populate('serviceRequest', 'serviceType')
                            .populate('worker', 'name');
                    }
                    return complaint;
                })
            );
        } else if (req.user.role === 'worker') {
            complaints = await Complaint.find({ worker: req.user.id })
                .populate('customer', 'name')
                .populate('serviceRequest', 'serviceType');
        }
        res.json(complaints);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Reply to Complaint (Admin/Worker)
exports.replyToComplaint = async (req, res) => {
    try {
        const { reply } = req.body;
        let complaint = await Complaint.findById(req.params.id);

        if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });

        complaint.reply = reply;
        complaint.status = 'resolved'; // Auto-resolve on reply? Or make separate action. Let's assume reply resolves or progresses it.
        await complaint.save();

        res.json(complaint);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Delete Complaint
exports.deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });

        // Check if user is admin or the creator
        if (req.user.role !== 'admin' && complaint.customer.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Complaint.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Complaint removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
