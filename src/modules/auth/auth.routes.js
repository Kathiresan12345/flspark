const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authMiddleware } = require('../../common/middleware/auth.middleware');
const { validate } = require('../../common/middleware/validate.middleware');
const { syncUserSchema, updateProfileSchema } = require('./auth.validation');

router.post('/sync-user', validate(syncUserSchema), authController.syncUser);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;
