const authService = require('./auth.service');

const syncUser = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token required' });
    }
    const user = await authService.syncUser(token);
    
    // Generate JWT token for Firebase users too
    const jwtToken = require('jsonwebtoken').sign(
      { userId: user.id }, 
      process.env.JWT_SECRET || 'super-secret-key-123', 
      { expiresIn: '7d' }
    );
    
    res.status(200).json({ success: true, token: jwtToken, data: user });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    res.status(201).json({ success: true, token, data: user });
  } catch (error) {
    if (error.message === 'User already exists') {
       return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    res.status(200).json({ success: true, token, data: user });
  } catch (error) {
    if (error.message === 'Invalid credentials') {
       return res.status(401).json({ success: false, message: error.message });
    }
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
  register,
  login,
  getProfile,
  updateProfile,
};
