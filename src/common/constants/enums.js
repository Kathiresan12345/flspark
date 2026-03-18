const PantrySource = {
  MANUAL: 'manual',
  RECEIPT: 'receipt',
  AI_INFERRED: 'ai_inferred',
};

const ReceiptProcessingStatus = {
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

const RecipeSource = {
  SPOONACULAR: 'spoonacular',
  AI_GENERATED: 'ai_generated',
  INTERNAL: 'internal',
};

const MealType = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack',
};

const NotificationType = {
  EXPIRY_ALERT: 'expiry_alert',
  MEAL_REMINDER: 'meal_reminder',
  SHOPPING_REMINDER: 'shopping_reminder',
  SYSTEM: 'system',
};

module.exports = {
  PantrySource,
  ReceiptProcessingStatus,
  RecipeSource,
  MealType,
  NotificationType,
};
