// Script to fix memberCount for all neighborhoods
// Run with: node fix-membercount.js

require('dotenv').config();
const mongoose = require('mongoose');
const Neighborhood = require('./models/Neighborhood');
const User = require('./models/User');

async function fixMemberCount() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all neighborhoods
    const neighborhoods = await Neighborhood.find();

    for (const neighborhood of neighborhoods) {
      // Count actual users in this neighborhood
      const actualCount = await User.countDocuments({
        neighborhoodId: neighborhood._id,
      });

      // Update the memberCount
      neighborhood.memberCount = actualCount;
      await neighborhood.save();

      console.log(
        `✅ ${neighborhood.name}: Updated from ${neighborhood.memberCount} to ${actualCount} members`
      );
    }

    console.log('\n✅ All neighborhoods updated!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixMemberCount();
