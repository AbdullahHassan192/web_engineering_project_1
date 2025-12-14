const Chat = require('../models/Chat');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Helper function to sanitize strings
const sanitizeString = (str, maxLength = 1000) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
};

exports.getOrCreateChat = async (req, res) => {
  try {
    const userId = req.userId;
    const { otherUserId } = req.params;

    console.log('getOrCreateChat - userId:', userId, 'otherUserId:', otherUserId);

    // Validation
    if (!otherUserId || !isValidObjectId(otherUserId)) {
      console.log('Invalid otherUserId:', otherUserId);
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (String(userId) === String(otherUserId)) {
      return res.status(400).json({ error: 'Cannot chat with yourself' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ error: 'Other user not found' });
    }

    // Ensure one is student and one is tutor
    if (user.role === otherUser.role) {
      return res.status(400).json({ error: 'Can only chat between student and tutor' });
    }

    // Determine student and tutor IDs
    let studentId, tutorId;
    if (user.role === 'student') {
      studentId = userId;
      tutorId = otherUserId;
    } else {
      studentId = otherUserId;
      tutorId = userId;
    }

    // Find or create chat
    console.log('Looking for chat - studentId:', studentId, 'tutorId:', tutorId);
    let chat = await Chat.findOne({ studentId, tutorId })
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email')
      .populate('messages.senderId', 'name email role');

    if (!chat) {
      console.log('Chat not found, creating new chat');
      chat = new Chat({
        studentId,
        tutorId,
        messages: []
      });
      await chat.save();
      chat = await Chat.findById(chat._id)
        .populate('studentId', 'name email')
        .populate('tutorId', 'name email')
        .populate('messages.senderId', 'name email role');
      console.log('New chat created:', chat._id);
    } else {
      console.log('Existing chat found:', chat._id, 'with', chat.messages.length, 'messages');
    }

    res.json({ chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Server error fetching chat' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { chatId } = req.params;
    let { message } = req.body;

    console.log('sendMessage - userId:', userId, 'chatId:', chatId, 'message length:', message?.length);

    // Validation
    if (!message || typeof message !== 'string') {
      console.log('Invalid message type');
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    message = message.trim();

    if (message === '') {
      console.log('Empty message');
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (message.length > 1000) {
      console.log('Message too long:', message.length);
      return res.status(400).json({ error: 'Message is too long. Maximum 1000 characters allowed.' });
    }

    // Sanitize message to prevent XSS
    message = sanitizeString(message, 1000);

    const chat = await Chat.findById(chatId);
    if (!chat) {
      console.log('Chat not found:', chatId);
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Verify user is part of this chat
    if (String(chat.studentId) !== String(userId) && String(chat.tutorId) !== String(userId)) {
      console.log('Unauthorized - userId:', userId, 'studentId:', chat.studentId, 'tutorId:', chat.tutorId);
      return res.status(403).json({ error: 'Unauthorized: You are not part of this chat' });
    }

    // Prevent message spam - check last message time
    if (chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      const timeSinceLastMessage = Date.now() - new Date(lastMessage.createdAt).getTime();
      if (String(lastMessage.senderId) === String(userId) && timeSinceLastMessage < 1000) {
        return res.status(429).json({ error: 'Please wait before sending another message' });
      }
    }

    console.log('Adding message to chat');
    chat.messages.push({
      senderId: userId,
      message: message,
      read: false,
      delivered: true
    });

    await chat.save();
    console.log('Chat saved, message count:', chat.messages.length);

    const populatedChat = await Chat.findById(chatId)
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email')
      .populate('messages.senderId', 'name email role');

    // Emit socket event for real-time messaging
    if (global.io) {
      const recipientId = String(chat.studentId) === String(userId) 
        ? chat.tutorId 
        : chat.studentId;
      
      global.io.emit('message:new', {
        chatId: chat._id,
        senderId: userId,
        recipientId: recipientId,
        message: message.trim()
      });
      console.log('Socket event emitted for message:new');
    }

    console.log('Message sent successfully');
    res.json({
      message: 'Message sent successfully',
      chat: populatedChat
    });
  } catch (error) {
    console.error('Send message error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Server error sending message', details: error.message });
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({
      $or: [
        { studentId: userId },
        { tutorId: userId }
      ]
    })
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email')
      .populate('messages.senderId', 'name email role')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate unread counts for each chat
    const chatsWithUnread = chats.map(chat => {
      const unreadMessages = chat.messages.filter(msg => {
        // Get the senderId - handle both populated and non-populated cases
        const msgSenderId = msg.senderId?._id || msg.senderId;
        const isSentByOther = String(msgSenderId) !== String(userId);
        const isUnread = !msg.read;
        return isSentByOther && isUnread;
      });
      
      const unreadCount = unreadMessages.length;
      
      const lastMessage = chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1]
        : null;

      return {
        ...chat.toObject(),
        unreadCount,
        lastMessage: lastMessage ? {
          message: lastMessage.message,
          senderId: lastMessage.senderId,
          createdAt: lastMessage.createdAt
        } : null
      };
    });

    const total = await Chat.countDocuments({
      $or: [
        { studentId: userId },
        { tutorId: userId }
      ]
    });

    res.json({ 
      chats: chatsWithUnread,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({ error: 'Server error fetching chats' });
  }
};

exports.markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Verify user is part of this chat
    if (String(chat.studentId) !== String(userId) && String(chat.tutorId) !== String(userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Mark all messages from other user as read
    chat.messages.forEach(msg => {
      if (String(msg.senderId) !== String(userId)) {
        msg.read = true;
      }
    });

    await chat.save();

    res.json({ message: 'Messages marked as read', chat });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ error: 'Server error marking messages as read' });
  }
};








