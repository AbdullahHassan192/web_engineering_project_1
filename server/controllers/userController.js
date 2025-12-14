const User = require('../models/User');
const { isValidHourlyRate, isValidSubjects, sanitizeString } = require('../utils/validation');

exports.updateTutorRate = async (req, res) => {
  try {
    const userId = req.userId;
    let { hourlyRate } = req.body;

    if (hourlyRate === undefined || hourlyRate === null) {
      return res.status(400).json({ error: 'Hourly rate is required' });
    }

    if (!isValidHourlyRate(hourlyRate)) {
      return res.status(400).json({ error: 'Hourly rate must be between 0 and 10000' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'tutor') {
      return res.status(403).json({ error: 'Only tutors can update hourly rate' });
    }

    user.hourlyRate = parseFloat(hourlyRate);
    await user.save();

    // Emit socket event to notify all clients about rate change
    if (global.io) {
      global.io.emit('tutor:rateUpdated', {
        tutorId: user._id,
        hourlyRate: user.hourlyRate
      });
    }

    res.json({
      message: 'Hourly rate updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hourlyRate: user.hourlyRate
      }
    });
  } catch (error) {
    console.error('Update tutor rate error:', error);
    res.status(500).json({ error: 'Server error updating hourly rate' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    let { bio, subjects } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (bio !== undefined) {
      user.bio = sanitizeString(bio, 500);
    }
    
    if (subjects !== undefined) {
      if (!Array.isArray(subjects)) {
        return res.status(400).json({ error: 'Subjects must be an array' });
      }
      if (!isValidSubjects(subjects)) {
        return res.status(400).json({ error: 'Invalid subjects format' });
      }
      if (user.role === 'tutor') {
        user.subjects = subjects;
      } else {
        return res.status(403).json({ error: 'Only tutors can update subjects' });
      }
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        subjects: user.subjects,
        hourlyRate: user.hourlyRate
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};














