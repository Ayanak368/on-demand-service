const Service = require('../models/Service');

// @desc    Get all active services
// @route   GET /api/services
// @access  Public (or authenticated)
exports.getServices = async (req, res) => {
    try {
        const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(services);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all services (including inactive for Admin)
// @route   GET /api/services/admin
// @access  Private/Admin
exports.getAllServicesAdmin = async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.json(services);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add new service
// @route   POST /api/services
// @access  Private/Admin
exports.addService = async (req, res) => {
    const { name, description, price, iconName, color } = req.body;

    try {
        let service = await Service.findOne({ name });
        if (service) {
            return res.status(400).json({ msg: 'Service already exists' });
        }

        service = new Service({
            name,
            description,
            price,
            iconName,
            color
        });

        await service.save();
        res.status(201).json(service);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
exports.updateService = async (req, res) => {
    const { name, description, price, iconName, color, isActive } = req.body;

    try {
        let service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ msg: 'Service not found' });

        if (name) service.name = name;
        if (description) service.description = description;
        if (price) service.price = price;
        if (iconName) service.iconName = iconName;
        if (color) service.color = color;
        if (typeof isActive === 'boolean') service.isActive = isActive;

        await service.save();
        res.json(service);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Service not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ msg: 'Service not found' });

        await service.deleteOne();
        res.json({ msg: 'Service removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Service not found' });
        }
        res.status(500).send('Server Error');
    }
};
