const authService = require('./auth.service');

const syncUser = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token required' });
    }
    const user = await authService.syncUser(token);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await authService.updateUser(req.user.id, req.body);
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  syncUser,
  getProfile,
  updateProfile,
};
