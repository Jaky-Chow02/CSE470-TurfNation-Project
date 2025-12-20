const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  location: {
    city: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String // HH:MM format
  },
  condition: {
    type: String,
    enum: ['Clear', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Heavy Rain', 'Thunderstorm', 'Drizzle', 'Foggy', 'Windy'],
    required: true
  },
  temperature: {
    type: Number, // in Celsius
    required: true
  },
  feelsLike: {
    type: Number
  },
  humidity: {
    type: Number, // percentage
    required: true
  },
  windSpeed: {
    type: Number, // km/h
    required: true
  },
  rainChance: {
    type: Number, // percentage
    default: 0
  },
  visibility: {
    type: Number, // in km
    default: 10
  },
  uvIndex: {
    type: Number,
    min: 0,
    max: 11
  },
  isSuitableForPlay: {
    type: Boolean,
    default: true
  },
  alerts: [{
    type: {
      type: String,
      enum: ['rain', 'storm', 'heat', 'cold', 'wind']
    },
    message: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  source: {
    type: String,
    enum: ['api', 'mock'],
    default: 'mock'
  },
  fetchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for querying weather by location and date
weatherSchema.index({ 'location.city': 1, date: 1 });

// TTL index to automatically delete old weather data after 7 days
weatherSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('Weather', weatherSchema);