const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { tutorId, bookingId, rating, comment } = req.body;
    const studentId = req.user.id;

    // Validate inputs
    if (!tutorId || !bookingId || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if student has completed a booking with this tutor
    const booking = await Booking.findOne({
      _id: bookingId,
      studentId: studentId,
      tutorId: tutorId,
      status: 'completed'
    });

    if (!booking) {
      return res.status(403).json({ 
        message: 'You can only review tutors after completing a session with them' 
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ 
      student: studentId, 
      tutor: tutorId 
    });

    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this tutor' 
      });
    }

    // Create review
    const review = new Review({
      tutor: tutorId,
      student: studentId,
      booking: bookingId,
      rating,
      comment
    });

    await review.save();

    // Update tutor's average rating
    await updateTutorRating(tutorId);

    // Populate student info before sending response
    await review.populate('student', 'name');

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get reviews for a tutor
exports.getTutorReviews = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ tutor: tutorId })
      .populate('student', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ tutor: tutorId });

    // Calculate rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { tutor: new mongoose.Types.ObjectId(tutorId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: { tutor: new mongoose.Types.ObjectId(tutorId) } },
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);

    res.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        averageRating: avgRating[0]?.average || 0,
        totalReviews: total,
        distribution: ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check if student can review tutor
exports.canReview = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const studentId = req.user.id;

    // Check if already reviewed
    const existingReview = await Review.findOne({ 
      student: studentId, 
      tutor: tutorId 
    });

    if (existingReview) {
      return res.json({ canReview: false, reason: 'Already reviewed' });
    }

    // Check if has completed booking
    const completedBooking = await Booking.findOne({
      studentId: studentId,
      tutorId: tutorId,
      status: 'completed'
    });

    if (!completedBooking) {
      return res.json({ 
        canReview: false, 
        reason: 'No completed sessions with this tutor' 
      });
    }

    res.json({ 
      canReview: true, 
      bookingId: completedBooking._id 
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark review as helpful/not helpful
exports.markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { helpful } = req.body; // true for helpful, false for not helpful
    const userId = req.user.id;

    console.log(`Vote attempt - User: ${userId}, Review: ${reviewId}, Type: ${helpful ? 'helpful' : 'notHelpful'}`);

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user already voted on this review
    const existingVote = review.votedBy?.find(v => v.user.toString() === userId.toString());
    
    if (existingVote) {
      console.log(`User ${userId} already voted on review ${reviewId} as ${existingVote.voteType}`);
      return res.status(400).json({ message: 'You have already voted on this review' });
    }

    // Add vote
    const voteType = helpful ? 'helpful' : 'notHelpful';
    const update = {
      $inc: helpful ? { helpful: 1 } : { notHelpful: 1 },
      $push: { votedBy: { user: userId, voteType } }
    };

    console.log(`Adding ${voteType} vote to review ${reviewId}`);
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      update,
      { new: true }
    );

    res.json({ message: 'Review updated', review: updatedReview });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    console.log('Update review request:', { reviewId, rating, comment, userId });

    // Validate inputs
    if (!rating || !comment) {
      console.log('Validation failed: missing rating or comment');
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      console.log('Validation failed: invalid rating');
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Find the review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      console.log('Review not found:', reviewId);
      return res.status(404).json({ message: 'Review not found' });
    }

    console.log('Review found:', { reviewStudent: review.student, userId });

    // Check if user is the author
    if (review.student.toString() !== userId) {
      console.log('Authorization failed: user is not the author');
      return res.status(403).json({ message: 'You can only edit your own reviews' });
    }

    // Update the review
    review.rating = rating;
    review.comment = comment;
    await review.save();

    console.log('Review updated successfully');

    // Update tutor's average rating
    await updateTutorRating(review.tutor);

    // Populate student info
    await review.populate('student', 'name');

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to update tutor's average rating
async function updateTutorRating(tutorId) {
  try {
    const result = await Review.aggregate([
      { $match: { tutor: new mongoose.Types.ObjectId(tutorId) } },
      { $group: { 
        _id: null, 
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }}
    ]);

    if (result.length > 0) {
      await User.findByIdAndUpdate(tutorId, {
        averageRating: result[0].averageRating,
        totalReviews: result[0].totalReviews
      });
    }
  } catch (error) {
    console.error('Error updating tutor rating:', error);
  }
}
