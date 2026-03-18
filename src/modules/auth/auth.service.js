const admin = require('../../config/firebase');
const prisma = require('../../config/database');

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
  updateUser,
};
