const express = require('express');
const router = express.Router();
const shoppingListController = require('./shoppingList.controller');
const { authMiddleware } = require('../../common/middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', shoppingListController.getShoppingLists);
router.post('/', shoppingListController.createShoppingList);
router.get('/:id/items', shoppingListController.getShoppingListItems);
router.post('/:id/items', shoppingListController.addShoppingListItem);
router.put('/items/:itemId', shoppingListController.updateShoppingListItem);
router.delete('/items/:itemId', shoppingListController.deleteShoppingListItem);

module.exports = router;
