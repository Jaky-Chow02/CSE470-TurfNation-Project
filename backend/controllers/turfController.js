const Turf = require('../models/Turf');
const Booking = require('../models/Booking');
const { createNotification } = require('./notificationController');

// @desc    Create new turf (Request)
// @route   POST /api/turfs
// @access  Private (Turf Owner)
exports.createTurf = async (req, res, next) => {
  try {
    // Add owner to request body
    req.body.owner = req.user._id;
    
    // Set default status for new requests
    req.body.isApproved = false;
    req.body.isActive = false;

    const turf = await Turf.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Turf registration request submitted successfully',
      data: turf
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all turfs (Public list + Admin view)
// @route   GET /api/turfs
// @access  Public (Optional Auth for Admin view)
exports.getAllTurfs = async (req, res, next) => {
  try {
    const { city, sport, search, page = 1, limit = 10 } = req.query;

    // Build base query
    let query = {};

    // LOGIC: If the user is NOT an admin (or not logged in), 
    // they ONLY see active and approved turfs.
    // If the user IS an admin, the query stays empty {}, showing EVERYTHING.
    if (!req.user || req.user.role !== 'admin') {
      query.isActive = true;
      query.isApproved = true;
    }

    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    if (sport) {
      query.sports = sport;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Turf.countDocuments(query);

    const turfs = await Turf.find(query)
      .populate('owner', 'name email phone')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: turfs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: turfs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get turfs belonging to the logged in owner
// @route   GET /api/turfs/my-turfs
// @access  Private (Owner)
exports.getOwnerTurfs = async (req, res, next) => {
  try {
    const turfs = await Turf.find({ owner: req.user._id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: turfs.length,
      data: turfs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a turf request
// @route   PUT /api/turfs/:id/approve
// @access  Private (Admin only)
exports.approveTurf = async (req, res, next) => {
  try {
    const turf = await Turf.findById(req.params.id);

    if (!turf) {
      return res.status(404).json({ success: false, message: 'Turf not found' });
    }

    turf.isApproved = true;
    turf.isActive = true;
    await turf.save();

    // Notify the owner
    try {
      await createNotification(
        turf.owner,
        `Great news! Your turf "${turf.name}" has been approved and is now live for bookings.`,
        'info'
      );
    } catch (notifErr) {
      console.error("Notification failed but turf was approved:", notifErr);
    }

    res.status(200).json({
      success: true,
      message: 'Turf approved successfully',
      data: turf
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single turf
// @route   GET /api/turfs/:id
// @access  Public
exports.getTurf = async (req, res, next) => {
  try {
    const turf = await Turf.findById(req.params.id).populate('owner', 'name email phone');

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: 'Turf not found'
      });
    }

    res.status(200).json({
      success: true,
      data: turf
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update turf
// @route   PUT /api/turfs/:id
// @access  Private (Turf Owner/Admin)
exports.updateTurf = async (req, res, next) => {
  try {
    let turf = await Turf.findById(req.params.id);

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
        message: 'Not authorized to update this turf'
      });
    }

    turf = await Turf.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Turf updated successfully',
      data: turf
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Reject turf
// @route   DELETE /api/turfs/:id
// @access  Private (Turf Owner/Admin)
exports.deleteTurf = async (req, res, next) => {
  try {
    const turf = await Turf.findById(req.params.id);

    if (!turf) {
      return res.status(404).json({ success: false, message: 'Turf not found' });
    }

    // Check ownership/role
    if (turf.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Turf.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Turf removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get turf availability
// @route   GET /api/turfs/:id/availability
// @access  Public
exports.getTurfAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Please provide a date' });
    }

    const turf = await Turf.findById(req.params.id);

    if (!turf) {
      return res.status(404).json({ success: false, message: 'Turf not found' });
    }

    const bookings = await Booking.find({
      turf: req.params.id,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    }).select('startTime endTime');

    res.status(200).json({
      success: true,
      data: {
        turf: { id: turf._id, name: turf.name, pricePerHour: turf.pricePerHour },
        date,
        bookedSlots: bookings,
        availability: turf.availability
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add announcement
// @route   POST /api/turfs/:id/announcement
// @access  Private (Turf Owner/Admin)
exports.addAnnouncement = async (req, res, next) => {
  try {
    const { message } = req.body;
    const turf = await Turf.findById(req.params.id);

    if (!turf) return res.status(404).json({ success: false, message: 'Turf not found' });

    if (turf.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    turf.announcements.unshift({ message, createdAt: new Date() });
    await turf.save();

    res.status(200).json({ success: true, message: 'Announcement added', data: turf.announcements[0] });
  } catch (error) { next(error); }
};

// @desc    Update turf condition
// @route   PUT /api/turfs/:id/condition
// @access  Private (Turf Owner/Admin)
exports.updateCondition = async (req, res, next) => {
  try {
    const { condition } = req.body;
    const turf = await Turf.findById(req.params.id);

    if (!turf) return res.status(404).json({ success: false, message: 'Turf not found' });

    if (turf.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    turf.condition = condition;
    await turf.save();

    res.status(200).json({ success: true, message: 'Condition updated', data: { condition: turf.condition } });
  } catch (error) { next(error); }
};