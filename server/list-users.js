// List all user accounts
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/tutoring-marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function listUsers() {
  try {
    const users = await User.find({}).select('name email role');
    
    console.log('\n📋 All User Accounts:\n');
    console.log('STUDENTS:');
    users.filter(u => u.role === 'student').forEach(u => {
      console.log(`  - ${u.name} (${u.email})`);
    });
    
    console.log('\nTUTORS:');
    users.filter(u => u.role === 'tutor').forEach(u => {
      console.log(`  - ${u.name} (${u.email})`);
    });
    
    console.log('\n💡 Default password for all accounts: password123');
    console.log('   (unless you changed it)\n');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

listUsers();
