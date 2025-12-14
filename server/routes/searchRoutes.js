const express = require('express');
const router = express.Router();
const { searchTutors } = require('../controllers/searchController');

router.get('/tutors', searchTutors);

module.exports = router;















