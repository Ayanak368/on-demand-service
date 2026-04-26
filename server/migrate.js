const mongoose = require('mongoose');

const localDB = 'mongodb://localhost:27017/on-demand-workforce';
const atlasDB = 'mongodb+srv://ayanak:Ayanak@cluster0.mjqunpn.mongodb.net/on-demand-workforce?retryWrites=true&w=majority';

async function migrate() {
    try {
        console.log('🔄 Starting migration from Local MongoDB to Atlas...\n');

        // Connect to local database
        console.log('📡 Connecting to Local MongoDB...');
        const localConnection = await mongoose.createConnection(localDB).asPromise();
        console.log('✅ Connected to Local MongoDB\n');

        // Get all collections
        const collections = await localConnection.db.listCollections().toArray();
        console.log(`📦 Found ${collections.length} collections\n`);

        // Connect to Atlas
        console.log('📡 Connecting to MongoDB Atlas...');
        const atlasConnection = await mongoose.createConnection(atlasDB).asPromise();
        console.log('✅ Connected to MongoDB Atlas\n');

        // Migrate each collection
        for (const collection of collections) {
            const collectionName = collection.name;
            console.log(`⏳ Migrating collection: ${collectionName}`);

            try {
                // Get data from local DB
                const documents = await localConnection.db.collection(collectionName).find({}).toArray();
                console.log(`   Found ${documents.length} documents`);

                if (documents.length > 0) {
                    // Insert into Atlas
                    const result = await atlasConnection.db.collection(collectionName).insertMany(documents);
                    console.log(`   ✅ Inserted ${result.insertedCount} documents to Atlas\n`);
                } else {
                    console.log(`   ℹ️  No documents to migrate\n`);
                }
            } catch (error) {
                console.error(`   ❌ Error migrating ${collectionName}: ${error.message}\n`);
            }
        }

        // Verify migration
        console.log('🔍 Verifying migration...\n');
        for (const collection of collections) {
            const collectionName = collection.name;
            const count = await atlasConnection.db.collection(collectionName).countDocuments();
            console.log(`   ${collectionName}: ${count} documents`);
        }

        console.log('\n✅ Migration Complete!');

        // Disconnect
        await localConnection.close();
        await atlasConnection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrate();
