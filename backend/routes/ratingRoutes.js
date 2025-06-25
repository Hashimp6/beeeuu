const express = require('express');
const { addRating } = require('../controllers/ratingController');

const router = express.Router();

router.post('/add', addRating); // POST /api/rating/add

module.exports = router;
