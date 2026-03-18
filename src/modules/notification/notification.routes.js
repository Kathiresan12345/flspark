const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { authMiddleware } = require('../../common/middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.post('/device-token', notificationController.registerDeviceToken);

module.exports = router;
