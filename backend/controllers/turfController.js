const Turf = require('../models/Turf');
const Booking = require('../models/Booking');

// @desc    Create new turf
// @route   POST /api/turfs
// @access  Private (Turf Owner)
exports.createTurf = async (req, res, next) => {
  try {
    // Add owner to request body
    req.body.owner = req.user._id;

    const turf = await Turf.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Turf created successfully',
      data: turf
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all turfs
// @route   GET /api/turfs
// @access  Public
exports.getAllTurfs = async (req, res, next) => {
  try {
    const { city, sport, search, page = 1, limit = 10 } = req.query;

    // Build query
    let query = { isActive: true };

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

    // Pagination
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
// @access  Private (Turf Owner)
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

// @desc    Delete turf
// @route   DELETE /api/turfs/:id
// @access  Private (Turf Owner)
exports.deleteTurf = async (req, res, next) => {
  try {
    const turf = await Turf.findById(req.params.id);

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
        message: 'Not authorized to delete this turf'
      });
    }

    // Soft delete - mark as inactive
    turf.isActive = false;
    await turf.save();

    res.status(200).json({
      success: true,
      message: 'Turf deleted successfully'
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
      return res.status(400).json({
        success: false,
        message: 'Please provide a date'
      });
    }

    const turf = await Turf.findById(req.params.id);

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: 'Turf not found'
      });
    }

    // Get all bookings for this turf on the given date
    const bookings = await Booking.find({
      turf: req.params.id,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    }).select('startTime endTime');

    res.status(200).json({
      success: true,
      data: {
        turf: {
          id: turf._id,
          name: turf.name,
          pricePerHour: turf.pricePerHour
        },
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
// @access  Private (Turf Owner)
exports.addAnnouncement = async (req, res, next) => {
  try {
    const { message } = req.body;

    const turf = await Turf.findById(req.params.id);

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

    turf.announcements.unshift({
      message,
      createdAt: new Date()
    });

    await turf.save();

    res.status(200).json({
      success: true,
      message: 'Announcement added successfully',
      data: turf.announcements[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update turf condition
// @route   PUT /api/turfs/:id/condition
// @access  Private (Turf Owner)
exports.updateCondition = async (req, res, next) => {
  try {
    const { condition } = req.body;

    const turf = await Turf.findById(req.params.id);

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

    turf.condition = condition;
    await turf.save();

    res.status(200).json({
      success: true,
      message: 'Turf condition updated successfully',
      data: { condition: turf.condition }
    });
  } catch (error) {
    next(error);
  }
};
