const recipeService = require('./recipe.service');

const getRecipesFromPantry = async (req, res, next) => {
  try {
    const recipes = await recipeService.getRecipesFromPantry(req.user.id);
    res.status(200).json({ success: true, data: recipes });
  } catch (error) {
    next(error);
  }
};

const generateAIRecipes = async (req, res, next) => {
  try {
    const recipes = await recipeService.generateAIRecipes(req.user.id);
    res.status(200).json({ success: true, data: recipes });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecipesFromPantry,
  generateAIRecipes,
};
