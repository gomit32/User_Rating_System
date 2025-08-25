// routes/ratings.js

const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const { verifyToken } = require('../middleware/authMiddleware');

// @route   POST /api/ratings
// @desc    Submit a new rating (Authenticated users only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { store_id, rating } = req.body;
    const user_id = req.user.id; // User ID from the JWT payload

    const existingRating = await Rating.findOne({ where: { user_id, store_id } });

    if (existingRating) {
      // If a rating exists, update it
      await existingRating.update({ rating });
      return res.status(200).json({ message: 'Rating updated successfully.' });
    } else {
      // Otherwise, create a new rating
      const newRating = await Rating.create({ user_id, store_id, rating });
      return res.status(201).json(newRating);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Could not submit rating.' });
  }
});

module.exports = router;
