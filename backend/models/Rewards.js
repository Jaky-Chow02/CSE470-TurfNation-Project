const mongoose = require('mongoose');

const rewardsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0
  },
  level: {
    current: {
      type: Number,
      default: 1
    },
    name: {
      type: String,
      default: 'Beginner'
    },
    pointsToNextLevel: {
      type: Number,
      default: 100
    }
  },
  badges: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['bookings', 'hours', 'sports', 'tournaments', 'social', 'special']
    }
  }],
  achievements: {
    totalBookings: {
      type: Number,
      default: 0
    },
    totalHoursPlayed: {
      type: Number,
      default: 0
    },
    uniqueSportsPlayed: {
      type: Number,
      default: 0
    },
    tournamentsParticipated: {
      type: Number,
      default: 0
    },
    tournamentsWon: {
      type: Number,
      default: 0
    },
    consecutiveDaysPlayed: {
      type: Number,
      default: 0
    },
    friendsReferred: {
      type: Number,
      default: 0
    }
  },
  milestones: [{
    title: String,
    description: String,
    requirement: Number,
    currentProgress: Number,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    reward: {
      points: Number,
      badge: String
    }
  }],
  streaks: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastPlayedDate: Date
  },
  rewards: [{
    type: {
      type: String,
      enum: ['discount', 'free_hour', 'priority_booking', 'special_access']
    },
    value: String,
    description: String,
    expiresAt: Date,
    isUsed: {
      type: Boolean,
      default: false
    },
    usedAt: Date
  }],
  leaderboard: {
    rank: Number,
    lastUpdated: Date
  },
  preferences: {
    notifyOnMilestone: {
      type: Boolean,
      default: true
    },
    notifyOnBadge: {
      type: Boolean,
      default: true
    },
    shareAchievements: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Calculate level based on points
rewardsSchema.methods.calculateLevel = function() {
  const pointsThresholds = [
    { level: 1, name: 'Beginner', min: 0, max: 99 },
    { level: 2, name: 'Amateur', min: 100, max: 249 },
    { level: 3, name: 'Regular', min: 250, max: 499 },
    { level: 4, name: 'Pro', min: 500, max: 999 },
    { level: 5, name: 'Expert', min: 1000, max: 1999 },
    { level: 6, name: 'Master', min: 2000, max: 4999 },
    { level: 7, name: 'Legend', min: 5000, max: Infinity }
  ];

  for (const threshold of pointsThresholds) {
    if (this.points >= threshold.min && this.points <= threshold.max) {
      this.level.current = threshold.level;
      this.level.name = threshold.name;
      const nextThreshold = pointsThresholds[threshold.level];
      this.level.pointsToNextLevel = nextThreshold ? nextThreshold.min - this.points : 0;
      break;
    }
  }
};

// Add points
rewardsSchema.methods.addPoints = function(points) {
  this.points += points;
  this.calculateLevel();
};

module.exports = mongoose.model('Rewards', rewardsSchema);