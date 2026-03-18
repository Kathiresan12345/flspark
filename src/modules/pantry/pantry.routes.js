const express = require('express');
const router = express.Router();
const pantryController = require('./pantry.controller');
const { authMiddleware } = require('../../common/middleware/auth.middleware');
const { validate } = require('../../common/middleware/validate.middleware');
const { addPantryItemSchema, updatePantryItemSchema } = require('./pantry.validation');

router.use(authMiddleware);

router.get('/', pantryController.getPantryItems);
router.post('/', validate(addPantryItemSchema), pantryController.addPantryItem);
router.get('/expiring', pantryController.getExpiringItems);
router.put('/:id', validate(updatePantryItemSchema), pantryController.updatePantryItem);
router.delete('/:id', pantryController.deletePantryItem);

module.exports = router;
