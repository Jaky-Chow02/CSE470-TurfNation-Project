const express = require('express');
const router = express.Router();
const { getMyRewards, getLeaderboard, addBadge } = require('../controllers/rewardsController');
const { protect } = require('../middleware/auth');

router.get('/leaderboard', getLeaderboard);

router.use(protect);
router.get('/me', getMyRewards);
router.post('/badges', addBadge);

module.exports = router;
