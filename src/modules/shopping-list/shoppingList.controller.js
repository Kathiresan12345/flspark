const shoppingListService = require('./shoppingList.service');

const getShoppingLists = async (req, res, next) => {
  try {
    const lists = await shoppingListService.getShoppingLists(req.user.id);
    res.status(200).json({ success: true, data: lists });
  } catch (error) {
    next(error);
  }
};

const createShoppingList = async (req, res, next) => {
  try {
    const list = await shoppingListService.createShoppingList(req.user.id, req.body.title);
    res.status(201).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

const getShoppingListItems = async (req, res, next) => {
  try {
    const items = await shoppingListService.getShoppingListItems(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

const addShoppingListItem = async (req, res, next) => {
  try {
    const item = await shoppingListService.addShoppingListItem(req.params.id, req.user.id, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const updateShoppingListItem = async (req, res, next) => {
  try {
    const updated = await shoppingListService.updateShoppingListItem(req.params.itemId, req.user.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteShoppingListItem = async (req, res, next) => {
  try {
    await shoppingListService.deleteShoppingListItem(req.params.itemId, req.user.id);
    res.status(200).json({ success: true, message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShoppingLists,
  createShoppingList,
  getShoppingListItems,
  addShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
};
