const admin = require('../../config/firebase');
const prisma = require('../../config/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const devUid = req.headers['x-dev-uid'];

    // Development Bypass
    if (process.env.NODE_ENV === 'development' && devUid) {
      let user = await prisma.user.findUnique({
        where: { firebaseUid: devUid },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            firebaseUid: devUid,
            email: `${devUid}@example.com`,
            name: null,
          },
        });
      }
      req.user = user;
      return next();
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        error_code: 'AUTH_ERROR',
      });
    }

    const token = authHeader.split(' ')[1];
    
    // 1. Try to verify as Custom JWT (for email/password users)
    try {
      const decodedJwt = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decodedJwt.userId },
      });
      
      if (user) {
        req.user = user;
        return next();
      }
    } catch (jwtError) {
      // If JWT verification fails, fall through to Firebase verification
      // Ignore jwtError as it might just mean it's a Firebase token
    }

    // 2. Try to verify as Firebase Token (for Google/Apple logins)
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find or sync user in local database
    let user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    });

    if (!user) {
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
