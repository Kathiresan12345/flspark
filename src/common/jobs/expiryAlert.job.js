const prisma = require('../../config/database');
const { createNotification } = require('../../modules/notification/notification.service');

const runExpiryAlertJob = async () => {
  console.log('Running Expiry Alert Job...');
  
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
  twoDaysFromNow.setHours(23, 59, 59, 999);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Find all pantry items expiring within 2 days that haven't been notified yet
    // Or just fetch all and group by user
    const expiringItems = await prisma.pantryItem.findMany({
      where: {
        expiryDate: {
          lte: twoDaysFromNow,
          gte: today,
        },
      },
      include: { user: true },
    });

    if (expiringItems.length === 0) {
      console.log('No expiring items found.');
      return;
    }

    // Group items by user
    const userMap = {};
    for (const item of expiringItems) {
      if (!userMap[item.userId]) {
        userMap[item.userId] = [];
      }
      userMap[item.userId].push(item.itemName);
    }

    // Create notifications
    for (const userId in userMap) {
      const items = userMap[userId];
      const itemsList = items.join(', ');
      
      await createNotification(
        userId,
        'expiry_alert',
        'Pantry Items Expiring Soon',
        `The following items in your pantry are expiring within 2 days: ${itemsList}. Consider using them soon!`
      );
      
      console.log(`Notification sent to user ${userId} for ${items.length} items.`);
    }

    console.log('Expiry Alert Job completed successfully.');
  } catch (error) {
    console.error('Error in Expiry Alert Job:', error);
  }
};

module.exports = { runExpiryAlertJob };
