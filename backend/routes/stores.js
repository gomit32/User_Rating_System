// routes/stores.js

const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { Sequelize } = require('sequelize');

// @route   POST /api/stores
// @desc    Add a new store (Admin only)
// @access  Private (Admin)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, address, owner_id } = req.body;
    const newStore = await Store.create({ name, address, owner_id });
    res.status(201).json(newStore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Could not add store.' });
  }
});

// @route   GET /api/stores
// @desc    Get all stores with average ratings and optional sorting
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Get sorting parameters from query string, default to sorting by name ascending
    const { sortBy = 'name', order = 'ASC' } = req.query;

    const stores = await Store.findAll({
      attributes: [
        'id',
        'name',
        'address',
        [Sequelize.fn('AVG', Sequelize.col('Ratings.rating')), 'overall_rating']
      ],
      include: [{
        model: Rating,
        attributes: []
      }],
      group: ['Store.id'],
      order: [[sortBy, order]] // Apply dynamic sorting here
    });
    res.status(200).json(stores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Could not retrieve stores.' });
  }
});

module.exports = router;