// index.js

const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');

// Import all route files here
const authRoutes = require('./routes/auth');
const storesRoutes = require('./routes/stores');
const ratingsRoutes = require('./routes/ratings');
const usersRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard'); // Correctly placed import

// Import all of your models here
const User = require('./models/User');
const Store = require('./models/Store');
const Rating = require('./models/Rating');

const app = express(); // 'app' is defined here
const PORT = process.env.PORT || 5000;

// Middleware and route connections must come after 'app' is defined
app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Define the relationships between the models
User.hasMany(Store, { foreignKey: 'owner_id', onDelete: 'CASCADE' });
User.hasMany(Rating, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Store.hasMany(Rating, { foreignKey: 'store_id', onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Rating.belongsTo(Store, { foreignKey: 'store_id', onDelete: 'CASCADE' });

// Test API route
app.get('/', (req, res) => {
  res.send('API is running!');
});

// Start the server after testing the database connection and syncing models
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    await sequelize.sync({ force: false });
    console.log('Database and models synchronized.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or sync models:', error);
  }
};

startServer();