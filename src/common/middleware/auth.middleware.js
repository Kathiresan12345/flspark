const admin = require('../../config/firebase');
const prisma = require('../../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        error_code: 'AUTH_ERROR',
      });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find or sync user in local database
    let user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    });

    if (!user) {
      // Small optimization: if user doesn't exist, we might want to create them
      // but usually /api/auth/sync-user handles this.
      // For now, if user doesn't exist in our DB but has a valid Firebase token,
      // we can either return an error or auto-create.
      // Decided: Auto-create basic profile to avoid friction.
      user = await prisma.user.create({
        data: {
          firebaseUid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || null,
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error_code: 'AUTH_ERROR',
    });
  }
};

module.exports = { authMiddleware };
