const Rewards = require('../models/Rewards');

// @desc    Get user rewards
// @route   GET /api/rewards/me
// @access  Private
exports.getMyRewards = async (req, res, next) => {
  try {
    let rewards = await Rewards.findOne({ user: req.user._id });

    if (!rewards) {
      rewards = await Rewards.create({ user: req.user._id });
    }

    res.status(200).json({
      success: true,
      data: rewards
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard
// @route   GET /api/rewards/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await Rewards.find()
      .populate('user', 'name')
      .sort({ points: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add badge
// @route   POST /api/rewards/badges
// @access  Private
exports.addBadge = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;

    const rewards = await Rewards.findOne({ user: req.user._id });

    if (!rewards) {
      return res.status(404).json({
        success: false,
        message: 'Rewards profile not found'
      });
    }

    rewards.badges.push({
      name,
      description,
      category,
      earnedAt: new Date()
    });

    await rewards.save();

    res.status(200).json({
      success: true,
      message: 'Badge earned!',
      data: rewards
    });
  } catch (error) {
    next(error);
  }
};