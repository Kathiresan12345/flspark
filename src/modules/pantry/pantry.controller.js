const pantryService = require('./pantry.service');

const getPantryItems = async (req, res, next) => {
  try {
    const items = await pantryService.getPantryItems(req.user.id);
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

const addPantryItem = async (req, res, next) => {
  try {
    const item = await pantryService.addPantryItem(req.user.id, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const updatePantryItem = async (req, res, next) => {
  try {
    const updatedItem = await pantryService.updatePantryItem(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    next(error);
  }
};

const deletePantryItem = async (req, res, next) => {
  try {
    await pantryService.deletePantryItem(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
};

const getExpiringItems = async (req, res, next) => {
  try {
    const items = await pantryService.getExpiringItems(req.user.id);
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPantryItems,
  addPantryItem,
  updatePantryItem,
  deletePantryItem,
  getExpiringItems,
};
