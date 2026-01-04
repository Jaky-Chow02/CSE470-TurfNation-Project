const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// This handles the "Auth Check Type: object" issue
const authMiddleware = typeof auth === 'function' ? auth : (auth.auth || auth.protect);

// Mark all as read - MUST be above individual ID route
router.put('/mark-all-read', authMiddleware, notificationController.markAllAsRead);

// Get all notifications
router.get('/', authMiddleware, notificationController.getNotifications);

// Mark single as read
router.put('/:id/read', authMiddleware, notificationController.markAsRead);

module.exports = router;