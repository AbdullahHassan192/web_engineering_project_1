const express = require('express');
const router = express.Router();
const { getAllTutors, getTutorById } = require('../controllers/tutorController');

router.get('/', getAllTutors);
router.get('/:tutorId', getTutorById);

module.exports = router;















