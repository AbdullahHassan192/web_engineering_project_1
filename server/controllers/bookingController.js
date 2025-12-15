const Booking = require('../models/Booking');
const User = require('../models/User');
const Chat = require('../models/Chat');
const mongoose = require('mongoose');
const { createNotification } = require('./notificationController');
const { updatePerformance } = require('./performanceController');

const generateMeetingId = () => {
  const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `TutorApp_${randomString}`;
};

exports.createBooking = async (req, res) => {
  try {
    const { studentId, tutorId, startTime, endTime, subject, platform, message } = req.body;

    // Comprehensive validation
    if (!studentId || !tutorId || !startTime || !endTime) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(tutorId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (start >= end) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const now = new Date();
    if (start < now) {
      return res.status(400).json({ error: 'Cannot book in the past' });
    }

    // Validate booking duration (max 8 hours, min 15 minutes)
    const durationHours = (end - start) / (1000 * 60 * 60);
    if (durationHours > 8) {
      return res.status(400).json({ error: 'Booking duration cannot exceed 8 hours' });
    }
    if (durationHours < 0.25) {
      return res.status(400).json({ error: 'Booking duration must be at least 15 minutes' });
    }

    // Validate subject if provided
    if (subject && typeof subject !== 'string') {
      return res.status(400).json({ error: 'Subject must be a string' });
    }

    // Verify tutor exists and is actually a tutor
    const tutor = await User.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor not found' });
    }
    if (tutor.role !== 'tutor') {
      return res.status(400).json({ error: 'Selected user is not a tutor' });
    }

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    if (student.role !== 'student') {
      return res.status(400).json({ error: 'Invalid student account' });
    }

    // Prevent self-booking
    if (String(studentId) === String(tutorId)) {
      return res.status(400).json({ error: 'Cannot book yourself' });
    }

    const existingBookings = await Booking.find({
      tutorId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start }
        }
      ]
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({ error: 'Slot conflict detected' });
    }

    const meetingId = generateMeetingId();
    const booking = new Booking({
      studentId,
      tutorId,
      startTime: start,
      endTime: end,
      meetingId,
      status: 'pending',
      subject: subject || '',
      platform: platform || 'Jitsi Meet'
    });

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email subjects hourlyRate');

    // Create notification for tutor
    await createNotification(
      tutorId,
      'booking_request',
      'New Booking Request',
      `You have a new booking request from ${populatedBooking.studentId.name}`,
      '',
      booking._id
    );

    // Always create chat message for booking request
    try {
      // Find or create chat between student and tutor
      let chat = await Chat.findOne({
        studentId: studentId,
        tutorId: tutorId
      });

      if (!chat) {
        chat = new Chat({
          studentId: studentId,
          tutorId: tutorId,
          messages: []
        });
      }

      // Add booking request message with details
      let bookingMessage = `📅 Booking Request\n\nSubject: ${booking.subject}\nDuration: ${durationHours} ${durationHours === 1 ? 'hour' : 'hours'}\nPlatform: ${booking.platform}\nStart: ${new Date(booking.startTime).toLocaleString()}\nEnd: ${new Date(booking.endTime).toLocaleString()}`;
      
      if (message && message.trim()) {
        bookingMessage += `\n\nMessage: ${message}`;
      }

      chat.messages.push({
        senderId: studentId,
        message: bookingMessage
      });

      await chat.save();

      // Emit Socket.io event for new chat message
      if (global.io) {
        global.io.emit('chat:message', {
          chatId: chat._id,
          senderId: studentId,
          tutorId: tutorId
        });
      }
    } catch (chatError) {
      console.error('Error creating chat message:', chatError);
      // Don't fail the booking if chat creation fails
    }

    // Emit Socket.io event for real-time notification
    if (global.io) {
      global.io.emit('booking:new', {
        bookingId: booking._id,
        tutorId: tutorId,
        studentName: populatedBooking.studentId.name
      });
    }

    res.status(201).json({
      message: 'Booking request sent. Waiting for tutor confirmation.',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Meeting ID collision, please try again' });
    }
    res.status(500).json({ error: 'Server error during booking creation' });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { userId, role } = req.query;

    let query = {};
    if (role === 'student') {
      query.studentId = userId;
    } else if (role === 'tutor') {
      query.tutorId = userId;
    }

    const bookings = await Booking.find(query)
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email subjects hourlyRate')
      .sort({ startTime: 1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Server error fetching bookings' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, rating } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = { status };
    if (rating && status === 'completed') {
      updateData.rating = rating;
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true }
    ).populate('studentId', 'name email')
     .populate('tutorId', 'name email subjects hourlyRate');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Create notifications
    if (status === 'confirmed') {
      // Generate Jitsi link if platform is Jitsi Meet
      if (booking.platform === 'Jitsi Meet' && !booking.videoLink) {
        booking.videoLink = `https://meet.jit.si/${booking.meetingId}`;
        await booking.save();
      }

      await createNotification(
        booking.studentId._id,
        'booking_confirmed',
        'Lecture Successfully Placed!',
        `Your booking with ${booking.tutorId.name} has been confirmed. The lecture is now scheduled.`,
        '',
        booking._id
      );
      
      // Create chat message for booking confirmation
      try {
        let chat = await Chat.findOne({
          studentId: booking.studentId._id,
          tutorId: booking.tutorId._id
        });

        if (!chat) {
          chat = new Chat({
            studentId: booking.studentId._id,
            tutorId: booking.tutorId._id,
            messages: []
          });
        }

        const durationHours = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
        let confirmationMessage = `✅ Booking Confirmed\n\nSubject: ${booking.subject}\nDuration: ${durationHours} ${durationHours === 1 ? 'hour' : 'hours'}\nPlatform: ${booking.platform}\nStart: ${new Date(booking.startTime).toLocaleString()}\nEnd: ${new Date(booking.endTime).toLocaleString()}`;
        
        // Include Jitsi link in confirmation message if platform is Jitsi Meet
        if (booking.platform === 'Jitsi Meet' && booking.videoLink) {
          confirmationMessage += `\n\n🔗 Meeting Link: ${booking.videoLink}`;
        }
        
        confirmationMessage += `\n\nYour booking has been confirmed by ${booking.tutorId.name}!`;

        chat.messages.push({
          senderId: booking.tutorId._id,
          message: confirmationMessage
        });

        await chat.save();

        // Emit Socket.io event for new chat message
        if (global.io) {
          global.io.emit('chat:message', {
            chatId: chat._id,
            senderId: booking.tutorId._id,
            tutorId: booking.tutorId._id
          });
        }
      } catch (chatError) {
        console.error('Error creating confirmation chat message:', chatError);
        // Don't fail the confirmation if chat creation fails
      }
      
      // Emit Socket.io event for real-time update
      if (global.io) {
        global.io.emit('booking:confirmed', {
          bookingId: booking._id,
          studentId: booking.studentId._id,
          tutorId: booking.tutorId._id,
          message: 'Lecture Successfully Placed!'
        });
      }
    } else if (status === 'cancelled') {
      // Notify the other party
      const cancelledBy = req.userId;
      const otherPartyId = String(cancelledBy) === String(booking.studentId._id) 
        ? booking.tutorId._id 
        : booking.studentId._id;
      const cancelledByName = String(cancelledBy) === String(booking.studentId._id)
        ? booking.studentId.name
        : booking.tutorId.name;

      await createNotification(
        otherPartyId,
        'booking_cancelled',
        'Lecture Cancelled',
        `${cancelledByName} has cancelled the lecture scheduled for ${new Date(booking.startTime).toLocaleString()}.`,
        '',
        booking._id
      );

      // Emit Socket.io event
      if (global.io) {
        global.io.emit('booking:cancelled', {
          bookingId: booking._id,
          studentId: booking.studentId._id,
          tutorId: booking.tutorId._id
        });
      }
    }

    // Update performance when completed
    if (status === 'completed') {
      await updatePerformance(booking);
    }

    res.json({
      message: 'Booking status updated',
      booking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Server error updating booking' });
  }
};

exports.updateBookingTime = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { newStartTime, newEndTime } = req.body;
    const userId = req.userId;

    // Validation
    if (!newStartTime || !newEndTime) {
      return res.status(400).json({ error: 'Both start and end times are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    const booking = await Booking.findById(bookingId)
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email subjects hourlyRate');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify user is part of this booking
    if (String(booking.studentId._id) !== String(userId) && String(booking.tutorId._id) !== String(userId)) {
      return res.status(403).json({ error: 'Unauthorized: You are not part of this booking' });
    }

    // Check if there's already a pending time change request
    if (booking.timeChangeRequest && booking.timeChangeRequest.status === 'pending') {
      return res.status(400).json({ error: 'A time change request is already pending for this booking' });
    }

    const newStart = new Date(newStartTime);
    const newEnd = new Date(newEndTime);

    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (newStart >= newEnd) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const now = new Date();
    if (newStart < now) {
      return res.status(400).json({ error: 'Cannot reschedule to the past' });
    }

    // Validate booking duration
    const durationHours = (newEnd - newStart) / (1000 * 60 * 60);
    if (durationHours > 8) {
      return res.status(400).json({ error: 'Booking duration cannot exceed 8 hours' });
    }
    if (durationHours < 0.25) {
      return res.status(400).json({ error: 'Booking duration must be at least 15 minutes' });
    }

    // Check for conflicts with other bookings
    const conflictingBookings = await Booking.find({
      tutorId: booking.tutorId._id,
      _id: { $ne: bookingId },
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startTime: { $lt: newEnd },
          endTime: { $gt: newStart }
        }
      ]
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({ error: 'New time conflicts with existing booking' });
    }

    // Create time change request
    booking.timeChangeRequest = {
      newStartTime: newStart,
      newEndTime: newEnd,
      requestedBy: userId,
      status: 'pending'
    };

    await booking.save();

    // Notify the other party
    const otherPartyId = String(userId) === String(booking.studentId._id)
      ? booking.tutorId._id
      : booking.studentId._id;
    const requesterName = String(userId) === String(booking.studentId._id)
      ? booking.studentId.name
      : booking.tutorId.name;

    await createNotification(
      otherPartyId,
      'time_change_request',
      'Time Change Request',
      `${requesterName} wants to reschedule the lecture to ${newStart.toLocaleString()}. Please confirm or reject.`,
      '',
      booking._id
    );

    // Emit Socket.io event
    if (global.io) {
      global.io.emit('booking:timeChangeRequest', {
        bookingId: booking._id,
        studentId: booking.studentId._id,
        tutorId: booking.tutorId._id
      });
    }

    const updatedBooking = await Booking.findById(bookingId)
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email subjects hourlyRate');

    res.json({
      message: 'Time change request sent. Waiting for confirmation.',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking time error:', error);
    res.status(500).json({ error: 'Server error updating booking time' });
  }
};

exports.respondToTimeChange = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { accept } = req.body;
    const userId = req.userId;

    const booking = await Booking.findById(bookingId)
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email subjects hourlyRate');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!booking.timeChangeRequest || booking.timeChangeRequest.status !== 'pending') {
      return res.status(400).json({ error: 'No pending time change request' });
    }

    // Verify user is the other party (not the requester)
    const requesterId = booking.timeChangeRequest.requestedBy;
    if (String(userId) === String(requesterId)) {
      return res.status(400).json({ error: 'You cannot respond to your own request' });
    }

    if (String(userId) !== String(booking.studentId._id) && String(userId) !== String(booking.tutorId._id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (accept) {
      // Accept time change
      booking.startTime = booking.timeChangeRequest.newStartTime;
      booking.endTime = booking.timeChangeRequest.newEndTime;
      booking.timeChangeRequest.status = 'accepted';

      const requesterName = String(requesterId) === String(booking.studentId._id)
        ? booking.studentId.name
        : booking.tutorId.name;

      await createNotification(
        requesterId,
        'time_change_accepted',
        'Time Change Accepted',
        `Your time change request has been accepted. The lecture is now scheduled for ${booking.startTime.toLocaleString()}.`,
        '',
        booking._id
      );
    } else {
      // Reject time change
      booking.timeChangeRequest.status = 'rejected';

      const requesterName = String(requesterId) === String(booking.studentId._id)
        ? booking.studentId.name
        : booking.tutorId.name;

      await createNotification(
        requesterId,
        'time_change_rejected',
        'Time Change Rejected',
        `Your time change request has been rejected. The original time remains.`,
        '',
        booking._id
      );
    }

    await booking.save();

    // Emit Socket.io event
    if (global.io) {
      global.io.emit('booking:timeChangeResponse', {
        bookingId: booking._id,
        studentId: booking.studentId._id,
        tutorId: booking.tutorId._id,
        accepted: accept
      });
    }

    const updatedBooking = await Booking.findById(bookingId)
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email subjects hourlyRate');

    res.json({
      message: accept ? 'Time change accepted' : 'Time change rejected',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Respond to time change error:', error);
    res.status(500).json({ error: 'Server error responding to time change' });
  }
};

exports.submitRating = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const booking = await Booking.findById(bookingId)
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email subjects hourlyRate');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Can only rate completed bookings' });
    }

    // Only student can rate tutor
    if (String(userId) !== String(booking.studentId._id)) {
      return res.status(403).json({ error: 'Only students can rate tutors' });
    }

    if (booking.rating) {
      return res.status(400).json({ error: 'Booking already rated' });
    }

    booking.rating = rating;
    if (feedback) {
      booking.studentFeedback = feedback;
    }

    await booking.save();

    // Update performance
    await updatePerformance(booking);

    res.json({
      message: 'Rating submitted successfully',
      booking
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Server error submitting rating' });
  }
};

exports.submitTutorFeedback = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { feedback } = req.body;
    const userId = req.userId;

    if (!feedback || feedback.trim() === '') {
      return res.status(400).json({ error: 'Feedback cannot be empty' });
    }

    const booking = await Booking.findById(bookingId)
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email subjects hourlyRate');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Can only provide feedback for completed bookings' });
    }

    // Only tutor can provide feedback about student
    if (String(userId) !== String(booking.tutorId._id)) {
      return res.status(403).json({ error: 'Only tutors can provide student feedback' });
    }

    booking.tutorFeedback = feedback.trim();
    await booking.save();

    res.json({
      message: 'Feedback submitted successfully',
      booking
    });
  } catch (error) {
    console.error('Submit tutor feedback error:', error);
    res.status(500).json({ error: 'Server error submitting feedback' });
  }
};


