const Notification = require('../models/Notification');
const Booking = require('../models/Booking');
const User = require('../models/User');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Server error updating notification' });
  }
};

exports.createNotification = async (userId, type, title, message, link = '', bookingId = null) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      link,
      bookingId
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

// Function to send lecture links 15 minutes before
exports.scheduleLectureLinks = async () => {
  try {
    const now = new Date();
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
    
    // Find bookings starting in ~15 minutes that are confirmed and don't have video link sent yet
    const upcomingBookings = await Booking.find({
      status: 'confirmed',
      startTime: {
        $gte: new Date(now.getTime() + 14 * 60 * 1000), // 14 minutes from now
        $lte: new Date(now.getTime() + 16 * 60 * 1000)  // 16 minutes from now
      },
      $or: [
        { videoLink: { $exists: false } },
        { videoLink: '' }
      ]
    })
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email');
    
    for (const booking of upcomingBookings) {
      // Generate Jitsi meeting link
      const videoLink = `https://meet.jit.si/${booking.meetingId}`;
      
      // Update booking with video link
      booking.videoLink = videoLink;
      await booking.save();
      
      // Check if notification already exists
      const existingNotif = await Notification.findOne({
        bookingId: booking._id,
        type: 'lecture_link'
      });
      
      if (!existingNotif) {
        // Create notifications for both student and tutor
        await exports.createNotification(
          booking.studentId._id,
          'lecture_link',
          'Lecture Starting Soon!',
          `Your lecture with ${booking.tutorId.name} starts in 15 minutes. Click to join.`,
          videoLink,
          booking._id
        );
        
        await exports.createNotification(
          booking.tutorId._id,
          'lecture_link',
          'Lecture Starting Soon!',
          `Your lecture with ${booking.studentId.name} starts in 15 minutes. Click to join.`,
          videoLink,
          booking._id
        );
      }
    }
  } catch (error) {
    console.error('Schedule lecture links error:', error);
  }
};

module.exports = exports;

