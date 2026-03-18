const prisma = require('../../config/database');

const getPantryItems = async (userId) => {
  return await prisma.pantryItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

const addPantryItem = async (userId, itemData) => {
  const { itemName, quantity, unit, category, expiryDate, source } = itemData;
  
  // Basic normalization: lowercase and trim
  const normalizedName = itemName.toLowerCase().trim();

  return await prisma.pantryItem.create({
    data: {
      userId,
      itemName,
      normalizedName,
      quantity,
      unit,
      category,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      source: source || 'manual',
    },
  });
};

const updatePantryItem = async (itemId, userId, updateData) => {
  const { quantity, unit, expiryDate } = updateData;

  // Ensure item belongs to user
  const existingItem = await prisma.pantryItem.findFirst({
    where: { id: itemId, userId },
  });

  if (!existingItem) {
    const error = new Error('Pantry item not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }

  return await prisma.pantryItem.update({
    where: { id: itemId },
    data: {
      quantity,
      unit,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    },
  });
};

const deletePantryItem = async (itemId, userId) => {
  const existingItem = await prisma.pantryItem.findFirst({
    where: { id: itemId, userId },
  });

  if (!existingItem) {
    const error = new Error('Pantry item not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }

  return await prisma.pantryItem.delete({
    where: { id: itemId },
  });
};

const getExpiringItems = async (userId) => {
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

  return await prisma.pantryItem.findMany({
    where: {
      userId,
      expiryDate: {
        lte: twoDaysFromNow,
        gte: new Date(), // Already expiring today or soon
      },
    },
    orderBy: { expiryDate: 'asc' },
  });
};

module.exports = {
  getPantryItems,
  addPantryItem,
  updatePantryItem,
  deletePantryItem,
  getExpiringItems,
};
