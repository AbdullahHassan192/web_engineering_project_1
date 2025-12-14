const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { chatRateLimiter } = require('../middleware/rateLimiter');
const {
  getOrCreateChat,
  sendMessage,
  getUserChats,
  markMessagesAsRead
} = require('../controllers/chatController');

router.get('/user/:otherUserId', authenticate, getOrCreateChat);
router.get('/list', authenticate, getUserChats);
router.post('/:chatId/message', authenticate, chatRateLimiter, sendMessage);
router.patch('/:chatId/read', authenticate, markMessagesAsRead);

module.exports = router;








