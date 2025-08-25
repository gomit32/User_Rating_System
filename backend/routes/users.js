// routes/users.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// @route   POST /api/users
// @desc    Add a new user (Admin only)
// @access  Private (Admin)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      address,
      password_hash: hashedPassword, // Store the hashed password
      role
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    // Provide more specific error messages if possible, e.g., for duplicate email
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }
    res.status(500).json({ message: 'Server error. Could not add user.' });
  }
});

// @route   GET /api/users
// @desc    Get all users with optional sorting (Admin only)
// @access  Private (Admin)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    // Get sorting parameters from query string, default to sorting by name ascending
    const { sortBy = 'name', order = 'ASC' } = req.query;

    const users = await User.findAll({
      order: [[sortBy, order]] // Apply sorting dynamically
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Could not retrieve users.' });
  }
});

module.exports = router;