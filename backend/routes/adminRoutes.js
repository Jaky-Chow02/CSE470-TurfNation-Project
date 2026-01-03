const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Admin routes - require admin role
router.get('/stats', protect, authorize('admin'), getAdminStats);

module.exports = router;