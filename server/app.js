const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Database seeding function
const seedUsers = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding demo users...');
      
      const user1 = new User({
        email: 'user1@example.com',
        password: '123456', // Will be hashed by pre-save hook
        name: 'User One',
      });
      
      const user2 = new User({
        email: 'user2@example.com',
        password: '123456', // Will be hashed by pre-save hook
        name: 'User Two',
      });

      await user1.save();
      await user2.save();
      console.log('Demo users seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

module.exports = { app, seedUsers };
