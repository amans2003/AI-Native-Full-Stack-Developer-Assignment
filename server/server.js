const mongoose = require('mongoose');
const { app, seedUsers } = require('./app');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini-google-docs';

console.log('Connecting to MongoDB...');
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected successfully!');
    // Seed users if DB is empty
    await seedUsers();

    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });
