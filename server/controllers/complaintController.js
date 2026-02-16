const Complaint = require('../models/Complaint');

// Create Complaint (Customer)
exports.createComplaint = async (req, res) => {
    try {
        const { workerId, serviceRequestId, subject, description } = req.body;

        const newComplaint = new Complaint({
            customer: req.user.id,
            worker: workerId,
            serviceRequest: serviceRequestId,
            subject,
            description
        });

        const complaint = await newComplaint.save();
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
                .populate('worker', 'name email')
                .populate('serviceRequest', 'serviceType');
        } else if (req.user.role === 'customer') {
            complaints = await Complaint.find({ customer: req.user.id })
                .populate('worker', 'name')
                .populate('serviceRequest', 'serviceType');
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
