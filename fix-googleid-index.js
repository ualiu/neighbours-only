require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function fixIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop the problematic googleId index
    try {
      await User.collection.dropIndex('googleId_1');
      console.log('✅ Dropped old googleId index');
    } catch (err) {
      if (err.code === 27) {
        console.log('Index does not exist, skipping drop');
      } else {
        throw err;
      }
    }

    // Create new sparse unique index
    await User.collection.createIndex(
      { googleId: 1 },
      { unique: true, sparse: true }
    );
    console.log('✅ Created new sparse unique index for googleId');

    // Verify the index
    const indexes = await User.collection.indexes();
    console.log('\nCurrent indexes:');
    indexes.forEach(index => {
      console.log(`- ${JSON.stringify(index.key)}: ${JSON.stringify(index)}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error fixing index:', error);
    process.exit(1);
  }
}

fixIndex();
