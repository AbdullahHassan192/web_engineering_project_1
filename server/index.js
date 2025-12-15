const path = require('path');
// Load .env from root directory (parent of server/)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Validate environment variables immediately
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '' || process.env.JWT_SECRET.length < 10) {
  console.error('❌ ERROR: JWT_SECRET is not properly configured!');
  console.error('Current value:', process.env.JWT_SECRET || '(undefined)');
  console.error('Please update JWT_SECRET in your .env file with a secure random string (minimum 10 characters).');
  console.error('Example: JWT_SECRET=mySecureRandomString12345678901234567890');
  console.error('\nNote: Make sure .env file is in the root directory (same level as server/ folder)');
  process.exit(1);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const User = require('./models/User');
const { startReminderScheduler } = require('./utils/reminderScheduler');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const copilotRoutes = require('./routes/copilotRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const searchRoutes = require('./routes/searchRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Make io available to controllers
global.io = io;

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tutoring-marketplace';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('Seeding database...');
      
      const bcrypt = require('bcryptjs');
      const defaultPassword = await bcrypt.hash('password123', 10);

      const student = new User({
        name: 'Muhammad Arshyan',
        email: 'arshyan@seecs.edu.pk',
        passwordHash: defaultPassword,
        role: 'student',
        bio: 'Data Science Student from SEECS Batch \'23',
        isCopilotEnabled: true
      });
      await student.save();
      console.log('✓ Student profile created: Muhammad Arshyan');

      const tutor = new User({
        name: 'Expert Tutor',
        email: 'tutor@seecs.edu.pk',
        passwordHash: defaultPassword,
        role: 'tutor',
        bio: 'Experienced tutor specializing in Machine Learning, CNN Architecture, and Unreal Engine 5',
        subjects: ['Machine Learning', 'CNN Architecture', 'Unreal Engine 5', 'Deep Learning', 'Computer Vision'],
        hourlyRate: 50,
        isCopilotEnabled: true,
        availability: []
      });
      await tutor.save();
      console.log('✓ Tutor profile created: Expert Tutor');
      
      console.log('Database seeding completed!');
    } else {
      console.log('Database already contains users, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✓ MongoDB connected successfully');
    return seedDatabase();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('booking:create', (data) => {
    io.emit('booking:new', data);
  });

  socket.on('booking:update', (data) => {
    io.emit('booking:updated', data);
  });
});



// Use error handler (must be last)
app.use(errorHandler);

// 404 handler (before error handler)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

server.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start reminder scheduler for 15-minute notifications
  startReminderScheduler(io);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});


