const User = require('../models/User');
const Turf = require('../models/Turf');
const Booking = require('../models/Booking');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getAdminStats = async (req, res, next) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get total bookings
    const totalBookings = await Booking.countDocuments();

    // Get total revenue
    const revenueData = await Booking.aggregate([
      {
        $match: {
          'payment.status': { $in: ['completed', 'paid'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$payment.amount' }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Get active turfs
    const activeTurfs = await Turf.countDocuments({ isActive: true });

    // Get recent 10 bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('turf', 'name location')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBookings,
        totalRevenue,
        activeTurfs,
        recentBookings
      }
    });
  } catch (error) {
    next(error);
  }
};