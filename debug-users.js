require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function debug() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const now = new Date();

    // Get all users
    const allUsers = await User.find({})
      .select('displayName email neighborhoodId lastActive settings hasCompletedProfile createdAt');

    console.log('=== ALL USERS ===');
    allUsers.forEach(user => {
      const minutesAgo = user.lastActive ? Math.round((now - user.lastActive) / 60000) : 'never';
      console.log(`\n${user.displayName} (${user.email})`);
      console.log(`  - Neighborhood ID: ${user.neighborhoodId}`);
      console.log(`  - Last Active: ${user.lastActive} (${minutesAgo} minutes ago)`);
      console.log(`  - Show Online Status: ${user.settings?.showOnlineStatus}`);
      console.log(`  - Completed Profile: ${user.hasCompletedProfile}`);
      console.log(`  - Would show as online: ${user.lastActive >= fiveMinutesAgo && user.settings?.showOnlineStatus === true ? 'YES' : 'NO'}`);
    });

    // Group by neighborhood
    console.log('\n\n=== BY NEIGHBORHOOD ===');
    const neighborhoods = [...new Set(allUsers.map(u => u.neighborhoodId?.toString()))];

    for (const neighborhoodId of neighborhoods) {
      if (!neighborhoodId) continue;

      const usersInNeighborhood = allUsers.filter(u => u.neighborhoodId?.toString() === neighborhoodId);
      const onlineUsers = usersInNeighborhood.filter(u =>
        u.lastActive >= fiveMinutesAgo && u.settings?.showOnlineStatus === true
      );

      console.log(`\nNeighborhood ${neighborhoodId}:`);
      console.log(`  Total members: ${usersInNeighborhood.length}`);
      console.log(`  Online now: ${onlineUsers.length}`);
      console.log(`  Online users: ${onlineUsers.map(u => u.displayName).join(', ') || 'none'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Debug error:', error);
    process.exit(1);
  }
}

debug();
