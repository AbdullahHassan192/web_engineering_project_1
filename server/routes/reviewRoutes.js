const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

// Create a review (protected - students only)
router.post('/', protect, reviewController.createReview);

// Get reviews for a tutor (public)
router.get('/tutor/:tutorId', reviewController.getTutorReviews);

// Check if student can review tutor (protected)
router.get('/can-review/:tutorId', protect, reviewController.canReview);

// Update a review (protected - author only)
router.put('/:reviewId', protect, reviewController.updateReview);

// Mark review as helpful/not helpful (protected)
router.patch('/:reviewId/helpful', protect, reviewController.markReviewHelpful);

module.exports = router;
