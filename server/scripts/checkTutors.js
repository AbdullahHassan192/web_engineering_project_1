const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/tutorConnect');

setTimeout(async () => {
  try {
    const tutors = await User.find({ role: 'tutor' }).select('name email role averageRating totalReviews');
    console.log(`\nFound ${tutors.length} tutors in database:`);
    tutors.forEach(t => {
      console.log(`  - ${t.name} (${t.email})`);
      console.log(`    Rating: ${t.averageRating || 'N/A'}, Reviews: ${t.totalReviews || 0}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}, 1000);
