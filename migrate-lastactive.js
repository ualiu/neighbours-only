require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all users without lastActive to current time
    const result = await User.updateMany(
      { lastActive: { $exists: false } },
      { lastActive: new Date() }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with lastActive timestamp`);

    // Also update showOnlineStatus for users who don't have it
    const result2 = await User.updateMany(
      { 'settings.showOnlineStatus': { $exists: false } },
      { 'settings.showOnlineStatus': true }
    );

    console.log(`✅ Updated ${result2.modifiedCount} users with showOnlineStatus setting`);

    // Show all users
    const users = await User.find({}).select('displayName lastActive settings');
    console.log('\nAll users:');
    users.forEach(u => {
      console.log(`- ${u.displayName}: lastActive=${u.lastActive}, showOnlineStatus=${u.settings?.showOnlineStatus}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
