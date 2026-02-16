const User = require('../models/User');

// Get all workers (pending/active/blocked)
exports.getWorkers = async (req, res) => {
    try {
        const workers = await User.find({ role: 'worker' }).select('-password');
        res.json(workers);
    } catch (err) {
        console.error(err.message);
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

        worker.status = status;
        await worker.save();

        res.json(worker);
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
