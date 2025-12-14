const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getBookings, 
  updateBookingStatus,
  updateBookingTime,
  respondToTimeChange,
  submitRating,
  submitTutorFeedback
} = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, createBooking);
router.get('/', authenticate, getBookings);
router.patch('/:bookingId', authenticate, updateBookingStatus);
router.patch('/:bookingId/time', authenticate, updateBookingTime);
router.patch('/:bookingId/time/respond', authenticate, respondToTimeChange);
router.post('/:bookingId/rating', authenticate, submitRating);
router.post('/:bookingId/feedback', authenticate, submitTutorFeedback);

module.exports = router;

