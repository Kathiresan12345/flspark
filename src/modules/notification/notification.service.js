const prisma = require('../../config/database');

const getNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

const markAsRead = async (id, userId) => {
  return await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
};

const markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

const registerDeviceToken = async (userId, fcmToken, platform) => {
  return await prisma.deviceToken.upsert({
    where: { fcmToken },
    update: { userId, platform },
    create: { userId, fcmToken, platform },
  });
};

const createNotification = async (userId, type, title, message) => {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
    },
  });
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  registerDeviceToken,
  createNotification,
};
