const prisma = require('../../config/database');
const { createNotification } = require('../../modules/notification/notification.service');

const runMealReminderJob = async () => {
  console.log('Running Meal Reminder Job...');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  try {
    // Find meal plans for today
    const plans = await prisma.mealPlan.findMany({
      where: {
        planDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: { 
        user: true,
        recipe: true
      },
    });

    for (const plan of plans) {
      await createNotification(
        plan.userId,
        'meal_reminder',
        `Time for ${plan.mealType.charAt(0).toUpperCase() + plan.mealType.slice(1)}!`,
        `Don't forget to cook "${plan.recipe.title}" today. Enjoy your meal!`
      );
    }

    console.log(`Meal reminders sent to ${plans.length} users.`);
  } catch (error) {
    console.error('Error in Meal Reminder Job:', error);
  }
};

module.exports = { runMealReminderJob };
