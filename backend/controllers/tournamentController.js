const Tournament = require('../models/Tournament');
const Turf = require('../models/Turf');

// @desc    Create tournament
// @route   POST /api/tournaments
// @access  Private
exports.createTournament = async (req, res, next) => {
  try {
    req.body.creator = req.user._id;
    
    const tournament = await Tournament.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Tournament created successfully',
      data: tournament
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
exports.getAllTournaments = async (req, res, next) => {
  try {
    const { sport, status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (sport) query.sport = sport;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const total = await Tournament.countDocuments(query);

    const tournaments = await Tournament.find(query)
      .populate('creator', 'name')
      .populate('turf', 'name location')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: tournaments.length,
      total,
      data: tournaments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single tournament
// @route   GET /api/tournaments/:id
// @access  Public
exports.getTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('turf', 'name location')
      .populate('participants.team.captain', 'name email')
      .populate('participants.team.players', 'name');

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    res.status(200).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join tournament
// @route   POST /api/tournaments/:id/join
// @access  Private
exports.joinTournament = async (req, res, next) => {
  try {
    const { teamName, players } = req.body;

    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (tournament.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Tournament registration is closed'
      });
    }

    if (tournament.participants.length >= tournament.maxTeams) {
      return res.status(400).json({
        success: false,
        message: 'Tournament is full'
      });
    }

    // Check if user already joined
    const alreadyJoined = tournament.participants.some(
      p => p.team.captain.toString() === req.user._id.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this tournament'
      });
    }

    tournament.participants.push({
      team: {
        name: teamName,
        captain: req.user._id,
        players: players || []
      },
      paymentStatus: tournament.entryFee > 0 ? 'pending' : 'paid'
    });

    await tournament.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined tournament',
      data: tournament
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Private
exports.updateTournament = async (req, res, next) => {
  try {
    let tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (tournament.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    next(error);
  }
};