const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  meetingId: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  subject: {
    type: String,
    default: ''
  },
  platform: {
    type: String,
    enum: ['Google Meet', 'Zoom', 'Microsoft Teams', 'Skype', 'Other'],
    default: 'Google Meet'
  },
  videoLink: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  studentFeedback: {
    type: String,
    default: ''
  },
  tutorFeedback: {
    type: String,
    default: ''
  },
  timeChangeRequest: {
    newStartTime: Date,
    newEndTime: Date,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: null
    }
  }
}, {
  timestamps: true
});

bookingSchema.index({ tutorId: 1, startTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);


