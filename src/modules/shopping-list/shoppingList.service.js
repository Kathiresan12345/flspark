const prisma = require('../../config/database');

const getShoppingLists = async (userId) => {
  return await prisma.shoppingList.findMany({
    where: { userId },
    include: { _count: { select: { items: true } } },
  });
};

const createShoppingList = async (userId, title) => {
  return await prisma.shoppingList.create({
    data: {
      userId,
      title: title || 'Default Shopping List',
    },
  });
};

const getShoppingListItems = async (listId, userId) => {
  // Check ownership
  const list = await prisma.shoppingList.findFirst({
    where: { id: listId, userId },
  });

  if (!list) {
    const error = new Error('Shopping list not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.shoppingListItem.findMany({
    where: { shoppingListId: listId },
    orderBy: { createdAt: 'desc' },
  });
};

const addShoppingListItem = async (listId, userId, itemData) => {
  const list = await prisma.shoppingList.findFirst({
    where: { id: listId, userId },
  });

  if (!list) {
    const error = new Error('Shopping list not found');
    error.statusCode = 404;
    throw error;
  }

  const { itemName, quantity, unit, category } = itemData;

  return await prisma.shoppingListItem.create({
    data: {
      shoppingListId: listId,
      itemName,
      normalizedName: itemName.toLowerCase().trim(),
      quantity,
      unit,
      category,
    },
  });
};

const updateShoppingListItem = async (itemId, userId, updateData) => {
  const item = await prisma.shoppingListItem.findFirst({
    where: {
      id: itemId,
      shoppingList: { userId },
    },
  });

  if (!item) {
    const error = new Error('Shopping list item not found');
    error.statusCode = 404;
    throw error;
  }

  const { quantity, unit, isPurchased } = updateData;

  return await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: {
      quantity,
      unit,
      isPurchased,
    },
  });
};

const deleteShoppingListItem = async (itemId, userId) => {
  const item = await prisma.shoppingListItem.findFirst({
    where: {
      id: itemId,
      shoppingList: { userId },
    },
  });

  if (!item) {
    const error = new Error('Shopping list item not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.shoppingListItem.delete({
    where: { id: itemId },
  });
};

module.exports = {
  getShoppingLists,
  createShoppingList,
  getShoppingListItems,
  addShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
};
