const User = require('../models/User');

exports.getAllTutors = async (req, res) => {
  try {
    const { search, subject, minRate, maxRate } = req.query;

    let query = { role: 'tutor' };

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by subject
    if (subject) {
      query.subjects = { $in: [new RegExp(subject, 'i')] };
    }

    // Filter by hourly rate range
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = parseFloat(minRate);
      if (maxRate) query.hourlyRate.$lte = parseFloat(maxRate);
    }

    console.log('Fetching tutors with query:', JSON.stringify(query));
    const tutors = await User.find(query)
      .select('name email bio subjects hourlyRate avatar averageRating totalReviews')
      .sort({ averageRating: -1, totalReviews: -1, hourlyRate: 1, name: 1 });
    
    console.log(`Found ${tutors.length} tutors`);
    res.json({ tutors });
  } catch (error) {
    console.error('Get tutors error:', error);
    res.status(500).json({ error: 'Server error fetching tutors' });
  }
};

exports.getTutorById = async (req, res) => {
  try {
    const { tutorId } = req.params;

    const tutor = await User.findById(tutorId)
      .select('name email bio subjects hourlyRate avatar availability averageRating totalReviews role');

    if (!tutor || tutor.role !== 'tutor') {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    res.json({ tutor });
  } catch (error) {
    console.error('Get tutor error:', error);
    res.status(500).json({ error: 'Server error fetching tutor' });
  }
};















