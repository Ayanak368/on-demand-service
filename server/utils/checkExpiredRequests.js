const ServiceRequest = require('../models/ServiceRequest');

const checkExpiredRequests = async () => {
    try {
        const now = new Date();
        const pendingRequests = await ServiceRequest.find({ status: 'pending', date: { $exists: true, $ne: null } });

        let expiredCount = 0;

        for (const req of pendingRequests) {
            if (!req.date) continue;

            let requestDateObj;
            if (req.time) {
                // date format: YYYY-MM-DD, time format: HH:MM
                requestDateObj = new Date(`${req.date}T${req.time}:00`);
            } else {
                requestDateObj = new Date(req.date);
            }

            // Check if valid date and has passed
            if (!isNaN(requestDateObj.getTime())) {
                if (requestDateObj < now) {
                    req.status = 'cancelled';
                    await req.save();
                    expiredCount++;
                    
                    // Create notification for customer
                    try {
                        const Notification = require('../models/Notification');
                        const notif = new Notification({
                            userId: req.customer,
                            message: `Your service request for ${req.serviceType} has been automatically cancelled as the booking time has passed without any professional accepting it.`,
                            type: 'info'
                        });
                        await notif.save();
                    } catch (err) {
                        console.error('Error creating auto-cancel notification:', err);
                    }
                }
            }
        }

        if (expiredCount > 0) {
            console.log(`[Auto-Cancel] Cancelled ${expiredCount} expired pending requests.`);
        }

        // Check overdue active jobs to notify customers
        const activeStatuses = ['accepted', 'confirmed', 'Price Submitted', 'price submitted', 'Price Approved', 'price approved'];
        const activeRequests = await ServiceRequest.find({ 
            status: { $in: activeStatuses }, 
            date: { $exists: true, $ne: null },
            overdueNotified: { $ne: true } 
        });

        let overdueNotifiedCount = 0;

        for (const req of activeRequests) {
            if (!req.date) continue;

            let requestDateObj;
            if (req.time) {
                requestDateObj = new Date(`${req.date}T${req.time}:00`);
            } else {
                requestDateObj = new Date(req.date);
                requestDateObj.setHours(23, 59, 59, 999);
            }

            if (!isNaN(requestDateObj.getTime())) {
                if (requestDateObj < now) {
                    req.overdueNotified = true;
                    await req.save();
                    overdueNotifiedCount++;
                    
                    try {
                        const Notification = require('../models/Notification');
                        const notif = new Notification({
                            userId: req.customer,
                            message: `Your service request for ${req.serviceType} is currently overdue. The scheduled time has passed. Please contact your professional for an update.`,
                            type: 'warning'
                        });
                        await notif.save();
                    } catch (err) {
                        console.error('Error creating overdue notification:', err);
                    }
                }
            }
        }

        if (overdueNotifiedCount > 0) {
             console.log(`[Overdue-Check] Notified customers for ${overdueNotifiedCount} overdue active requests.`);
        }

    } catch (err) {
        console.error('Error checking expired requests:', err);
    }
};

const startExpiredRequestCheck = () => {
    // Run the check every minute
    setInterval(checkExpiredRequests, 60 * 1000);
    // Also run once immediately
    checkExpiredRequests();
};

module.exports = startExpiredRequestCheck;
