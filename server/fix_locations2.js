require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;
    const reqs = await db.collection('servicerequests').find({ location: { $type: 'object' } }).toArray();
    console.log('Found', reqs.length, 'entries with object location');
    for (let r of reqs) {
        const locStr = (r.location && r.location.coordinates) 
            ? `${r.location.coordinates[1]}, ${r.location.coordinates[0]}` 
            : 'Unknown Location';
        await db.collection('servicerequests').updateOne({ _id: r._id }, { $set: { location: locStr } });
    }
    console.log('Fixed locations. Exiting...');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
