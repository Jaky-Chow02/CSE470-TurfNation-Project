const User = require('../models/User');
const Booking = require('../models/Booking');
const Rewards = require('../models/Rewards'); // Changed to plural 'Rewards'

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get User Stats from the User model
    const user = await User.findById(userId).select('statistics goals achievements name');

    // 2. Get Reward info using your existing logic (create if doesn't exist)
    let rewards = await Rewards.findOne({ user: userId });
    if (!rewards) {
      rewards = await Rewards.create({ user: userId });
    }

    // 3. Aggregate Bookings by Sport for charts
    const sportsDistribution = await Booking.aggregate([
      { $match: { user: userId, status: 'confirmed' } },
      { $group: { _id: '$sport', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...rewards.toObject(), // This gives Dashboard.js: level, points, badges, milestones
        statistics: user.statistics,
        userGoals: user.goals,
        sportsStats: sportsDistribution,
        userName: user.name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching dashboard data' });
  }
};