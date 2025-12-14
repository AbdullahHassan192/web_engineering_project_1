const Performance = require('../models/Performance');
const Booking = require('../models/Booking');
const User = require('../models/User');

exports.getStudentPerformance = async (req, res) => {
  try {
    const userId = req.userId;
    
    const performances = await Performance.find({ userId, role: 'student' });
    
    // Get additional stats from bookings
    const bookings = await Booking.find({ studentId: userId, status: 'completed' })
      .populate('tutorId', 'name');
    
    const subjectStats = {};
    const tutorFeedbacks = [];
    
    bookings.forEach(booking => {
      const subject = booking.subject || 'General';
      if (!subjectStats[subject]) {
        subjectStats[subject] = {
          count: 0,
          totalHours: 0,
          tutors: new Set()
        };
      }
      subjectStats[subject].count++;
      const hours = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
      subjectStats[subject].totalHours += hours;
      if (booking.tutorId) {
        subjectStats[subject].tutors.add(booking.tutorId.name);
      }
      if (booking.tutorFeedback) {
        tutorFeedbacks.push({
          tutorName: booking.tutorId?.name || 'Unknown',
          subject: booking.subject || 'General',
          feedback: booking.tutorFeedback,
          date: booking.endTime
        });
      }
    });
    
    res.json({
      performances,
      subjectStats: Object.entries(subjectStats).map(([subject, stats]) => ({
        subject,
        lecturesCount: stats.count,
        totalHours: Math.round(stats.totalHours * 10) / 10,
        tutorsCount: stats.tutors.size
      })),
      tutorFeedbacks
    });
  } catch (error) {
    console.error('Get student performance error:', error);
    res.status(500).json({ error: 'Server error fetching performance' });
  }
};

exports.getTutorPerformance = async (req, res) => {
  try {
    const userId = req.userId;
    
    const performances = await Performance.find({ userId, role: 'tutor' });
    
    // Get additional stats from bookings
    const bookings = await Booking.find({ tutorId: userId, status: 'completed' })
      .populate('studentId', 'name');
    
    const subjectStats = {};
    let totalRatings = 0;
    let ratingSum = 0;
    
    bookings.forEach(booking => {
      const subject = booking.subject || 'General';
      if (!subjectStats[subject]) {
        subjectStats[subject] = {
          count: 0,
          totalHours: 0,
          students: new Set(),
          ratings: []
        };
      }
      subjectStats[subject].count++;
      const hours = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
      subjectStats[subject].totalHours += hours;
      if (booking.studentId) {
        subjectStats[subject].students.add(booking.studentId.name);
      }
      if (booking.rating) {
        subjectStats[subject].ratings.push(booking.rating);
        totalRatings++;
        ratingSum += booking.rating;
      }
    });
    
    const averageRating = totalRatings > 0 ? ratingSum / totalRatings : 0;
    
    res.json({
      performances,
      subjectStats: Object.entries(subjectStats).map(([subject, stats]) => ({
        subject,
        lecturesCount: stats.count,
        totalHours: Math.round(stats.totalHours * 10) / 10,
        studentsCount: stats.students.size,
        averageRating: stats.ratings.length > 0 
          ? Math.round((stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length) * 10) / 10
          : 0
      })),
      overallRating: Math.round(averageRating * 10) / 10,
      totalLectures: bookings.length
    });
  } catch (error) {
    console.error('Get tutor performance error:', error);
    res.status(500).json({ error: 'Server error fetching performance' });
  }
};

exports.updatePerformance = async (booking) => {
  try {
    if (booking.status !== 'completed') return;
    
    const subject = booking.subject || 'General';
    const hours = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
    
    // Update student performance
    let studentPerf = await Performance.findOne({ userId: booking.studentId, role: 'student', subject });
    if (!studentPerf) {
      studentPerf = new Performance({
        userId: booking.studentId,
        role: 'student',
        subject
      });
    }
    studentPerf.lecturesCount += 1;
    studentPerf.totalHours += hours;
    await studentPerf.save();
    
    // Update tutor performance
    let tutorPerf = await Performance.findOne({ userId: booking.tutorId, role: 'tutor', subject });
    if (!tutorPerf) {
      tutorPerf = new Performance({
        userId: booking.tutorId,
        role: 'tutor',
        subject
      });
    }
    tutorPerf.lecturesCount += 1;
    tutorPerf.totalHours += hours;
    
    if (booking.rating) {
      tutorPerf.totalRatings += 1;
      tutorPerf.averageRating = ((tutorPerf.averageRating * (tutorPerf.totalRatings - 1)) + booking.rating) / tutorPerf.totalRatings;
    }
    
    await tutorPerf.save();
  } catch (error) {
    console.error('Update performance error:', error);
  }
};

module.exports = exports;














