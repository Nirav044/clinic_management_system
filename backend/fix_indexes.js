const mongoose = require('mongoose');
const uri = 'mongodb://localhost:27017/smartclinic';

console.log('Connecting to:', uri);

mongoose.connect(uri)
    .then(async () => {
        console.log('✅ Connected.');
        try {
            // Force drop the old index that is causing collisions
            await mongoose.connection.collection('appointments').dropIndex('token_1_clinicId_1');
            console.log('🚀 Successfully dropped stale index: token_1_clinicId_1');
        } catch (err) {
            console.log('ℹ️ Index not found or already dropped:', err.message);
        }

        // Verify existing indexes
        const indexes = await mongoose.connection.collection('appointments').indexes();
        console.log('Current active indexes:', JSON.stringify(indexes, null, 2));
        
    })
    .catch(err => console.error('❌ Connection error:', err))
    .finally(() => {
        mongoose.disconnect();
        console.log('👋 Disconnected.');
        process.exit(0);
    });
