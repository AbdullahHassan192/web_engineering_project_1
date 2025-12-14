const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isValidEmail, isValidPassword, isValidName, sanitizeString, isValidHourlyRate, isValidSubjects } = require('../utils/validation');

const generateToken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Please check your .env file.');
  }
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    let { name, email, password, role, bio, subjects, hourlyRate } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Sanitize and validate inputs
    name = sanitizeString(name, 100);
    if (!isValidName(name)) {
      return res.status(400).json({ error: 'Name must be between 2 and 100 characters' });
    }

    email = email.toLowerCase().trim();
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (role && !['student', 'tutor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (bio) {
      bio = sanitizeString(bio, 500);
    }

    if (subjects && !isValidSubjects(subjects)) {
      return res.status(400).json({ error: 'Invalid subjects format' });
    }

    if (hourlyRate !== undefined) {
      if (!isValidHourlyRate(hourlyRate)) {
        return res.status(400).json({ error: 'Hourly rate must be between 0 and 10000' });
      }
      hourlyRate = parseFloat(hourlyRate);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      passwordHash,
      role: role || 'student',
      bio: bio || '',
      subjects: subjects || [],
      hourlyRate: hourlyRate || 0
    };

    const user = new User(userData);
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        subjects: user.subjects,
        hourlyRate: user.hourlyRate
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    email = email.toLowerCase().trim();
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        subjects: user.subjects,
        hourlyRate: user.hourlyRate
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};


