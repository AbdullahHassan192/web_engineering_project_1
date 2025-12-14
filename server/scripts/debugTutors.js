const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/tutorConnect');

setTimeout(async () => {
  try {
    // Check all users
    const allUsers = await User.find({});
    console.log(`\nTotal users in database: ${allUsers.length}`);
    
    // Check tutors specifically
    const tutors = await User.find({ role: 'tutor' });
    console.log(`Total tutors: ${tutors.length}\n`);
    
    // Group by email domain
    const byDomain = {};
    tutors.forEach(t => {
      const domain = t.email.split('@')[1];
      if (!byDomain[domain]) byDomain[domain] = [];
      byDomain[domain].push(t.name);
    });
    
    console.log('Tutors by email domain:');
    Object.keys(byDomain).forEach(domain => {
      console.log(`\n${domain}:`);
      byDomain[domain].forEach(name => console.log(`  - ${name}`));
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}, 1000);
