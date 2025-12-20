const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const User = require('../models/User');
const Rewards = require('../models/Rewards');
const { generateQRCode, checkTimeOverlap, calculateDuration, calculatePrice, isPastDate } = require('../utils/helpers');
const { getWeather } = require('../utils/weatherService');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { turf, date, startTime, endTime, sport, notes } = req.body;

    // Validate required fields
    if (!turf || !date || !startTime || !endTime || !sport) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if date is in the past
    if (isPastDate(date)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book for past dates'
      });
    }

    // Get turf details
    const turfDetails = await Turf.findById(turf);
    if (!turfDetails) {
      return res.status(404).json({
        success: false,
        message: 'Turf not found'
      });
    }

    // Check if sport is available
    if (!turfDetails.sports.includes(sport)) {
      return res.status(400).json({
        success: false,
        message: 'This sport is not available at this turf'
      });
    }

    // Check for overlapping bookings
    const existingBookings = await Booking.find({
      turf,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    });

    const hasOverlap = existingBookings.some(booking => 
      checkTimeOverlap(startTime, endTime, booking.startTime, booking.endTime)
    );

    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Calculate duration and price
    const duration = calculateDuration(startTime, endTime);
    const amount = calculatePrice(turfDetails.pricePerHour, duration);

    // Get weather data for the booking
    const weatherData = await getWeather(turfDetails.location.city, new Date(date));

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      turf,
      date: new Date(date),
      startTime,
      endTime,
      duration,
      sport,
      payment: {
        amount,
        method: 'card',
        status: 'completed', // Mock payment - instant success
        transactionId: `TXN-${Date.now()}`,
        paidAt: new Date()
      },
      weather: {
        condition: weatherData.condition,
        temperature: weatherData.temperature,
        rainChance: weatherData.rainChance,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed
      },
      notes,
      status: 'confirmed'
    });

    // Generate QR code
    const qrData = {
      bookingId: booking._id,
      turfName: turfDetails.name,
      date: booking.date,
      time: `${startTime} - ${endTime}`,
      user: req.user.name
    };
    booking.qrCode = await generateQRCode(qrData);
    await booking.save();

    // Update user statistics
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'statistics.totalBookings': 1, 'statistics.hoursPlayed': duration }
    });

    // Update rewards
    const rewards = await Rewards.findOne({ user: req.user._id });
    if (rewards) {
      rewards.addPoints(duration * 10); // 10 points per hour
      rewards.achievements.totalBookings += 1;
      rewards.achievements.totalHoursPlayed += duration;
      await rewards.save();
    }

    // Populate turf details
    await booking.populate('turf', 'name location pricePerHour');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for logged in user
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { user: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate('turf', 'name location sports pricePerHour')
      .sort({ date: -1, startTime: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('turf', 'name location sports pricePerHour')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is turf owner
    const turf = await Turf.findById(booking.turf._id);
    if (booking.user._id.toString() !== req.user._id.toString() && 
        turf.owner.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if already cancelled or completed
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancelledBy = req.user._id;
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    booking.payment.status = 'refunded';
    await booking.save();

    // Update user statistics
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'statistics.totalBookings': -1, 'statistics.hoursPlayed': -booking.duration }
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule booking
// @route   PUT /api/bookings/:id/reschedule
// @access  Private
exports.rescheduleBooking = async (req, res, next) => {
  try {
    const { date, startTime, endTime } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this booking'
      });
    }

    // Check if date is in the past
    if (isPastDate(date)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule to past dates'
      });
    }

    // Check for overlapping bookings (excluding current booking)
    const existingBookings = await Booking.find({
      _id: { $ne: booking._id },
      turf: booking.turf,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    });

    const hasOverlap = existingBookings.some(b => 
      checkTimeOverlap(startTime, endTime, b.startTime, b.endTime)
    );

    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Store old booking details
    booking.rescheduledFrom = {
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime
    };

    // Update booking
    booking.date = new Date(date);
    booking.startTime = startTime;
    booking.endTime = endTime;
    booking.duration = calculateDuration(startTime, endTime);
    booking.status = 'rescheduled';

    // Update weather info
    const turf = await Turf.findById(booking.turf);
    const weatherData = await getWeather(turf.location.city, new Date(date));
    booking.weather = {
      condition: weatherData.condition,
      temperature: weatherData.temperature,
      rainChance: weatherData.rainChance,
      humidity: weatherData.humidity,
      windSpeed: weatherData.windSpeed
    };

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for turf owner
// @route   GET /api/bookings/turf/:turfId
// @access  Private (Turf Owner)
exports.getTurfBookings = async (req, res, next) => {
  try {
    const turf = await Turf.findById(req.params.turfId);

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: 'Turf not found'
      });
    }

    // Check ownership
    if (turf.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { date, status } = req.query;
    let query = { turf: req.params.turfId };

    if (date) {
      query.date = new Date(date);
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};