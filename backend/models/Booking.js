const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  turf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turf',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide booking date']
  },
  startTime: {
    type: String,
    required: [true, 'Please provide start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please provide end time']
  },
  duration: {
    type: Number, // in hours
    required: true
  },
  sport: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'],
    default: 'pending'
  },
  payment: {
    amount: {
      type: Number,
      required: true
    },
    method: {
      type: String,
      enum: ['card', 'mobile_banking', 'cash'],
      default: 'card'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  qrCode: {
    type: String // Base64 encoded QR code
  },
  receipt: {
    receiptId: String,
    generatedAt: Date
  },
  weather: {
    condition: String,
    temperature: Number,
    rainChance: Number,
    humidity: Number,
    windSpeed: Number
  },
  notes: {
    type: String
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String
  },
  cancelledAt: {
    type: Date
  },
  rescheduledFrom: {
    date: Date,
    startTime: String,
    endTime: String
  },
  notificationsSent: {
    confirmation: { type: Boolean, default: false },
    reminder: { type: Boolean, default: false },
    weatherAlert: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for querying bookings by date and turf
bookingSchema.index({ turf: 1, date: 1, startTime: 1 });
bookingSchema.index({ user: 1, status: 1 });

// Generate receipt ID before saving
bookingSchema.pre('save', function(next) {
  if (!this.receipt.receiptId) {
    this.receipt.receiptId = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    this.receipt.generatedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);