const prisma = require('../../config/database');

const getMealPlans = async (userId, startDate, endDate) => {
  const where = { userId };
  if (startDate && endDate) {
    where.planDate = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  return await prisma.mealPlan.findMany({
    where,
    include: { recipe: true },
    orderBy: { planDate: 'asc' },
  });
};

const generateWeeklyPlan = async (userId) => {
  // Skeleton implementation: In a real app, this would use Gemini to suggest recipes
  // and then create mealPlan entries for the next 7 days.
  // For now, we'll return a placeholder success.
  return { message: 'Weekly plan feature implementation in progress (requires Gemini tailoring)' };
};

const updateMealPlan = async (id, userId, data) => {
  const existing = await prisma.mealPlan.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    const error = new Error('Meal plan entry not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.mealPlan.update({
    where: { id },
    data: {
      mealType: data.mealType,
      servings: data.servings,
      recipeId: data.recipeId,
    },
  });
};

const deleteMealPlan = async (id, userId) => {
  const existing = await prisma.mealPlan.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    const error = new Error('Meal plan entry not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.mealPlan.delete({
    where: { id },
  });
};

module.exports = {
  getMealPlans,
  generateWeeklyPlan,
  updateMealPlan,
  deleteMealPlan,
};
