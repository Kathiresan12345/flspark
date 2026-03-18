const express = require('express');
const router = express.Router();
const recipeController = require('./recipe.controller');
const { authMiddleware } = require('../../common/middleware/auth.middleware');

router.use(authMiddleware);

router.get('/pantry', recipeController.getRecipesFromPantry);
router.post('/ai', recipeController.generateAIRecipes);

module.exports = router;
