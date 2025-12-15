const Booking = require('../models/Booking');
const { createNotification } = require('../controllers/notificationController');

// Send reminder for a specific time interval
const sendReminder = async (booking, minutes, io) => {
  if (!booking.studentId || !booking.tutorId) return;

  // Check if Jitsi Meet is selected
  if (booking.platform === 'Jitsi Meet') {
    // Ensure Jitsi link exists
    if (!booking.videoLink) {
      booking.videoLink = `https://meet.jit.si/${booking.meetingId}`;
      await booking.save();
    }

    // Send notification to student with Jitsi link
    await createNotification(
      booking.studentId._id,
      'lecture_link',
      '⏰ Session Starting Soon!',
      `Your ${booking.subject} session with ${booking.tutorId.name} starts in ${minutes} minutes. Click to join the Jitsi Meet.`,
      booking.videoLink,
      booking._id
    );

    // Send notification to tutor with Jitsi link
    await createNotification(
      booking.tutorId._id,
      'lecture_link',
      '⏰ Session Starting Soon!',
      `Your ${booking.subject} session with ${booking.studentId.name} starts in ${minutes} minutes. Click to join the Jitsi Meet.`,
      booking.videoLink,
      booking._id
    );

    // Emit Socket.io events
    if (io) {
      io.emit('notification:new', {
        userId: booking.studentId._id.toString(),
        message: `Session starting in ${minutes} minutes - Join now`
      });
      io.emit('notification:new', {
        userId: booking.tutorId._id.toString(),
        message: `Session starting in ${minutes} minutes - Join now`
      });
    }
  } else {
    // Other platforms - send reminder to manually share link
    // Send notification to student
    await createNotification(
      booking.studentId._id,
      'session_reminder',
      '⏰ Session Starting Soon!',
      `Your ${booking.subject} session with ${booking.tutorId.name} starts in ${minutes} minutes. The tutor will send you the ${booking.platform} link shortly.`,
      '',
      booking._id
    );

    // Send notification to tutor
    await createNotification(
      booking.tutorId._id,
      'session_reminder',
      '⏰ Session Starting Soon!',
      `Your ${booking.subject} session with ${booking.studentId.name} starts in ${minutes} minutes. Please send the ${booking.platform} meeting link to the student via chat.`,
      '',
      booking._id
    );

    // Emit Socket.io events for real-time notifications
    if (io) {
      io.emit('notification:new', {
        userId: booking.studentId._id.toString(),
        message: `Session starting in ${minutes} minutes`
      });
      io.emit('notification:new', {
        userId: booking.tutorId._id.toString(),
        message: `Session starting in ${minutes} minutes - send meeting link`
      });
    }
  }
};

// Check for bookings that need reminders every minute
const startReminderScheduler = (io) => {
  console.log('✓ Reminder scheduler started');
  
  setInterval(async () => {
    try {
      const now = new Date();
      
      // Define time windows for each reminder
      const timeWindows = [
        { minutes: 15, field: 'fifteenMin', start: 15, end: 16 },
        { minutes: 10, field: 'tenMin', start: 10, end: 11 },
        { minutes: 5, field: 'fiveMin', start: 5, end: 6 }
      ];

      for (const window of timeWindows) {
        const startWindow = new Date(now.getTime() + window.start * 60 * 1000);
        const endWindow = new Date(now.getTime() + window.end * 60 * 1000);

        // Find confirmed bookings in this time window that haven't been reminded yet
        const query = {
          status: 'confirmed',
          startTime: {
            $gte: startWindow,
            $lt: endWindow
          }
        };
        query[`remindersSent.${window.field}`] = false;

        const upcomingBookings = await Booking.find(query)
          .populate('studentId tutorId', 'name email');

        for (const booking of upcomingBookings) {
          await sendReminder(booking, window.minutes, io);

          // Mark this reminder as sent
          if (!booking.remindersSent) {
            booking.remindersSent = { fifteenMin: false, tenMin: false, fiveMin: false };
          }
          booking.remindersSent[window.field] = true;
          await booking.save();

          console.log(`✓ ${window.minutes}-minute reminder sent for booking ${booking._id} (${booking.platform})`);
        }
      }
    } catch (error) {
      console.error('Error in reminder scheduler:', error);
    }
  }, 60000); // Check every minute
};

module.exports = { startReminderScheduler };
