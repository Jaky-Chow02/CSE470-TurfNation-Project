const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const User = require('../models/User');
const Rewards = require('../models/Rewards');
const { generateQRCode, checkTimeOverlap, calculateDuration, calculatePrice, isPastDate } = require('../utils/helpers');
const { getWeather } = require('../utils/weatherService');
const { createNotification } = require('./notificationController');

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('turf', 'name location images')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for a specific turf (For Owners)
// @route   GET /api/bookings/turf/:turfId
// @access  Private (Owner/Admin)
exports.getTurfBookings = async (req, res, next) => {
  try {
    const turf = await Turf.findById(req.params.turfId);

    if (!turf) {
      return res.status(404).json({ success: false, message: 'Turf not found' });
    }

    // Security check: Only owner or admin
    if (turf.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const bookings = await Booking.find({ turf: req.params.turfId })
      .populate('user', 'name email phone')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
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
      .populate('turf', 'name location owner')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check ownership
    if (booking.user._id.toString() !== req.user._id.toString() && 
        booking.turf.owner.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { turf, date, startTime, endTime, sport, notes } = req.body;

    if (!turf || !date || !startTime || !endTime || !sport) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (isPastDate(date)) {
      return res.status(400).json({ success: false, message: 'Cannot book for past dates' });
    }

    const turfDetails = await Turf.findById(turf);
    if (!turfDetails) {
      return res.status(404).json({ success: false, message: 'Turf not found' });
    }

    if (!turfDetails.sports.includes(sport)) {
      return res.status(400).json({ success: false, message: 'This sport is not available at this turf' });
    }

    const existingBookings = await Booking.find({
      turf,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    });

    const hasOverlap = existingBookings.some(booking => 
      checkTimeOverlap(startTime, endTime, booking.startTime, booking.endTime)
    );

    if (hasOverlap) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked' });
    }

    const duration = calculateDuration(startTime, endTime);
    const amount = calculatePrice(turfDetails.pricePerHour, duration);
    const weatherData = await getWeather(turfDetails.location.city, new Date(date));

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
        status: 'completed',
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

    const qrData = {
      bookingId: booking._id,
      turfName: turfDetails.name,
      date: booking.date,
      time: `${startTime} - ${endTime}`,
      user: req.user.name
    };
    booking.qrCode = await generateQRCode(qrData);
    await booking.save();

    // NOTIFICATIONS
    await createNotification(req.user._id, `Booking Confirmed! Your slot at ${turfDetails.name} is ready for ${new Date(date).toLocaleDateString()}.`, 'booking');
    await createNotification(turfDetails.owner, `New Booking Alert: ${req.user.name} has booked your turf for ${new Date(date).toLocaleDateString()} at ${startTime}.`, 'booking');

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'statistics.totalBookings': 1, 'statistics.hoursPlayed': duration }
    });

    const rewards = await Rewards.findOne({ user: req.user._id });
    if (rewards) {
      rewards.addPoints(duration * 10);
      rewards.achievements.totalBookings += 1;
      rewards.achievements.totalHoursPlayed += duration;
      await rewards.save();
    }

    await booking.populate('turf', 'name location pricePerHour');

    res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });
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
    const booking = await Booking.findById(req.params.id).populate('turf', 'name owner');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Already cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancelledBy = req.user._id;
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    booking.payment.status = 'refunded';
    await booking.save();

    // NOTIFICATIONS
    await createNotification(req.user._id, `Your booking for ${booking.turf.name} has been successfully cancelled.`, 'booking');
    await createNotification(booking.turf.owner, `Booking Cancelled: The slot for ${new Date(booking.date).toLocaleDateString()} at ${booking.turf.name} is now available again.`, 'booking');

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'statistics.totalBookings': -1, 'statistics.hoursPlayed': -booking.duration }
    });

    res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
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
    const booking = await Booking.findById(req.params.id).populate('turf', 'name owner location');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (isPastDate(date)) {
      return res.status(400).json({ success: false, message: 'Cannot reschedule to past dates' });
    }

    const existingBookings = await Booking.find({
      _id: { $ne: booking._id },
      turf: booking.turf._id,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    });

    const hasOverlap = existingBookings.some(b => 
      checkTimeOverlap(startTime, endTime, b.startTime, b.endTime)
    );

    if (hasOverlap) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked' });
    }

    booking.rescheduledFrom = {
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime
    };

    booking.date = new Date(date);
    booking.startTime = startTime;
    booking.endTime = endTime;
    booking.duration = calculateDuration(startTime, endTime);
    booking.status = 'rescheduled';

    const weatherData = await getWeather(booking.turf.location.city, new Date(date));
    booking.weather = {
      condition: weatherData.condition,
      temperature: weatherData.temperature,
      rainChance: weatherData.rainChance,
      humidity: weatherData.humidity,
      windSpeed: weatherData.windSpeed
    };

    await booking.save();

    // NOTIFICATIONS
    await createNotification(req.user._id, `Booking Rescheduled: Your visit to ${booking.turf.name} is now set for ${new Date(date).toLocaleDateString()} at ${startTime}.`, 'booking');
    await createNotification(booking.turf.owner, `Reschedule Alert: A booking for ${booking.turf.name} has been moved to ${new Date(date).toLocaleDateString()}.`, 'booking');

    res.status(200).json({ success: true, message: 'Booking rescheduled successfully', data: booking });
  } catch (error) {
    next(error);
  }
};