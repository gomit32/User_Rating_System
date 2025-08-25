// backend/routes/dashboard.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { verifyToken, isAdmin, isStoreOwner } = require('../middleware/authMiddleware');
const { Sequelize } = require('sequelize');

// @route   GET /api/dashboard/admin
// @desc    Get admin dashboard data (Admin only)
// @access  Private (Admin)
router.get('/admin', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();
    res.status(200).json({ totalUsers, totalStores, totalRatings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Could not retrieve dashboard data.' });
  }
});

// @route   GET /api/dashboard/store-owner
// @desc    Get store owner dashboard data (Store Owner only)
// @access  Private (Store Owner)
router.get('/store-owner', verifyToken, isStoreOwner, async (req, res) => {
  try {
    // Find the store associated with the logged-in owner
    const store = await Store.findOne({ where: { owner_id: req.user.id } });
    if (!store) {
      return res.status(404).json({ message: 'Store not found for this user.' });
    }

    // Find all ratings for this specific store
    const ratings = await Rating.findAll({ where: { store_id: store.id } });

    // Calculate the average rating for this store
    const avgRatingResult = await Rating.findAll({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('rating')), 'average']],
      where: { store_id: store.id }
    });
    const avgRating = avgRatingResult[0].dataValues.average;

    res.status(200).json({ storeName: store.name, ratings, avgRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Could not retrieve store data.' });
  }
});

module.exports = router;