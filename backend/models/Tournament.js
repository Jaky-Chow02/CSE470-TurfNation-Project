const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide tournament name'],
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  turf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turf',
    required: true
  },
  sport: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['knockout', 'league', 'friendly'],
    default: 'knockout'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  maxTeams: {
    type: Number,
    required: true,
    min: 2
  },
  minPlayersPerTeam: {
    type: Number,
    default: 5
  },
  maxPlayersPerTeam: {
    type: Number,
    default: 11
  },
  entryFee: {
    type: Number,
    default: 0
  },
  prizePool: {
    first: Number,
    second: Number,
    third: Number
  },
  status: {
    type: String,
    enum: ['draft', 'open', 'registration_closed', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  participants: [{
    team: {
      name: String,
      captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      stats: {
        played: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
        lost: { type: Number, default: 0 },
        points: { type: Number, default: 0 }
      }
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending'
    }
  }],
  matches: [{
    round: String,
    team1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    team2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: Date,
    time: String,
    score: {
      team1: Number,
      team2: Number
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled'
    }
  }],
  rules: [{
    type: String
  }],
  isApprovedByTurf: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for searching tournaments
tournamentSchema.index({ sport: 1, status: 1, startDate: 1 });

module.exports = mongoose.model('Tournament', tournamentSchema);