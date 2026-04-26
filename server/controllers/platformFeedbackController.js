const PlatformFeedback = require('../models/PlatformFeedback');
const Notification = require('../models/Notification');

exports.createFeedback = async (req, res) => {
    try {
        const { rating, feedback } = req.body;

        const newFeedback = new PlatformFeedback({
            customer: req.user.id,
            rating,
            feedback
        });

        const savedFeedback = await newFeedback.save();
        res.status(201).json(savedFeedback);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getFeedbacks = async (req, res) => {
    try {
        const feedbacks = await PlatformFeedback.find()
            .populate('customer', 'name email profilePic')
            .sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.replyFeedback = async (req, res) => {
    try {
        const { reply } = req.body;
        const feedback = await PlatformFeedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ msg: 'Feedback not found' });
        }

        feedback.reply = reply;
        await feedback.save();

        if (feedback.customer) {
            const notif = new Notification({
                userId: feedback.customer,
                message: `Admin replied to your feedback: "${reply}"`,
                type: 'info'
            });
            await notif.save();
        }

        res.json(feedback);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
