const prisma = require('../../config/database');
const { generateRecipesFromPantry } = require('./gemini.service');
const hashIngredients = require('../../common/utils/hashIngredients');
const normalizeIngredient = require('../../common/utils/normalizeIngredient');

const getRecipesFromPantry = async (userId) => {
  // 1. Get pantry items
  const pantryItems = await prisma.pantryItem.findMany({
    where: { userId },
  });

  if (pantryItems.length === 0) {
    return [];
  }

  const ingredientNames = pantryItems.map(item => normalizeIngredient(item.itemName));
  
  // 2. Check Cache
  const ingredientHash = hashIngredients(ingredientNames);
  
  const cached = await prisma.recipeCache.findUnique({
    where: { ingredientHash },
  });

  if (cached && cached.expiresAt > new Date()) {
    return cached.responsePayload;
  }

  // 3. Generate with Gemini
  const recipes = await generateRecipesFromPantry(ingredientNames);

  // 4. Update Cache
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1); // 24h cache

  await prisma.recipeCache.upsert({
    where: { ingredientHash },
    update: {
      responsePayload: recipes,
      expiresAt,
    },
    create: {
      ingredientHash,
      responsePayload: recipes,
      source: 'gemini',
      expiresAt,
    },
  });

  return recipes;
};

const generateAIRecipes = async (userId) => {
  // Similar to getRecipesFromPantry but could be more tailored
  return await getRecipesFromPantry(userId);
};

module.exports = {
  getRecipesFromPantry,
  generateAIRecipes,
};
