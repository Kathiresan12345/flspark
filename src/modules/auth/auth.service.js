const admin = require('../../config/firebase');
const prisma = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

const syncUser = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name } = decodedToken;

    let user = await prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {
        email: email,
        name: name || undefined,
      },
      create: {
        firebaseUid: uid,
        email: email,
        name: name || null,
      },
    });

    return user;
  } catch (error) {
    throw error;
  }
};

const register = async (userData) => {
  const { email, password, name } = userData;
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return { user, token };
};

const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return { user, token };
};

const updateUser = async (userId, updateData) => {
  const { dietPreference, allergies, householdSize, name } = updateData;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      dietPreference,
      allergies,
      householdSize,
      name,
    },
  });

  return user;
};

module.exports = {
  syncUser,
  register,
  login,
  updateUser,
};
