const mongoose = require('mongoose');

const atlasDB = 'mongodb+srv://ayanak:Ayanak@cluster0.mjqunpn.mongodb.net/on-demand-workforce?retryWrites=true&w=majority';

async function restoreWorker() {
    try {
        console.log('🔄 Restoring plumber1 worker to Atlas...\n');

        const connection = await mongoose.createConnection(atlasDB).asPromise();

        const workerData = {
            name: 'plumber1',
            email: 'plumber1@gmail.com',
            password: '$2b$10$IDi8QmU5xHmqB4C5J7rUQORJr6b77CDO16XMtgRojaD2jYUlaaLNW',
            role: 'worker',
            profession: 'Plumber',
            location: 'Loca',
            phone: '3256874156',
            address: 'kiyakkayil,vadakara,calicut',
            experience: '2',
            photo: '',
            status: 'pending',
            createdAt: new Date('2026-02-21T08:08:57.987Z')
        };

        const result = await connection.db.collection('users').insertOne(workerData);

        console.log('✅ Plumber1 worker restored to Atlas!\n');
        console.log('📋 Details:');
        console.log('   Name: plumber1');
        console.log('   Email: plumber1@gmail.com');
        console.log('   Profession: Plumber');
        console.log('   Status: Pending (needs admin approval)');

        await connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

restoreWorker();
