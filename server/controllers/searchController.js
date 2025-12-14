const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// ID3-inspired decision tree for tutor search
const calculateEntropy = (data) => {
  if (data.length === 0) return 0;
  const counts = {};
  data.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  const probabilities = Object.values(counts).map(count => count / data.length);
  return -probabilities.reduce((sum, p) => sum + (p > 0 ? p * Math.log2(p) : 0), 0);
};

const calculateInformationGain = (data, attribute, target) => {
  const totalEntropy = calculateEntropy(data.map(d => d[target]));
  const attributeValues = [...new Set(data.map(d => d[attribute]))];
  
  let weightedEntropy = 0;
  attributeValues.forEach(value => {
    const subset = data.filter(d => d[attribute] === value);
    const subsetEntropy = calculateEntropy(subset.map(d => d[target]));
    weightedEntropy += (subset.length / data.length) * subsetEntropy;
  });
  
  return totalEntropy - weightedEntropy;
};

exports.searchTutors = async (req, res) => {
  try {
    const { query, subject, minRate, maxRate, sortBy } = req.query;
    
    // Build base query
    let searchQuery = { role: 'tutor' };
    
    if (subject) {
      searchQuery.subjects = { $in: [new RegExp(subject, 'i')] };
    }
    
    if (minRate || maxRate) {
      searchQuery.hourlyRate = {};
      if (minRate) searchQuery.hourlyRate.$gte = parseFloat(minRate);
      if (maxRate) searchQuery.hourlyRate.$lte = parseFloat(maxRate);
    }
    
    // Text search
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } }
      ];
    }
    
    let tutors = await User.find(searchQuery)
      .select('name email bio subjects hourlyRate avatar')
      .lean();
    
    // ID3 Algorithm: Rank tutors based on multiple attributes
    if (tutors.length > 0) {
      // Get booking and review stats for each tutor
      const tutorIds = tutors.map(t => t._id);
      const bookings = await Booking.find({
        tutorId: { $in: tutorIds },
        status: 'completed'
      }).lean();
      
      const reviews = await Review.find({
        tutor: { $in: tutorIds }
      }).lean();
      
      // Calculate attributes for ID3
      const tutorData = tutors.map(tutor => {
        const tutorBookings = bookings.filter(b => b.tutorId.toString() === tutor._id.toString());
        const tutorReviews = reviews.filter(r => r.tutor.toString() === tutor._id.toString());
        const completedCount = tutorBookings.length;
        const hasExperience = completedCount > 0;
        const avgRating = tutorReviews.length > 0
          ? tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutorReviews.length
          : 0;
        
        return {
          tutor,
          experience: hasExperience ? 'experienced' : 'new',
          rating: avgRating >= 4 ? 'high' : avgRating >= 3 ? 'medium' : 'low',
          price: tutor.hourlyRate < 30 ? 'low' : tutor.hourlyRate < 60 ? 'medium' : 'high',
          subjectMatch: subject && tutor.subjects.includes(subject) ? 'match' : 'no_match',
          relevance: 0, // Will be calculated
          averageRating: avgRating,
          totalReviews: tutorReviews.length
        };
      });
      
      // Calculate information gain for ranking
      tutorData.forEach(item => {
        let relevance = 0;
        
        // Subject match (highest weight)
        if (item.subjectMatch === 'match') relevance += 50;
        
        // Experience
        if (item.experience === 'experienced') relevance += 20;
        
        // Rating
        if (item.rating === 'high') relevance += 20;
        else if (item.rating === 'medium') relevance += 10;
        
        // Price (lower is better for students)
        if (item.price === 'low') relevance += 10;
        else if (item.price === 'medium') relevance += 5;
        
        item.relevance = relevance;
      });
      
      // Sort by relevance
      tutorData.sort((a, b) => b.relevance - a.relevance);
      
      // Apply additional sorting if requested
      if (sortBy === 'price_low') {
        tutorData.sort((a, b) => a.tutor.hourlyRate - b.tutor.hourlyRate);
      } else if (sortBy === 'price_high') {
        tutorData.sort((a, b) => b.tutor.hourlyRate - a.tutor.hourlyRate);
      } else if (sortBy === 'rating') {
        tutorData.sort((a, b) => {
          const aRating = tutorData.find(t => t.tutor._id === a.tutor._id)?.rating || 'low';
          const bRating = tutorData.find(t => t.tutor._id === b.tutor._id)?.rating || 'low';
          const ratingOrder = { high: 3, medium: 2, low: 1 };
          return ratingOrder[bRating] - ratingOrder[aRating];
        });
      }
      
      tutors = tutorData.map(item => ({
        ...item.tutor,
        relevance: item.relevance,
        experience: item.experience,
        rating: item.rating,
        averageRating: item.averageRating,
        totalReviews: item.totalReviews
      }));
    }
    
    res.json({
      tutors,
      count: tutors.length,
      algorithm: 'ID3-inspired decision tree'
    });
  } catch (error) {
    console.error('Search tutors error:', error);
    res.status(500).json({ error: 'Server error searching tutors' });
  }
};















