const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const atlasDB = 'mongodb+srv://ayanak:Ayanak@cluster0.mjqunpn.mongodb.net/on-demand-workforce?retryWrites=true&w=majority';

async function createAdmin() {
    try {
        console.log('🔐 Creating new admin account...\n');

        // Connect to Atlas
        const connection = await mongoose.createConnection(atlasDB).asPromise();
        console.log('✅ Connected to MongoDB Atlas\n');

        // Hash password
        const password = 'Admin@123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin user
        const adminUser = {
            name: 'Admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            profession: 'Administrator',
            location: 'System',
            phone: '0000000000',
            address: 'Admin Account',
            status: 'active',
            createdAt: new Date()
        };

        // Delete existing admin if exists
        await connection.db.collection('users').deleteOne({ email: 'admin@example.com', role: 'admin' });

        // Insert new admin
        const result = await connection.db.collection('users').insertOne(adminUser);

        console.log('✅ Admin account created successfully!\n');
        console.log('📧 Email: admin@example.com');
        console.log('🔑 Password: Admin@123\n');
        console.log('⚠️  Please change this password after first login!');

        await connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create admin:', error.message);
        process.exit(1);
    }
}

createAdmin();
