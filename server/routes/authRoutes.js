const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const { authRateLimiter } = require('../middleware/rateLimiter');

router.post('/login', authRateLimiter, login);
router.post('/register', authRateLimiter, register);

module.exports = router;















