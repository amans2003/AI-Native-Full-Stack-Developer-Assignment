const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'fallback_jwt_secret',
    { expiresIn: '30d' }
  );
};

const login = async (email, password) => {
  if (!email || !password) {
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user);
  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
    },
    token,
  };
};

const findUserByEmail = async (email) => {
  return User.findOne({ email }).select('-password');
};

const getAllUsersExcept = async (userId) => {
  return User.find({ _id: { $ne: userId } }).select('email name');
};

module.exports = {
  login,
  findUserByEmail,
  getAllUsersExcept,
  generateToken,
};
