const express = require('express');
const router = express.Router();
const { updateTutorRate, updateProfile } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.patch('/rate', authenticate, updateTutorRate);
router.patch('/profile', authenticate, updateProfile);

module.exports = router;















