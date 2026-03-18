const express = require('express');
const router = express.Router();
const mealPlanController = require('./mealPlan.controller');
const { authMiddleware } = require('../../common/middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', mealPlanController.getMealPlans);
router.post('/generate', mealPlanController.generateMealPlan);
router.put('/:id', mealPlanController.updateMealPlan);
router.delete('/:id', mealPlanController.deleteMealPlan);

module.exports = router;
