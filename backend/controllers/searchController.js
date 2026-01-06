// backend/controllers/searchController.js
const Turf = require('../models/Turf');
const Booking = require('../models/Booking');

/**
 * Get search suggestions as user types
 */
const getSearchSuggestions = async (req, res) => {
  try {
    const { query, type = 'all' } = req.query;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    const suggestions = {
      turfs: [],
      locations: [],
      sports: []
    };

    // Create case-insensitive regex for searching
    const searchRegex = new RegExp(query, 'i');

    // Search turfs by name
    if (type === 'all' || type === 'turfs') {
      const turfs = await Turf.find({
        name: searchRegex,
        isActive: true
      })
      .select('name location sportType pricePerHour')
      .limit(5);

      suggestions.turfs = turfs.map(turf => ({
        type: 'turf',
        id: turf._id,
        name: turf.name,
        location: turf.location?.address || 'Location not specified',
        sportType: turf.sportType,
        price: turf.pricePerHour
      }));
    }

    // Search locations
    if (type === 'all' || type === 'locations') {
      const locationTurfs = await Turf.find({
        $or: [
          { 'location.address': searchRegex },
          { 'location.city': searchRegex },
          { 'location.area': searchRegex }
        ],
        isActive: true
      })
      .select('location')
      .limit(5);

      // Extract unique locations
      const uniqueLocations = new Set();
      locationTurfs.forEach(turf => {
        if (turf.location?.area) {
          uniqueLocations.add(turf.location.area);
        }
        if (turf.location?.city) {
          uniqueLocations.add(turf.location.city);
        }
      });

      suggestions.locations = Array.from(uniqueLocations).slice(0, 5).map(loc => ({
        type: 'location',
        name: loc
      }));
    }

    // Search sports
    if (type === 'all' || type === 'sports') {
      const sports = ['Football', 'Cricket', 'Basketball', 'Badminton', 'Tennis', 'Volleyball'];
      suggestions.sports = sports
        .filter(sport => sport.toLowerCase().includes(query.toLowerCase()))
        .map(sport => ({
          type: 'sport',
          name: sport
        }));
    }

    // Flatten all suggestions
    const allSuggestions = [
      ...suggestions.turfs,
      ...suggestions.locations,
      ...suggestions.sports
    ];

    res.json({
      success: true,
      suggestions: allSuggestions,
      count: allSuggestions.length
    });

  } catch (error) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      suggestions: []
    });
  }
};

/**
 * Advanced search with filters
 */
const searchTurfs = async (req, res) => {
  try {
    const {
      query,
      location,
      sportType,
      date,
      startTime,
      endTime,
      minPrice,
      maxPrice,
      sortBy = 'relevance',
      page = 1,
      limit = 10
    } = req.query;

    // Build search filter
    const filter = { isActive: true };

    // Text search across multiple fields
    if (query) {
      filter.$or = [
        { name: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { 'location.address': new RegExp(query, 'i') },
        { 'location.area': new RegExp(query, 'i') },
        { 'location.city': new RegExp(query, 'i') }
      ];
    }

    // Filter by location
    if (location) {
      filter.$or = filter.$or || [];
      filter.$or.push(
        { 'location.address': new RegExp(location, 'i') },
        { 'location.area': new RegExp(location, 'i') },
        { 'location.city': new RegExp(location, 'i') }
      );
    }

    // Filter by sport type
    if (sportType) {
      filter.sportType = sportType;
    }

    // Filter by price range
    if (minPrice) {
      filter.pricePerHour = { ...filter.pricePerHour, $gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      filter.pricePerHour = { ...filter.pricePerHour, $lte: parseFloat(maxPrice) };
    }

    // Build sort criteria
    let sort = {};
    switch (sortBy) {
      case 'price_low':
        sort = { pricePerHour: 1 };
        break;
      case 'price_high':
        sort = { pricePerHour: -1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { name: 1 }; // Default alphabetical
    }

    // Execute search with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [turfs, total] = await Promise.all([
      Turf.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      Turf.countDocuments(filter)
    ]);

    // If date and time specified, check availability
    let turfsWithAvailability = turfs;
    if (date && startTime && endTime) {
      turfsWithAvailability = await checkTurfAvailability(
        turfs,
        date,
        startTime,
        endTime
      );
    }

    res.json({
      success: true,
      turfs: turfsWithAvailability,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalResults: total,
        resultsPerPage: parseInt(limit)
      },
      filters: {
        query,
        location,
        sportType,
        minPrice,
        maxPrice,
        date,
        startTime,
        endTime
      }
    });

  } catch (error) {
    console.error('Error searching turfs:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

/**
 * Check availability for turfs
 */
const checkTurfAvailability = async (turfs, date, startTime, endTime) => {
  const startDateTime = new Date(`${date}T${startTime}`);
  const endDateTime = new Date(`${date}T${endTime}`);

  const turfsWithAvailability = await Promise.all(
    turfs.map(async (turf) => {
      const turfObj = turf.toObject();

      // Check for conflicting bookings
      const conflictingBooking = await Booking.findOne({
        turf: turf._id,
        status: { $in: ['confirmed', 'pending'] },
        $or: [
          {
            slotStartTime: { $lt: endDateTime },
            slotEndTime: { $gt: startDateTime }
          }
        ]
      });

      turfObj.isAvailable = !conflictingBooking;
      return turfObj;
    })
  );

  return turfsWithAvailability;
};

/**
 * Get popular searches
 */
const getPopularSearches = async (req, res) => {
  try {
    // Get most booked turfs
    const popularTurfs = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$turf', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const turfIds = popularTurfs.map(p => p._id);
    const turfs = await Turf.find({ _id: { $in: turfIds } })
      .select('name sportType location');

    // Get popular locations
    const popularLocations = await Turf.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$location.area', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get popular sports
    const popularSports = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$sportType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      popular: {
        turfs: turfs.map(t => ({ name: t.name, sportType: t.sportType })),
        locations: popularLocations.map(l => l._id).filter(Boolean),
        sports: popularSports.map(s => s._id).filter(Boolean)
      }
    });

  } catch (error) {
    console.error('Error getting popular searches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular searches'
    });
  }
};

/**
 * Search nearby turfs using geolocation
 */
const searchNearby = async (req, res) => {
  try {
    const { lat, lon, radius = 5000, sportType, limit = 10 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const filter = {
      isActive: true,
      'location.coordinates': { $exists: true }
    };

    if (sportType) {
      filter.sportType = sportType;
    }

    // GeoNear search
    const nearbyTurfs = await Turf.find({
      ...filter,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lon), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) // in meters
        }
      }
    })
    .limit(parseInt(limit))
    .select('-__v');

    // Calculate distance for each turf
    const turfsWithDistance = nearbyTurfs.map(turf => {
      const turfObj = turf.toObject();
      if (turf.location?.coordinates) {
        const [turfLon, turfLat] = turf.location.coordinates;
        turfObj.distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lon),
          turfLat,
          turfLon
        );
      }
      return turfObj;
    });

    res.json({
      success: true,
      turfs: turfsWithDistance,
      count: turfsWithDistance.length,
      searchCenter: { lat: parseFloat(lat), lon: parseFloat(lon) },
      radius: parseInt(radius)
    });

  } catch (error) {
    console.error('Error searching nearby turfs:', error);
    res.status(500).json({
      success: false,
      message: 'Nearby search failed',
      error: error.message
    });
  }
};

/**
 * Calculate distance between two points (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2); // Distance in km
};

const toRad = (value) => (value * Math.PI) / 180;

module.exports = {
  getSearchSuggestions,
  searchTurfs,
  getPopularSearches,
  searchNearby
};