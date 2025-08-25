// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// Middleware to verify the JWT token
exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adds the user's data (id, role) to the request object
    next();
  } catch (e) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if the user is a System Admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'SystemAdmin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

// Middleware to check if the user is a Store Owner
exports.isStoreOwner = (req, res, next) => {
  if (req.user.role !== 'StoreOwner') {
    return res.status(403).json({ message: 'Access denied: Store Owners only' });
  }
  next();
};