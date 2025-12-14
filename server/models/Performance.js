const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'tutor'],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  lecturesCount: {
    type: Number,
    default: 0
  },
  totalHours: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

performanceSchema.index({ userId: 1, subject: 1 });

module.exports = mongoose.model('Performance', performanceSchema);















