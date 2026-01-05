const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth'); // Changed from { auth } to { protect }

router.get('/dashboard-stats', protect, userController.getDashboardData);

module.exports = router;