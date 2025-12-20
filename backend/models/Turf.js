const mongoose = require('mongoose');

const turfSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide turf name'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  sports: [{
    type: String,
    enum: ['Football', 'Cricket', 'Badminton', 'Tennis', 'Basketball', 'Volleyball', 'Hockey', 'Table Tennis']
  }],
  facilities: [{
    type: String,
    enum: ['Parking', 'Washroom', 'Changing Room', 'Drinking Water', 'First Aid', 'Cafeteria', 'Lighting', 'Seating']
  }],
  images: [{
    type: String
  }],
  pricePerHour: {
    type: Number,
    required: [true, 'Please provide price per hour']
  },
  availability: {
    monday: { open: String, close: String, available: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, available: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, available: { type: Boolean, default: true } },
    thursday: { open: String, close: String, available: { type: Boolean, default: true } },
    friday: { open: String, close: String, available: { type: Boolean, default: true } },
    saturday: { open: String, close: String, available: { type: Boolean, default: true } },
    sunday: { open: String, close: String, available: { type: Boolean, default: true } }
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Under Maintenance'],
    default: 'Good'
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  announcements: [{
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for location-based searches
turfSchema.index({ 'location.city': 1, sports: 1 });

module.exports = mongoose.model('Turf', turfSchema);