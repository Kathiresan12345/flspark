const mealPlanService = require('./mealPlan.service');

const getMealPlans = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const plans = await mealPlanService.getMealPlans(req.user.id, startDate, endDate);
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

const generateMealPlan = async (req, res, next) => {
  try {
    const plan = await mealPlanService.generateWeeklyPlan(req.user.id);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

const updateMealPlan = async (req, res, next) => {
  try {
    const updated = await mealPlanService.updateMealPlan(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteMealPlan = async (req, res, next) => {
  try {
    await mealPlanService.deleteMealPlan(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Meal plan entry deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMealPlans,
  generateMealPlan,
  updateMealPlan,
  deleteMealPlan,
};
