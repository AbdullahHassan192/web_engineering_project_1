const express = require('express');
const router = express.Router();
const { updateTutorRate, updateProfile, updatePassword } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.patch('/rate', authenticate, updateTutorRate);
router.patch('/profile', authenticate, updateProfile);
router.patch('/password', authenticate, updatePassword);

module.exports = router;















