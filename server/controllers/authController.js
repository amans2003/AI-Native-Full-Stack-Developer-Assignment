const authService = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      id: user._id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await authService.getAllUsersExcept(req.user.id);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  getUsers,
};
