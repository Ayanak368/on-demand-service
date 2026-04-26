const Offer = require('../models/Offer');

// @route   POST /api/offers
// @desc    Add a new offer (Admin only)
// @access  Private/Admin
exports.createOffer = async (req, res) => {
    try {
        const { title, type, description, serviceCategory, buttonText, buttonLink, colorTheme, iconType, validUntil, status } = req.body;

        const newOffer = new Offer({
            title,
            type,
            description,
            serviceCategory,
            buttonText,
            buttonLink,
            colorTheme,
            iconType,
            validUntil,
            status
        });

        const offer = await newOffer.save();
        res.json(offer);
    } catch (err) {
        console.error('Error creating offer:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/offers
// @desc    Get all offers (Admin) or active/unexpired offers (Customer)
// @access  Public (conditionally filtered)
exports.getOffers = async (req, res) => {
    try {
        const { active } = req.query;
        let query = {};

        if (active === 'true') {
            query.status = 'active';
            query.validUntil = { $gte: new Date() }; // Only unexpired
        }

        const offers = await Offer.find(query).sort({ createdAt: -1 });
        res.json(offers);
    } catch (err) {
        console.error('Error fetching offers:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT /api/offers/:id
// @desc    Update an offer (Admin only)
// @access  Private/Admin
exports.updateOffer = async (req, res) => {
    try {
        const { title, type, description, serviceCategory, buttonText, buttonLink, colorTheme, iconType, validUntil, status } = req.body;

        let offer = await Offer.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({ msg: 'Offer not found' });
        }

        offer.title = title || offer.title;
        offer.type = type || offer.type;
        offer.description = description || offer.description;
        offer.serviceCategory = serviceCategory || offer.serviceCategory;
        offer.buttonText = buttonText || offer.buttonText;
        offer.buttonLink = buttonLink || offer.buttonLink;
        offer.colorTheme = colorTheme || offer.colorTheme;
        offer.iconType = iconType || offer.iconType;
        offer.validUntil = validUntil || offer.validUntil;
        offer.status = status || offer.status;

        await offer.save();
        res.json(offer);
    } catch (err) {
        console.error('Error updating offer:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE /api/offers/:id
// @desc    Delete an offer (Admin only)
// @access  Private/Admin
exports.deleteOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);

        if (!offer) {
            return res.status(404).json({ msg: 'Offer not found' });
        }

        await offer.deleteOne();
        res.json({ msg: 'Offer removed' });
    } catch (err) {
        console.error('Error deleting offer:', err.message);
        res.status(500).send('Server Error');
    }
};
