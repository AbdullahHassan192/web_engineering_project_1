const express = require('express');
const router = express.Router();
const { getStudentPerformance, getTutorPerformance } = require('../controllers/performanceController');
const { authenticate } = require('../middleware/auth');

router.get('/student', authenticate, getStudentPerformance);
router.get('/tutor', authenticate, getTutorPerformance);

module.exports = router;















